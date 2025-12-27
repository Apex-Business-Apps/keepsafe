import { memo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileJson, FileSpreadsheet, FileText } from "lucide-react";
import { Item } from "@/hooks/useItems";
import { exportToCSV, exportToJSON } from "@/utils/exportData";
import { toast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/trackEvent";

interface ExportMenuProps {
  items: Item[];
  userId?: string;
  onExportPDF?: () => void;
}

export const ExportMenu = memo(({ items, userId, onExportPDF }: ExportMenuProps) => {
  const handleExportCSV = async () => {
    if (items.length === 0) {
      toast({
        title: "No items to export",
        description: "Add some items first",
        variant: "destructive",
      });
      return;
    }

    try {
      exportToCSV(items);
      await trackEvent("export_csv", { items_count: items.length }, userId);
      toast({ title: "CSV exported successfully!" });
    } catch (error) {
      toast({
        title: "Error exporting CSV",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleExportJSON = async () => {
    if (items.length === 0) {
      toast({
        title: "No items to export",
        description: "Add some items first",
        variant: "destructive",
      });
      return;
    }

    try {
      exportToJSON(items);
      await trackEvent("export_json", { items_count: items.length }, userId);
      toast({ title: "JSON exported successfully!" });
    } catch (error) {
      toast({
        title: "Error exporting JSON",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleExportCSV} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportJSON} className="gap-2 cursor-pointer">
          <FileJson className="h-4 w-4" />
          Export as JSON
        </DropdownMenuItem>
        {onExportPDF && (
          <DropdownMenuItem onClick={onExportPDF} className="gap-2 cursor-pointer">
            <FileText className="h-4 w-4" />
            Export as PDF
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

ExportMenu.displayName = "ExportMenu";
