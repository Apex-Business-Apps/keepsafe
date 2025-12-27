import { ReactNode, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Download, LogOut } from "lucide-react";

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

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out successfully" });
    navigate("/");
  }, [navigate]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="sticky top-0 z-50 glass-effect border-b border-border/50">
            <div className="flex h-14 items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="h-8 w-8" />
              </div>
              <div className="flex items-center gap-2">
                {showExport && onExportPDF && (
                  <Button 
                    onClick={onExportPDF} 
                    variant="outline"
                    size="sm"
                    className="border-primary/30 hover:border-accent hover:bg-accent/10 font-semibold transition-all"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                )}
                <ThemeToggle />
                <Button 
                  onClick={handleSignOut} 
                  variant="ghost"
                  size="sm"
                  className="hover:bg-destructive/10 hover:text-destructive font-semibold transition-all"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
