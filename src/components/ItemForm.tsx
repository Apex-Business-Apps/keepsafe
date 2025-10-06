import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, QrCode, AlertCircle } from "lucide-react";
import { Item } from "@/hooks/useItems";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ItemFormProps {
  onSubmit: (item: Omit<Item, "id" | "user_id" | "created_at" | "updated_at">) => Promise<any>;
  userId: string;
}

export const ItemForm = ({ onSubmit, userId }: ItemFormProps) => {
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [warrantyMonths, setWarrantyMonths] = useState("");
  const [price, setPrice] = useState("");
  const [priceError, setPriceError] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [barcode, setBarcode] = useState("");
  const [notes, setNotes] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptInputKey, setReceiptInputKey] = useState(0);
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

  // Inline validation handlers
  const validateName = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      setNameError("Item name is required");
      return false;
    }
    if (trimmed.length > 255) {
      setNameError("Name must be less than 255 characters");
      return false;
    }
    setNameError("");
    return true;
  };

  const validatePrice = (value: string) => {
    if (value && isNaN(parseFloat(value))) {
      setPriceError("Please enter a valid number");
      return false;
    }
    if (value && parseFloat(value) < 0) {
      setPriceError("Price cannot be negative");
      return false;
    }
    setPriceError("");
    return true;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    // Clear error on typing if valid
    if (nameError && value.trim().length > 0) {
      setNameError("");
    }
  };

  const handleNameBlur = () => {
    validateName(name);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPrice(value);
    if (priceError && value && !isNaN(parseFloat(value))) {
      setPriceError("");
    }
  };

  const handlePriceBlur = () => {
    validatePrice(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate before submit
    const isNameValid = validateName(name);
    const isPriceValid = validatePrice(price);

    if (!isNameValid || !isPriceValid) {
      toast({
        title: "Please fix errors before submitting",
        variant: "destructive",
      });
      return;
    }

    let receiptFilePath = "";
    if (receiptFile) {
      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024;
      if (receiptFile.size > maxSize) {
        toast({
          title: "File too large",
          description: "File size must be less than 10MB",
          variant: "destructive",
        });
        return;
      }

      // Validate file type (images only)
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
      if (!allowedTypes.includes(receiptFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Only image files (JPEG, PNG, WEBP) are allowed",
          variant: "destructive",
        });
        return;
      }

      // SECURITY: Sanitize filename to prevent path traversal
      const fileExt = receiptFile.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
      const filePath = `${userId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(filePath, receiptFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        toast({
          title: "Error uploading receipt",
          description: uploadError.message,
          variant: "destructive",
        });
        return;
      }

      receiptFilePath = filePath;
    }

    await onSubmit({
      name: name.trim(),
      brand: brand.trim() || undefined,
      category: category.trim() || undefined,
      purchase_date: purchaseDate || undefined,
      warranty_months: warrantyMonths ? parseInt(warrantyMonths) : undefined,
      price: price ? parseFloat(price) : undefined,
      serial_number: serialNumber.trim() || undefined,
      barcode: barcode.trim() || undefined,
      receipt_file_path: receiptFilePath || undefined,
      notes: notes.trim() || undefined,
    });

    // Optimistic update: show success immediately
    toast({ 
      title: "Item added successfully!",
      action: (
        <Button
          size="sm"
          variant="outline"
          onClick={() => toast({ title: "Undo feature coming soon" })}
        >
          Undo
        </Button>
      ),
    });

    // Reset form
    setName("");
    setNameError("");
    setBrand("");
    setCategory("");
    setPurchaseDate("");
    setWarrantyMonths("");
    setPrice("");
    setPriceError("");
    setSerialNumber("");
    setBarcode("");
    setNotes("");
    setReceiptFile(null);
    setReceiptInputKey(prev => prev + 1); // Force file input reset
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Item</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Single-column layout */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-semibold">Item Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              required
              aria-invalid={!!nameError}
              aria-describedby={nameError ? "name-error" : undefined}
              className={`h-12 text-base transition-all duration-150 ${nameError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            />
            {nameError && (
              <p id="name-error" className="text-sm text-destructive flex items-center gap-1 animate-fade-in">
                <AlertCircle className="h-4 w-4" />
                {nameError}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand" className="text-base font-semibold">Brand</Label>
            <Input
              id="brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="h-12 text-base transition-all duration-150"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category" className="text-base font-semibold">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-12 text-base transition-all duration-150"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchaseDate" className="text-base font-semibold">Purchase Date</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="h-12 text-base transition-all duration-150"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warrantyMonths" className="text-base font-semibold">Warranty (months)</Label>
              <Input
                id="warrantyMonths"
                type="number"
                value={warrantyMonths}
                onChange={(e) => setWarrantyMonths(e.target.value)}
                className="h-12 text-base transition-all duration-150"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="price" className="text-base font-semibold">Price ($)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={price}
              onChange={handlePriceChange}
              onBlur={handlePriceBlur}
              aria-invalid={!!priceError}
              aria-describedby={priceError ? "price-error" : undefined}
              className={`h-12 text-base transition-all duration-150 ${priceError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            />
            {priceError && (
              <p id="price-error" className="text-sm text-destructive flex items-center gap-1 animate-fade-in">
                <AlertCircle className="h-4 w-4" />
                {priceError}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serialNumber" className="text-base font-semibold">Serial Number</Label>
              <Input
                id="serialNumber"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="h-12 text-base transition-all duration-150"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode" className="text-base font-semibold">Barcode</Label>
              <div className="flex gap-2">
                <Input
                  id="barcode"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="h-12 text-base transition-all duration-150"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleBarcodeScanner}
                  disabled={scanning}
                  className="h-12 w-12 transition-all duration-150 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                  aria-label="Scan barcode"
                >
                  <QrCode className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="receipt" className="text-base font-semibold">Receipt Photo</Label>
            <div className="flex gap-2 items-center">
              <Input
                key={receiptInputKey}
                id="receipt"
                type="file"
                accept="image/*"
                onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                className="h-12 text-base transition-all duration-150"
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
                className="h-12 w-12 transition-all duration-150 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                aria-label="Take photo of receipt"
              >
                <Camera className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-base font-semibold">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-24 text-base transition-all duration-150"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full h-12 text-base font-semibold transition-all duration-150 hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            Add Item
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
