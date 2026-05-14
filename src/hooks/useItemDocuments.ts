import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface ItemDocument {
  path: string;
  name: string;
  signedUrl: string;
}

const BUCKET = "receipts";

export const useItemDocuments = (userId?: string, itemId?: string) => {
  const [documents, setDocuments] = useState<ItemDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchDocs = useCallback(async () => {
    if (!userId || !itemId) {
      setDocuments([]);
      return;
    }
    setLoading(true);
    try {
      const folder = `${userId}/${itemId}`;
      const { data, error } = await supabase.storage.from(BUCKET).list(folder, {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });
      if (error) throw error;

      const files = (data || []).filter((f) => f.name && !f.name.startsWith("."));
      const signed = await Promise.all(
        files.map(async (f) => {
          const path = `${folder}/${f.name}`;
          const { data: urlData } = await supabase.storage
            .from(BUCKET)
            .createSignedUrl(path, 3600);
          return {
            path,
            name: f.name,
            signedUrl: urlData?.signedUrl || "",
          };
        })
      );
      setDocuments(signed.filter((d) => d.signedUrl));
    } catch (err) {
      console.error("Failed to load documents:", err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [userId, itemId]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const uploadDocuments = useCallback(async (files: FileList | File[]) => {
    if (!userId || !itemId) return;
    const arr = Array.from(files);
    if (arr.length === 0) return;

    setUploading(true);
    let success = 0;
    for (const file of arr) {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: `${file.name} too large`,
          description: "Max 10MB per file",
          variant: "destructive",
        });
        continue;
      }
      const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
      const path = `${userId}/${itemId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) {
        toast({ title: `Upload failed: ${file.name}`, description: error.message, variant: "destructive" });
      } else {
        success++;
      }
    }
    setUploading(false);
    if (success > 0) {
      toast({ title: `Uploaded ${success} document${success === 1 ? "" : "s"}` });
      await fetchDocs();
    }
  }, [userId, itemId, fetchDocs]);

  const deleteDocument = useCallback(async (path: string) => {
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Document deleted" });
    await fetchDocs();
  }, [fetchDocs]);

  return { documents, loading, uploading, uploadDocuments, deleteDocument, refetch: fetchDocs };
};
