import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission | 'default';
  loading: boolean;
}

export const usePushNotifications = (userId: string | undefined) => {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isSubscribed: false,
    permission: 'default',
    loading: true,
  });

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = async () => {
      const isSupported = 'serviceWorker' in navigator && 
                          'PushManager' in window && 
                          'Notification' in window;
      
      let permission: NotificationPermission = 'default';
      let isSubscribed = false;

      if (isSupported) {
        permission = Notification.permission;
        
        // Check if already subscribed
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          isSubscribed = !!subscription;
        } catch (e) {
          console.error('Error checking push subscription:', e);
        }
      }

      setState({
        isSupported,
        isSubscribed,
        permission,
        loading: false,
      });
    };

    checkSupport();
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!state.isSupported || !userId) {
      toast({
        title: 'Push notifications not supported',
        description: 'Your browser does not support push notifications.',
        variant: 'destructive',
      });
      return false;
    }

    setState(prev => ({ ...prev, loading: true }));

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        setState(prev => ({ ...prev, permission, loading: false }));
        toast({
          title: 'Permission denied',
          description: 'Please enable notifications in your browser settings.',
          variant: 'destructive',
        });
        return false;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push manager
      // Note: In production, you'd use your VAPID public key here
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          // This is a placeholder VAPID key - in production, generate your own
          'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
        ),
      });

      // Send subscription to backend
      const { data: session } = await supabase.auth.getSession();
      const { error } = await supabase.functions.invoke('register-push', {
        body: { 
          subscription: subscription.toJSON(),
          action: 'subscribe'
        },
        headers: {
          Authorization: `Bearer ${session.session?.access_token}`,
        },
      });

      if (error) {
        console.error('Error registering push subscription:', error);
        throw error;
      }

      setState(prev => ({ 
        ...prev, 
        isSubscribed: true, 
        permission: 'granted',
        loading: false 
      }));

      toast({
        title: 'Notifications enabled',
        description: 'You will receive alerts for product recalls.',
      });

      return true;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      setState(prev => ({ ...prev, loading: false }));
      toast({
        title: 'Subscription failed',
        description: 'Could not enable push notifications.',
        variant: 'destructive',
      });
      return false;
    }
  }, [state.isSupported, userId]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!userId) return false;

    setState(prev => ({ ...prev, loading: true }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      // Remove from backend
      const { data: session } = await supabase.auth.getSession();
      await supabase.functions.invoke('register-push', {
        body: { action: 'unsubscribe' },
        headers: {
          Authorization: `Bearer ${session.session?.access_token}`,
        },
      });

      setState(prev => ({ ...prev, isSubscribed: false, loading: false }));

      toast({
        title: 'Notifications disabled',
        description: 'You will no longer receive push notifications.',
      });

      return true;
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
      setState(prev => ({ ...prev, loading: false }));
      return false;
    }
  }, [userId]);

  return {
    ...state,
    subscribe,
    unsubscribe,
  };
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer as ArrayBuffer;
}
