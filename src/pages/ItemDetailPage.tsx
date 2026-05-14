import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Save, 
  AlertTriangle, 
  ExternalLink, 
  Calendar, 
  DollarSign,
  Tag,
  Hash,
  ScanBarcode,
  FileText,
  Edit2,
  X
} from "lucide-react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useItems, Item } from "@/hooks/useItems";
import { useReceiptUrl } from "@/hooks/useReceiptUrl";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CategorySelect } from "@/components/CategorySelect";
import { DocumentGallery } from "@/components/DocumentGallery";

const ItemDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuthSession();
  const { items, loading, updateItem } = useItems(session?.user?.id);
  
  const [item, setItem] = useState<Item | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Edit form state
  const [editName, setEditName] = useState("");
  const [editBrand, setEditBrand] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPurchaseDate, setEditPurchaseDate] = useState("");
  const [editWarrantyMonths, setEditWarrantyMonths] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editSerialNumber, setEditSerialNumber] = useState("");
  const [editBarcode, setEditBarcode] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const { signedUrl: receiptUrl, loading: receiptLoading } = useReceiptUrl(item?.receipt_file_path);

  useEffect(() => {
    if (!authLoading && !session) {
      navigate("/auth", { state: { from: `/dashboard/items/${id}` } });
    }
  }, [session, authLoading, navigate, id]);

  useEffect(() => {
    if (!loading && items.length > 0 && id) {
      const foundItem = items.find(i => i.id === id);
      if (foundItem) {
        setItem(foundItem);
        // Initialize edit form
        setEditName(foundItem.name);
        setEditBrand(foundItem.brand || "");
        setEditCategory(foundItem.category || "");
        setEditPurchaseDate(foundItem.purchase_date || "");
        setEditWarrantyMonths(foundItem.warranty_months?.toString() || "");
        setEditPrice(foundItem.price?.toString() || "");
        setEditSerialNumber(foundItem.serial_number || "");
        setEditBarcode(foundItem.barcode || "");
        setEditNotes(foundItem.notes || "");
      } else {
        navigate("/dashboard/items");
        toast({ title: "Item not found", variant: "destructive" });
      }
    }
  }, [loading, items, id, navigate]);

  const handleSave = useCallback(async () => {
    if (!item || !editName.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }

    setSaving(true);
    const success = await updateItem(item.id, {
      name: editName.trim(),
      brand: editBrand.trim() || undefined,
      category: editCategory.trim() || undefined,
      purchase_date: editPurchaseDate || undefined,
      warranty_months: editWarrantyMonths ? parseInt(editWarrantyMonths) : undefined,
      price: editPrice ? parseFloat(editPrice) : undefined,
      serial_number: editSerialNumber.trim() || undefined,
      barcode: editBarcode.trim() || undefined,
      notes: editNotes.trim() || undefined,
    });

    setSaving(false);
    if (success) {
      setIsEditing(false);
    }
  }, [item, editName, editBrand, editCategory, editPurchaseDate, editWarrantyMonths, editPrice, editSerialNumber, editBarcode, editNotes, updateItem]);

  const cancelEdit = () => {
    if (item) {
      setEditName(item.name);
      setEditBrand(item.brand || "");
      setEditCategory(item.category || "");
      setEditPurchaseDate(item.purchase_date || "");
      setEditWarrantyMonths(item.warranty_months?.toString() || "");
      setEditPrice(item.price?.toString() || "");
      setEditSerialNumber(item.serial_number || "");
      setEditBarcode(item.barcode || "");
      setEditNotes(item.notes || "");
    }
    setIsEditing(false);
  };

  if (authLoading || !session) {
    return null;
  }

  if (loading || !item) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 sm:px-6 py-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/dashboard/items")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold truncate">{item.name}</h1>
            {item.recall_match && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                Recall
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="ghost" size="sm" onClick={cancelEdit}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-1" />
                  {saving ? "Saving..." : "Save"}
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                Item Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input 
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Brand</Label>
                    <Input 
                      value={editBrand} 
                      onChange={(e) => setEditBrand(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <CategorySelect
                      value={editCategory}
                      onChange={setEditCategory}
                      userId={session.user.id}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Purchase Date</Label>
                    <Input 
                      type="date"
                      value={editPurchaseDate} 
                      onChange={(e) => setEditPurchaseDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Warranty (months)</Label>
                    <Input 
                      type="number"
                      value={editWarrantyMonths} 
                      onChange={(e) => setEditWarrantyMonths(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price ($)</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={editPrice} 
                      onChange={(e) => setEditPrice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Serial Number</Label>
                    <Input 
                      value={editSerialNumber} 
                      onChange={(e) => setEditSerialNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Barcode</Label>
                    <Input 
                      value={editBarcode} 
                      onChange={(e) => setEditBarcode(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Notes</Label>
                    <Textarea 
                      value={editNotes} 
                      onChange={(e) => setEditNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailRow label="Name" value={item.name} icon={<Tag className="h-4 w-4" />} />
                  <DetailRow label="Brand" value={item.brand} icon={<Tag className="h-4 w-4" />} />
                  <DetailRow label="Category" value={item.category} icon={<Tag className="h-4 w-4" />} />
                  <DetailRow 
                    label="Purchase Date" 
                    value={item.purchase_date ? format(new Date(item.purchase_date), "MMM dd, yyyy") : undefined}
                    icon={<Calendar className="h-4 w-4" />}
                  />
                  <DetailRow 
                    label="Warranty" 
                    value={item.warranty_months ? `${item.warranty_months} months` : undefined}
                    icon={<Calendar className="h-4 w-4" />}
                  />
                  <DetailRow 
                    label="Price" 
                    value={item.price ? `$${item.price.toFixed(2)}` : undefined}
                    icon={<DollarSign className="h-4 w-4" />}
                  />
                  <DetailRow 
                    label="Serial Number" 
                    value={item.serial_number}
                    icon={<Hash className="h-4 w-4" />}
                  />
                  <DetailRow 
                    label="Barcode" 
                    value={item.barcode}
                    icon={<ScanBarcode className="h-4 w-4" />}
                  />
                  {item.notes && (
                    <div className="md:col-span-2 p-3 rounded-lg bg-muted/50">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
                      <p className="text-sm">{item.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents & Receipt Gallery */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {item.receipt_file_path ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Receipt</p>
                  {receiptLoading ? (
                    <Skeleton className="w-full aspect-[4/3] rounded-lg" />
                  ) : receiptUrl ? (
                    <a 
                      href={receiptUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img 
                        src={receiptUrl} 
                        alt="Receipt" 
                        className="w-full rounded-lg border object-cover aspect-[4/3] hover:opacity-90 transition-opacity"
                      />
                    </a>
                  ) : (
                    <p className="text-sm text-destructive">Failed to load receipt</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No documents attached
                </p>
              )}

              {/* Recall Info */}
              {item.recall_match && item.recall_url && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="flex items-center gap-2 text-destructive mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium text-sm">Recall Alert</span>
                  </div>
                  <a
                    href={item.recall_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-destructive hover:underline flex items-center gap-1"
                  >
                    View Recall Details <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

const DetailRow = ({ 
  label, 
  value, 
  icon 
}: { 
  label: string; 
  value?: string | null; 
  icon?: React.ReactNode;
}) => {
  if (!value) return null;
  
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
      {icon && <span className="text-muted-foreground mt-0.5">{icon}</span>}
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
};

export default ItemDetailPage;
