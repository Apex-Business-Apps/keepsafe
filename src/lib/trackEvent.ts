// Event tracking helper
// Usage: trackEvent('signup'), trackEvent('item_added', { source: 'manual' })

interface EventProps {
  [key: string]: string | number | boolean;
}

export async function trackEvent(
  name: 'signup' | 'item_added' | 'binder_exported' | 'recall_alert_seen' | 'paid_click',
  props?: EventProps,
  userId?: string
) {
  try {
    const response = await fetch(
      'https://aljdaazlgjcfwirqfjuc.supabase.co/functions/v1/track-event',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          user_id: userId,
          props: props || {},
        }),
      }
    );

    if (!response.ok) {
      console.warn('Failed to track event:', name);
    }
  } catch (error) {
    // Silently fail - don't block UI for analytics
    console.warn('Error tracking event:', error);
  }
}
