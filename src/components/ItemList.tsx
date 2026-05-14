import { memo } from "react";
import { Item } from "@/hooks/useItems";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, AlertTriangle, ExternalLink, Image as ImageIcon, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { useReceiptUrl } from "@/hooks/useReceiptUrl";
import { useCategories } from "@/hooks/useCategories";
import { useAuthSession } from "@/hooks/useAuthSession";

interface ItemListProps {
  items: Item[];
  onDelete: (id: string) => void;
  onItemClick?: (id: string) => void;
}

const ItemCard = memo(({ 
  item, 
  onDelete, 
  onItemClick 
}: { 
  item: Item; 
  onDelete: (id: string) => void;
  onItemClick?: (id: string) => void;
}) => {
  const { signedUrl: receiptUrl, loading: receiptLoading } = useReceiptUrl(item.receipt_file_path);
  const { session } = useAuthSession();
  const { getColor } = useCategories(session?.user?.id);
  
  return (
    <Card 
      className={`transition-all duration-200 ${onItemClick ? 'cursor-pointer hover:shadow-lg hover:border-primary/30' : ''}`}
      onClick={() => onItemClick?.(item.id)}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg flex items-center gap-2">
            {item.name}
            {onItemClick && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
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
        <p className="text-sm flex items-center gap-1.5">
          <span className="font-medium">Category:</span>
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: getColor(item.category) }}
          />
          {item.category}
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
      {item.receipt_file_path && (
        <div className="text-sm" onClick={(e) => e.stopPropagation()}>
          <span className="font-medium">Receipt:</span>{" "}
          {receiptLoading ? (
            <span className="text-muted-foreground">Loading...</span>
          ) : receiptUrl ? (
            <a
              href={receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1 inline-flex"
            >
              View Receipt <ImageIcon className="h-3 w-3" />
            </a>
          ) : (
            <span className="text-destructive">Failed to load</span>
          )}
        </div>
      )}
      {item.recall_url && (
        <a
          href={item.recall_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-destructive hover:underline flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          View Recall Details <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </CardContent>
  </Card>
  );
});

export const ItemList = memo(({ items, onDelete, onItemClick }: ItemListProps) => {
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
        <ItemCard key={item.id} item={item} onDelete={onDelete} onItemClick={onItemClick} />
      ))}
    </div>
  );
});
