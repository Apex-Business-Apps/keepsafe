import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Upload, Trash2, FileText, Loader2, ExternalLink } from "lucide-react";
import { useItemDocuments } from "@/hooks/useItemDocuments";

interface Props {
  userId: string;
  itemId: string;
}

const isImage = (name: string) =>
  /\.(png|jpe?g|webp|gif|heic|heif)$/i.test(name);

export const DocumentGallery = ({ userId, itemId }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const { documents, loading, uploading, uploadDocuments, deleteDocument } =
    useItemDocuments(userId, itemId);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          Documents ({documents.length})
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="gap-1"
        >
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          Add
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) uploadDocuments(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No documents yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Add receipts, manuals, or warranty cards
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {documents.map((doc) => (
            <div
              key={doc.path}
              className="group relative rounded-lg border bg-muted/30 overflow-hidden aspect-square"
            >
              {isImage(doc.name) ? (
                <a
                  href={doc.signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full"
                >
                  <img
                    src={doc.signedUrl}
                    alt={doc.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                </a>
              ) : (
                <a
                  href={doc.signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center w-full h-full p-3 text-center"
                >
                  <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-xs truncate max-w-full">{doc.name}</span>
                  <ExternalLink className="h-3 w-3 mt-1 text-muted-foreground" />
                </a>
              )}
              <button
                type="button"
                onClick={() => deleteDocument(doc.path)}
                className="absolute top-1 right-1 p-1 rounded-md bg-background/80 backdrop-blur opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all"
                aria-label={`Delete ${doc.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
