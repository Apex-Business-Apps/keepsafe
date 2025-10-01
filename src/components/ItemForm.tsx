import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, QrCode } from "lucide-react";
import { Item } from "@/hooks/useItems";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ItemFormProps {
  onSubmit: (item: Omit<Item, "id" | "user_id" | "created_at" | "updated_at">) => Promise<any>;
  userId: string;
}

export const ItemForm = ({ onSubmit, userId }: ItemFormProps) => {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [warrantyMonths, setWarrantyMonths] = useState("");
  const [price, setPrice] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [barcode, setBarcode] = useState("");
  const [notes, setNotes] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);

  const handleBarcodeScanner = async () => {
    if (!("BarcodeDetector" in window)) {
      toast({
        title: "Barcode scanner not supported",
        description: "Your browser doesn't support barcode scanning",
        variant: "destructive",
      });
      return;
    }

    try {
      setScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      // @ts-ignore
      const barcodeDetector = new BarcodeDetector({ formats: ["ean_13", "ean_8", "upc_a", "upc_e"] });
      
      const detect = async () => {
        try {
          const barcodes = await barcodeDetector.detect(video);
          if (barcodes.length > 0) {
            setBarcode(barcodes[0].rawValue);
            toast({ title: "Barcode scanned!", description: barcodes[0].rawValue });
            stream.getTracks().forEach(track => track.stop());
            setScanning(false);
          } else {
            requestAnimationFrame(detect);
          }
        } catch (err) {
          requestAnimationFrame(detect);
        }
      };

      video.addEventListener("loadeddata", () => {
        detect();
      });

      setTimeout(() => {
        stream.getTracks().forEach(track => track.stop());
        setScanning(false);
      }, 10000);

    } catch (error) {
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to scan barcodes",
        variant: "destructive",
      });
      setScanning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let receiptUrl = "";
    if (receiptFile) {
      const fileExt = receiptFile.name.split(".").pop();
      const filePath = `${userId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(filePath, receiptFile);

      if (uploadError) {
        toast({
          title: "Error uploading receipt",
          description: uploadError.message,
          variant: "destructive",
        });
        return;
      }

      const { data } = supabase.storage.from("receipts").getPublicUrl(filePath);
      receiptUrl = data.publicUrl;
    }

    await onSubmit({
      name,
      brand: brand || undefined,
      category: category || undefined,
      purchase_date: purchaseDate || undefined,
      warranty_months: warrantyMonths ? parseInt(warrantyMonths) : undefined,
      price: price ? parseFloat(price) : undefined,
      serial_number: serialNumber || undefined,
      barcode: barcode || undefined,
      receipt_photo_url: receiptUrl || undefined,
      notes: notes || undefined,
    });

    // Reset form
    setName("");
    setBrand("");
    setCategory("");
    setPurchaseDate("");
    setWarrantyMonths("");
    setPrice("");
    setSerialNumber("");
    setBarcode("");
    setNotes("");
    setReceiptFile(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Item</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warrantyMonths">Warranty (months)</Label>
              <Input
                id="warrantyMonths"
                type="number"
                value={warrantyMonths}
                onChange={(e) => setWarrantyMonths(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input
                id="serialNumber"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <div className="flex gap-2">
                <Input
                  id="barcode"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleBarcodeScanner}
                  disabled={scanning}
                >
                  <QrCode className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="receipt">Receipt Photo</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="receipt"
                type="file"
                accept="image/*"
                onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.capture = "environment";
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) setReceiptFile(file);
                  };
                  input.click();
                }}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">Add Item</Button>
        </form>
      </CardContent>
    </Card>
  );
};
