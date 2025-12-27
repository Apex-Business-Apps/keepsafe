import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, X, Loader2, ScanBarcode, Flashlight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BarcodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (barcode: string) => void;
}

export const BarcodeScanner = ({ open, onOpenChange, onScan }: BarcodeScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
    setTorchOn(false);
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    setScanning(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Check for torch support
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities?.();
      setHasTorch(!!(capabilities as any)?.torch);

      // Start barcode detection
      if ("BarcodeDetector" in window) {
        detectBarcode();
      } else {
        // Fallback for browsers without BarcodeDetector
        setError("Barcode detection not supported. Please enter the barcode manually.");
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Camera access denied. Please allow camera access to scan barcodes.");
      setScanning(false);
    }
  }, []);

  const detectBarcode = useCallback(async () => {
    if (!videoRef.current || !streamRef.current) return;

    try {
      // @ts-ignore - BarcodeDetector is not in TypeScript types
      const barcodeDetector = new BarcodeDetector({
        formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39"]
      });

      const detect = async () => {
        if (!videoRef.current || !streamRef.current?.active) return;

        try {
          const barcodes = await barcodeDetector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const scannedBarcode = barcodes[0].rawValue;
            onScan(scannedBarcode);
            toast({ 
              title: "Barcode scanned!", 
              description: scannedBarcode 
            });
            stopCamera();
            onOpenChange(false);
            return;
          }
        } catch (err) {
          // Detection error, continue scanning
        }

        if (streamRef.current?.active) {
          requestAnimationFrame(detect);
        }
      };

      detect();
    } catch (err) {
      setError("Failed to initialize barcode scanner");
    }
  }, [onScan, onOpenChange, stopCamera]);

  const toggleTorch = useCallback(async () => {
    if (!streamRef.current) return;

    const track = streamRef.current.getVideoTracks()[0];
    try {
      await track.applyConstraints({
        // @ts-ignore
        advanced: [{ torch: !torchOn }]
      });
      setTorchOn(!torchOn);
    } catch (err) {
      console.error("Torch toggle failed:", err);
    }
  }, [torchOn]);

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [open, startCamera, stopCamera]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) stopCamera();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <ScanBarcode className="h-5 w-5" />
            Scan Barcode
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative aspect-[4/3] bg-black">
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <p className="text-destructive text-center text-sm">{error}</p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              
              {/* Scanning overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-32 border-2 border-primary rounded-lg relative">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary rounded-br-lg" />
                  
                  {/* Scanning line animation */}
                  <div className="absolute left-2 right-2 top-1/2 h-0.5 bg-primary/50 animate-pulse" />
                </div>
              </div>

              {scanning && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm">Scanning...</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-4 pt-2 flex justify-between">
          {hasTorch && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTorch}
              className="gap-2"
            >
              <Flashlight className={`h-4 w-4 ${torchOn ? "text-yellow-500" : ""}`} />
              {torchOn ? "Torch On" : "Torch Off"}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              stopCamera();
              onOpenChange(false);
            }}
            className="ml-auto gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
