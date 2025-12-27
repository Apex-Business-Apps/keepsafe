import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { cn } from "@/lib/utils";

interface PushNotificationToggleProps {
  userId: string | undefined;
  className?: string;
  showLabel?: boolean;
}

export function PushNotificationToggle({ 
  userId, 
  className,
  showLabel = true 
}: PushNotificationToggleProps) {
  const { 
    isSupported, 
    isSubscribed, 
    permission, 
    loading, 
    subscribe, 
    unsubscribe 
  } = usePushNotifications(userId);

  if (!isSupported) {
    return null;
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  return (
    <Button
      variant={isSubscribed ? "default" : "outline"}
      size="sm"
      onClick={handleToggle}
      disabled={loading || permission === 'denied'}
      className={cn(
        "gap-2 transition-all",
        isSubscribed && "bg-primary hover:bg-primary/90",
        permission === 'denied' && "opacity-50 cursor-not-allowed",
        className
      )}
      title={
        permission === 'denied' 
          ? "Notifications blocked. Enable in browser settings." 
          : isSubscribed 
            ? "Disable notifications" 
            : "Enable notifications"
      }
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isSubscribed ? (
        <Bell className="h-4 w-4" />
      ) : (
        <BellOff className="h-4 w-4" />
      )}
      {showLabel && (
        <span className="hidden sm:inline">
          {loading 
            ? "Loading..." 
            : isSubscribed 
              ? "Notifications On" 
              : "Enable Alerts"
          }
        </span>
      )}
    </Button>
  );
}
