import { Plus, Download, AlertTriangle, CreditCard, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: number;
  type: string;
  description: string;
  timestamp: Date;
  icon: "plus" | "download" | "alert" | "credit-card" | "user";
}

interface ActivityFeedProps {
  activities: Activity[];
  loading?: boolean;
  error?: string | null;
}

const iconMap = {
  plus: Plus,
  download: Download,
  alert: AlertTriangle,
  "credit-card": CreditCard,
  user: User,
};

const iconColorMap = {
  plus: "text-primary bg-primary/10",
  download: "text-accent bg-accent/10",
  alert: "text-destructive bg-destructive/10",
  "credit-card": "text-warning bg-warning/10",
  user: "text-primary bg-primary/10",
};

export function ActivityFeed({ activities, loading = false, error }: ActivityFeedProps) {
  if (loading) {
    return (
      <Card className="glass-effect border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-effect border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className="glass-effect border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-2">
            <p className="text-muted-foreground font-medium">No activity yet</p>
            <p className="text-sm text-muted-foreground">
              Add items and export binders to see your activity
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => {
          const Icon = iconMap[activity.icon];
          const colorClass = iconColorMap[activity.icon];

          return (
            <div key={activity.id} className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${colorClass}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{activity.description}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
