import { Clock, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface WarrantyItem {
  id: string;
  name: string;
  brand?: string;
  expirationDate: Date;
  daysRemaining: number;
  status: "expired" | "critical" | "warning" | "good" | "none";
}

interface WarrantyTimelineProps {
  items: WarrantyItem[];
  loading?: boolean;
}

const statusConfig = {
  expired: {
    label: "Expired",
    color: "bg-destructive text-destructive-foreground",
    icon: AlertCircle,
    iconColor: "text-destructive",
  },
  critical: {
    label: "Expires Soon",
    color: "bg-destructive text-destructive-foreground",
    icon: AlertCircle,
    iconColor: "text-destructive",
  },
  warning: {
    label: "Expiring",
    color: "bg-warning text-warning-foreground",
    icon: Clock,
    iconColor: "text-warning",
  },
  good: {
    label: "Active",
    color: "bg-primary/20 text-primary",
    icon: CheckCircle,
    iconColor: "text-primary",
  },
  none: {
    label: "No Warranty",
    color: "bg-muted text-muted-foreground",
    icon: Clock,
    iconColor: "text-muted-foreground",
  },
};

export function WarrantyTimeline({ items, loading = false }: WarrantyTimelineProps) {
  // Show top 5 items
  const displayItems = items.slice(0, 5);

  if (loading) {
    return (
      <Card className="glass-effect border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            Warranty Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-2 w-full" />
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
            <Clock className="h-5 w-5 text-muted-foreground" />
            Warranty Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-2">
            <p className="text-muted-foreground font-medium">No warranty data yet</p>
            <p className="text-sm text-muted-foreground">
              Add purchase dates and warranty periods to your items
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5 text-primary" />
          Warranty Timeline
          {items.filter((i) => i.status === "critical" || i.status === "warning").length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {items.filter((i) => i.status === "critical" || i.status === "warning").length} Expiring
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayItems.map((item) => {
          const config = statusConfig[item.status];
          const Icon = config.icon;
          
          // Calculate progress (0-100, capped for visual purposes)
          // For items with 365+ days remaining, show full bar
          // For expired items, show 0
          let progress = 0;
          if (item.status !== "expired") {
            progress = Math.min(100, Math.max(0, (item.daysRemaining / 365) * 100));
          }

          return (
            <div key={item.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${config.iconColor}`} />
                  <span className="font-medium text-sm truncate max-w-[150px]">
                    {item.name}
                  </span>
                </div>
                <Badge className={config.color} variant="secondary">
                  {item.status === "expired"
                    ? "Expired"
                    : item.daysRemaining === 0
                    ? "Today"
                    : `${item.daysRemaining}d`}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <Progress
                  value={progress}
                  className="h-2 flex-1"
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {format(item.expirationDate, "MMM d, yyyy")}
                </span>
              </div>
            </div>
          );
        })}
        {items.length > 5 && (
          <p className="text-sm text-muted-foreground text-center pt-2">
            +{items.length - 5} more items
          </p>
        )}
      </CardContent>
    </Card>
  );
}
