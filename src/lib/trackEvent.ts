import { supabase } from "@/integrations/supabase/client";

interface EventProps {
  [key: string]: string | number | boolean;
}

const eventQueue = new Map<string, ReturnType<typeof setTimeout>>();
const DEBOUNCE_MS = 1000;

export async function trackEvent(
  name: 'signup' | 'item_added' | 'binder_exported' | 'recall_alert_seen' | 'paid_click' | 'export_csv' | 'export_json',
  props?: EventProps,
  userId?: string
) {
  const propsJson = JSON.stringify(props || {});
  if (propsJson.length > 1024) {
    console.warn('Event props too large, skipping:', name);
    return;
  }

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    // Authenticated telemetry protects the endpoint; anonymous marketing events fail soft.
    return;
  }

  const eventKey = `${name}-${userId || sessionData.session.user.id}`;
  if (eventQueue.has(eventKey)) clearTimeout(eventQueue.get(eventKey));

  const timeout = setTimeout(async () => {
    eventQueue.delete(eventKey);
    try {
      const { error } = await supabase.functions.invoke('track-event', {
        body: { name, props: props || {} },
      });
      if (error) console.warn('Failed to track event:', name, error.message);
    } catch (error) {
      console.warn('Error tracking event:', error);
    }
  }, DEBOUNCE_MS);

  eventQueue.set(eventKey, timeout);
}
