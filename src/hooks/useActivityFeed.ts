import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

import type { Json } from "@/integrations/supabase/types";

interface Activity {
  id: number;
  name: string;
  props: Json | null;
  ts: string | null;
}

interface FormattedActivity {
  id: number;
  type: string;
  description: string;
  timestamp: Date;
  icon: "plus" | "download" | "alert" | "credit-card" | "user";
}

export function useActivityFeed(userId: string | undefined, limit = 10) {
  const [activities, setActivities] = useState<FormattedActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("events")
        .select("id, name, props, ts")
        .eq("user_id", userId)
        .order("ts", { ascending: false })
        .limit(limit);

      if (fetchError) {
        throw fetchError;
      }

      const formatted: FormattedActivity[] = (data || [])
        .filter((event): event is typeof event & { ts: string } => event.ts !== null)
        .map((event) => {
          let description = "";
          let icon: FormattedActivity["icon"] = "plus";
          const props = event.props as Record<string, unknown> | null;

          switch (event.name) {
            case "item_added":
              description = `Added new item${props?.name ? `: ${props.name}` : ""}`;
              icon = "plus";
              break;
            case "binder_exported":
              description = `Exported insurance binder (${props?.items_count || 0} items)`;
              icon = "download";
              break;
            case "recall_alert_seen":
              description = "Viewed recall alert details";
              icon = "alert";
              break;
            case "paid_click":
              description = "Explored premium plans";
              icon = "credit-card";
              break;
            case "signup":
              description = "Created account";
              icon = "user";
              break;
            default:
              description = event.name.replace(/_/g, " ");
              icon = "plus";
          }

          return {
            id: event.id,
            type: event.name,
            description,
            timestamp: new Date(event.ts),
            icon,
          };
        });

      setActivities(formatted);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch activities:", err);
      setError("Failed to load activity feed");
    } finally {
      setLoading(false);
    }
  }, [userId, limit]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return { activities, loading, error, refetch: fetchActivities };
}
