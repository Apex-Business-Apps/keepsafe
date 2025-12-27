import { ReactNode, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PushNotificationToggle } from "@/components/PushNotificationToggle";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Download, LogOut } from "lucide-react";
import { useAuthSession } from "@/hooks/useAuthSession";

interface DashboardLayoutProps {
  children: ReactNode;
  onExportPDF?: () => void;
  showExport?: boolean;
}

export function DashboardLayout({ 
  children, 
  onExportPDF,
  showExport = true 
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { session } = useAuthSession();

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out successfully" });
    navigate("/");
  }, [navigate]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>
        
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="sticky top-0 z-50 glass-effect border-b border-border/50">
            <div className="flex h-14 items-center justify-between px-4">
              <div className="flex items-center gap-2">
                {/* Only show sidebar trigger on desktop */}
                <div className="hidden md:block">
                  <SidebarTrigger className="h-8 w-8" />
                </div>
                {/* Mobile logo */}
                <div className="md:hidden flex items-center gap-2">
                  <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    KeepSafe
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Push notification toggle */}
                <PushNotificationToggle userId={session?.user?.id} showLabel={false} />
                
                {showExport && onExportPDF && (
                  <Button 
                    onClick={onExportPDF} 
                    variant="outline"
                    size="sm"
                    className="border-primary/30 hover:border-accent hover:bg-accent/10 font-semibold transition-all hidden sm:flex"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                )}
                {showExport && onExportPDF && (
                  <Button 
                    onClick={onExportPDF} 
                    variant="outline"
                    size="icon"
                    className="border-primary/30 hover:border-accent hover:bg-accent/10 sm:hidden"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
                <ThemeToggle />
                <Button 
                  onClick={handleSignOut} 
                  variant="ghost"
                  size="sm"
                  className="hover:bg-destructive/10 hover:text-destructive font-semibold transition-all hidden sm:flex"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
                <Button 
                  onClick={handleSignOut} 
                  variant="ghost"
                  size="icon"
                  className="hover:bg-destructive/10 hover:text-destructive sm:hidden"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content with bottom padding for mobile nav */}
          <main className="flex-1 overflow-auto pb-20 md:pb-0">
            {children}
          </main>
        </SidebarInset>
        
        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  );
}
