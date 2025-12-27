// Event tracking helper with debouncing and batching
// Usage: trackEvent('signup'), trackEvent('item_added', { source: 'manual' })

interface EventProps {
  [key: string]: string | number | boolean;
}

// Debounce queue to prevent spam
const eventQueue = new Map<string, NodeJS.Timeout>();
const DEBOUNCE_MS = 1000;

export async function trackEvent(
  name: 'signup' | 'item_added' | 'binder_exported' | 'recall_alert_seen' | 'paid_click' | 'export_csv' | 'export_json',
  props?: EventProps,
  userId?: string
) {
  // Validate props size to prevent abuse (max 1KB)
  const propsJson = JSON.stringify(props || {});
  if (propsJson.length > 1024) {
    console.warn('Event props too large, skipping:', name);
    return;
  }

  // Debounce identical events
  const eventKey = `${name}-${userId || 'anon'}`;
  if (eventQueue.has(eventKey)) {
    clearTimeout(eventQueue.get(eventKey));
  }

  const timeout = setTimeout(async () => {
    eventQueue.delete(eventKey);
    
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
  }, DEBOUNCE_MS);

  eventQueue.set(eventKey, timeout);
}
