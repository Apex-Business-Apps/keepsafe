import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface UPCProductData {
  name: string;
  brand?: string | null;
  category?: string | null;
  image_url?: string | null;
  description?: string | null;
  source: string;
}

export const useUPCLookup = () => {
  const [looking, setLooking] = useState(false);
  const [productData, setProductData] = useState<UPCProductData | null>(null);

  const lookupBarcode = useCallback(async (barcode: string): Promise<UPCProductData | null> => {
    if (!barcode || barcode.length < 8) {
      return null;
    }

    setLooking(true);
    setProductData(null);

    try {
      const { data, error } = await supabase.functions.invoke('lookup-upc', {
        body: { barcode },
      });

      if (error) {
        console.error('UPC lookup error:', error);
        throw error;
      }

      if (!data?.success) {
        if (data?.error === 'Product not found') {
          toast({
            title: 'Product not found',
            description: 'No product data found for this barcode.',
          });
          return null;
        }
        throw new Error(data?.error || 'Failed to lookup product');
      }

      const product = data.data as UPCProductData;
      setProductData(product);

      toast({
        title: 'Product found!',
        description: `${product.name}${product.brand ? ` by ${product.brand}` : ''}`,
      });

      return product;
    } catch (error) {
      console.error('Error looking up UPC:', error);
      toast({
        title: 'Lookup failed',
        description: error instanceof Error ? error.message : 'Could not lookup product',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLooking(false);
    }
  }, []);

  const clearProductData = useCallback(() => {
    setProductData(null);
  }, []);

  return {
    looking,
    productData,
    lookupBarcode,
    clearProductData,
  };
};
