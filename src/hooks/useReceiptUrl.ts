import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to generate dynamic signed URLs for receipt files
 * This prevents URL expiry issues by generating fresh URLs on demand
 */
export const useReceiptUrl = (filePath?: string) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!filePath) {
      setSignedUrl(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const generateUrl = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: urlError } = await supabase.storage
          .from('receipts')
          .createSignedUrl(filePath, 3600); // 1 hour expiry

        if (urlError) throw urlError;

        if (isMounted && data?.signedUrl) {
          setSignedUrl(data.signedUrl);
        }
      } catch (err) {
        console.error('Failed to generate signed URL:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to generate URL'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    generateUrl();

    return () => {
      isMounted = false;
    };
  }, [filePath]);

  return { signedUrl, loading, error };
};
