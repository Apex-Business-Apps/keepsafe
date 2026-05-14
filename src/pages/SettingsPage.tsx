import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Settings, User, Bell, Shield, Palette } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CategoryManager } from "@/components/CategoryManager";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuthSession();

  useEffect(() => {
    if (!authLoading && !session) {
      navigate("/auth", { state: { from: "/dashboard/settings" } });
    }
  }, [session, authLoading, navigate]);

  if (authLoading || !session) {
    return null;
  }

  return (
    <DashboardLayout showExport={false}>
      <div className="container mx-auto px-6 py-6 space-y-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Settings
          </h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Account Settings */}
          <Card className="glass-effect border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Account
              </CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Email</Label>
                <p className="font-medium">{session.user.email}</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Change Password
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="glass-effect border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notifications
              </CardTitle>
              <CardDescription>Configure how you receive alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="recall-alerts">Recall Alerts</Label>
                <Switch id="recall-alerts" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="warranty-reminders">Warranty Reminders</Label>
                <Switch id="warranty-reminders" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <Switch id="email-notifications" />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="glass-effect border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Privacy
              </CardTitle>
              <CardDescription>Control your data and privacy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="analytics">Usage Analytics</Label>
                <Switch id="analytics" defaultChecked />
              </div>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                Delete All Data
              </Button>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card className="glass-effect border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Appearance
              </CardTitle>
              <CardDescription>Customize the look and feel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Use the theme toggle in the header to switch between light and dark mode.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Categories Manager - full width */}
        <CategoryManager userId={session.user.id} />
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
