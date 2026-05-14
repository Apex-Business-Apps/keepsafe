import { AlertTriangle, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trackEvent } from "@/lib/trackEvent";

interface RecallItem {
  id: string;
  name: string;
  brand?: string;
  recall_url?: string;
  recall_match_score?: number;
  recall_match_reason?: string;
  recall_source_system?: string;
  recall_published_date?: string;
}

interface RecallAlertsProps {
  items: RecallItem[];
  loading?: boolean;
  userId?: string;
}

export function RecallAlerts({ items, loading = false, userId }: RecallAlertsProps) {
  const handleViewRecall = async (item: RecallItem) => {
    await trackEvent("recall_alert_seen", { item_id: item.id, item_name: item.name }, userId);
    if (item.recall_url) {
      window.open(item.recall_url, "_blank", "noopener,noreferrer");
    }
  };

  if (loading) {
    return (
      <Card className="glass-effect border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Recall Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="glass-effect border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
            Recall Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
              <span className="text-2xl">✓</span>
            </div>
            <p className="text-muted-foreground font-medium">No recalls affecting your items</p>
            <p className="text-sm text-muted-foreground">We monitor CPSC and Health Canada daily</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect border-destructive/30 ring-2 ring-destructive/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-destructive animate-pulse" />
          Recall Alerts
          <Badge variant="destructive" className="ml-auto">
            {items.length} Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20"
          >
            <div>
              <p className="font-semibold">{item.name}</p>
              {item.brand && (
                <p className="text-sm text-muted-foreground">{item.brand}</p>
              )}
              {item.recall_match_reason && (
                <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                  Evidence: {item.recall_match_reason}
                  {typeof item.recall_match_score === "number" ? ` (${item.recall_match_score}/100)` : ""}
                </p>
              )}
              {item.recall_source_system && (
                <Badge variant="outline" className="mt-2 text-[10px] uppercase tracking-wide">
                  {item.recall_source_system.replace("_", " ")}
                </Badge>
              )}
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleViewRecall(item)}
              className="shrink-0"
            >
              View
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
