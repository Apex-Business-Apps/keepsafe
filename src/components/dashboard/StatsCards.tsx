import { Package, AlertTriangle, Clock, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardsProps {
  totalItems: number;
  totalValue: number;
  activeRecalls: number;
  expiringWarranties: number;
  loading?: boolean;
}

export function StatsCards({
  totalItems,
  totalValue,
  activeRecalls,
  expiringWarranties,
  loading = false,
}: StatsCardsProps) {
  const stats = [
    {
      label: "Total Items",
      value: totalItems,
      icon: Package,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Total Value",
      value: `$${totalValue.toLocaleString()}`,
      icon: DollarSign,
      iconColor: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Active Recalls",
      value: activeRecalls,
      icon: AlertTriangle,
      iconColor: activeRecalls > 0 ? "text-destructive" : "text-muted-foreground",
      bgColor: activeRecalls > 0 ? "bg-destructive/10" : "bg-muted/50",
      urgent: activeRecalls > 0,
    },
    {
      label: "Expiring Soon",
      value: expiringWarranties,
      icon: Clock,
      iconColor: expiringWarranties > 0 ? "text-warning" : "text-muted-foreground",
      bgColor: expiringWarranties > 0 ? "bg-warning/10" : "bg-muted/50",
      urgent: expiringWarranties > 0,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="glass-effect border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className={`glass-effect border-primary/20 transition-all hover:border-accent/40 ${
            stat.urgent ? "ring-2 ring-offset-2 ring-offset-background ring-destructive/30" : ""
          }`}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                <p className="text-2xl font-black">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
