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
    // Validate props size to prevent abuse (max 1KB)
    const propsJson = JSON.stringify(props || {});
    if (propsJson.length > 1024) {
      console.warn('Event props too large, truncating');
      return;
    }

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
      const status = response.status;
      if (status === 429) {
        console.warn('Event tracking rate limit exceeded');
      } else {
        console.warn('Failed to track event:', name, status);
      }
    }
  } catch (error) {
    // Silently fail - don't block UI for analytics
    console.warn('Error tracking event:', error);
  }
}
