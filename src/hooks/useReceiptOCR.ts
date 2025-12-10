import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ExtractedReceiptData {
  store_name?: string | null;
  purchase_date?: string | null;
  total_amount?: number | null;
  items?: Array<{
    name: string;
    price: number;
    quantity?: number;
  }>;
  payment_method?: string | null;
  confidence: 'high' | 'medium' | 'low';
}

export const useReceiptOCR = () => {
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedReceiptData | null>(null);

  const extractFromImage = useCallback(async (file: File): Promise<ExtractedReceiptData | null> => {
    setExtracting(true);
    setExtractedData(null);

    try {
      // Convert file to base64
      const base64 = await fileToBase64(file);

      const { data, error } = await supabase.functions.invoke('extract-receipt', {
        body: { imageBase64: base64 },
      });

      if (error) {
        console.error('Receipt extraction error:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to extract receipt data');
      }

      const extracted = data.data as ExtractedReceiptData;
      setExtractedData(extracted);

      toast({
        title: 'Receipt scanned',
        description: `Found ${extracted.items?.length || 0} items with ${extracted.confidence} confidence.`,
      });

      return extracted;
    } catch (error) {
      console.error('Error extracting receipt:', error);
      toast({
        title: 'Extraction failed',
        description: error instanceof Error ? error.message : 'Could not read receipt',
        variant: 'destructive',
      });
      return null;
    } finally {
      setExtracting(false);
    }
  }, []);

  const clearExtractedData = useCallback(() => {
    setExtractedData(null);
  }, []);

  return {
    extracting,
    extractedData,
    extractFromImage,
    clearExtractedData,
  };
};

// Helper to convert File to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
