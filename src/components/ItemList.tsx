import { Item } from "@/hooks/useItems";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, AlertTriangle, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface ItemListProps {
  items: Item[];
  onDelete: (id: string) => void;
}

export const ItemList = ({ items, onDelete }: ItemListProps) => {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">
            No items yet. Add your first household item to get started!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{item.name}</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(item.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            {item.recall_match && (
              <Badge variant="destructive" className="w-fit">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Recall Alert
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            {item.brand && (
              <p className="text-sm">
                <span className="font-medium">Brand:</span> {item.brand}
              </p>
            )}
            {item.category && (
              <p className="text-sm">
                <span className="font-medium">Category:</span> {item.category}
              </p>
            )}
            {item.purchase_date && (
              <p className="text-sm">
                <span className="font-medium">Purchase Date:</span>{" "}
                {format(new Date(item.purchase_date), "MMM dd, yyyy")}
              </p>
            )}
            {item.warranty_months && (
              <p className="text-sm">
                <span className="font-medium">Warranty:</span> {item.warranty_months} months
              </p>
            )}
            {item.price && (
              <p className="text-sm">
                <span className="font-medium">Price:</span> ${item.price.toFixed(2)}
              </p>
            )}
            {item.serial_number && (
              <p className="text-sm text-muted-foreground">
                SN: {item.serial_number}
              </p>
            )}
            {item.barcode && (
              <p className="text-sm text-muted-foreground">
                Barcode: {item.barcode}
              </p>
            )}
            {item.recall_url && (
              <a
                href={item.recall_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-destructive hover:underline flex items-center gap-1"
              >
                View Recall Details <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
