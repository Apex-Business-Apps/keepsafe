import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Upload, FileJson, FileSpreadsheet, AlertCircle, Loader2 } from "lucide-react";
import { Item } from "@/hooks/useItems";
import { parseCSV, parseJSON, ImportItem } from "@/utils/importData";
import { toast } from "@/hooks/use-toast";

interface Props {
  onAdd: (item: Omit<Item, "id" | "user_id" | "created_at" | "updated_at">) => Promise<unknown>;
}

export const ImportMenu = ({ onAdd }: Props) => {
  const csvRef = useRef<HTMLInputElement>(null);
  const jsonRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<{ items: ImportItem[]; errors: string[] } | null>(null);
  const [importing, setImporting] = useState(false);

  const handleFile = async (file: File, kind: "csv" | "json") => {
    const text = await file.text();
    const result = kind === "csv" ? parseCSV(text) : parseJSON(text);
    if (result.items.length === 0 && result.errors.length === 0) {
      toast({ title: "No items found in file", variant: "destructive" });
      return;
    }
    setPreview(result);
  };

  const handleImport = async () => {
    if (!preview) return;
    setImporting(true);
    let success = 0;
    let failed = 0;
    for (const item of preview.items) {
      const res = await onAdd(item);
      if (res) success++;
      else failed++;
    }
    setImporting(false);
    setPreview(null);
    toast({
      title: `Imported ${success} item${success === 1 ? "" : "s"}`,
      description: failed > 0 ? `${failed} failed` : undefined,
      variant: failed > 0 ? "destructive" : "default",
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Import</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => csvRef.current?.click()} className="gap-2 cursor-pointer">
            <FileSpreadsheet className="h-4 w-4" />
            Import CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => jsonRef.current?.click()} className="gap-2 cursor-pointer">
            <FileJson className="h-4 w-4" />
            Import JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        ref={csvRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f, "csv");
          e.target.value = "";
        }}
      />
      <input
        ref={jsonRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f, "json");
          e.target.value = "";
        }}
      />

      <Dialog open={!!preview} onOpenChange={(v) => !v && setPreview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview Import</DialogTitle>
            <DialogDescription>
              Review {preview?.items.length ?? 0} item(s) before importing.
            </DialogDescription>
          </DialogHeader>

          {preview?.errors && preview.errors.length > 0 && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 space-y-1">
              <div className="flex items-center gap-2 text-destructive text-sm font-medium">
                <AlertCircle className="h-4 w-4" />
                {preview.errors.length} warning(s)
              </div>
              <ul className="text-xs text-muted-foreground list-disc pl-5 max-h-24 overflow-auto">
                {preview.errors.slice(0, 10).map((er, i) => <li key={i}>{er}</li>)}
              </ul>
            </div>
          )}

          <div className="max-h-72 overflow-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Brand</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-left p-2">Price</th>
                </tr>
              </thead>
              <tbody>
                {preview?.items.slice(0, 50).map((it, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2 font-medium">{it.name}</td>
                    <td className="p-2 text-muted-foreground">{it.brand || "—"}</td>
                    <td className="p-2 text-muted-foreground">{it.category || "—"}</td>
                    <td className="p-2 text-muted-foreground">
                      {it.price != null ? `$${it.price.toFixed(2)}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview && preview.items.length > 50 && (
              <p className="text-xs text-muted-foreground text-center p-2">
                …and {preview.items.length - 50} more
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setPreview(null)} disabled={importing}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={importing || !preview?.items.length}>
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Importing…
                </>
              ) : (
                `Import ${preview?.items.length ?? 0}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
