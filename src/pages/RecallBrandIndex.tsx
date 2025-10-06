import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Recall {
  id: number;
  brand: string;
  model: string;
  title: string;
  source: string;
  published_date: string;
}

const RecallBrandIndex = () => {
  const { brand } = useParams();
  const navigate = useNavigate();
  const [recalls, setRecalls] = useState<Recall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrandRecalls = async () => {
      if (!brand) return;

      try {
        const { data, error } = await supabase
          .from('recalls')
          .select('*')
          .eq('brand', brand)
          .order('published_date', { ascending: false });

        if (error) {
          console.error('Error fetching recalls:', error);
        } else if (data) {
          setRecalls(data);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBrandRecalls();
  }, [brand]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary/30 border-t-primary" />
          <p className="text-muted-foreground font-medium">Loading recalls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-effect border-b border-primary/20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" strokeWidth={2.5} />
            <h1 className="text-xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              KeepSafe
            </h1>
          </div>
          <Button onClick={() => navigate("/recalls")} variant="ghost">
            All Recalls
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-foreground mb-4">
            {brand} Recalls
          </h1>
          <p className="text-muted-foreground">
            {recalls.length} recall{recalls.length !== 1 ? 's' : ''} found for this brand
          </p>
        </div>

        {recalls.length === 0 ? (
          <div className="text-center py-20">
            <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Recalls Found</h2>
            <p className="text-muted-foreground mb-6">
              No recalls have been reported for {brand}.
            </p>
            <Button onClick={() => navigate("/recalls")}>View All Recalls</Button>
          </div>
        ) : (
          <div className="grid gap-6">
            {recalls.map((recall) => (
              <Link
                key={recall.id}
                to={`/recalls/${recall.brand}/${recall.model}`}
                className="glass-effect border border-primary/20 rounded-2xl p-6 hover:border-primary/40 transition-all duration-150 hover:scale-[1.02]"
              >
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      {recall.title}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>Model: {recall.model}</span>
                      {recall.published_date && (
                        <span>{new Date(recall.published_date).toLocaleDateString()}</span>
                      )}
                      <span className="font-semibold">
                        {recall.source === 'cpsc' ? 'US CPSC' : recall.source === 'hc' ? 'Health Canada' : 'EU Safety Gate'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default RecallBrandIndex;
