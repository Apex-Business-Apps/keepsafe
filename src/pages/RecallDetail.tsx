import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shield, ExternalLink, AlertTriangle, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface Recall {
  id: number;
  brand: string;
  model: string;
  title: string;
  url: string;
  source: string;
  published_date: string;
}

const RecallDetail = () => {
  const { brand, model } = useParams();
  const navigate = useNavigate();
  const [recall, setRecall] = useState<Recall | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecall = async () => {
      if (!brand || !model) return;

      try {
        const { data, error } = await supabase
          .from('recalls')
          .select('*')
          .eq('brand', brand)
          .eq('model', model)
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching recall:', error);
          toast({
            title: "Error loading recall",
            description: "Please try again later",
            variant: "destructive",
          });
        } else if (data) {
          setRecall(data);
          
          // Track recall view event
          try {
            await supabase.functions.invoke('track-event', {
              body: {
                name: 'recall_alert_seen',
                props: { brand: data.brand, model: data.model, source: data.source },
              },
            });
          } catch (e) {
            console.error('Error tracking event:', e);
          }
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecall();
  }, [brand, model]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary/30 border-t-primary" />
          <p className="text-muted-foreground font-medium">Loading recall information...</p>
        </div>
      </div>
    );
  }

  if (!recall) {
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
            <Button onClick={() => navigate("/")} variant="ghost">
              Back to Home
            </Button>
          </div>
        </header>
        <div className="container mx-auto px-6 py-20 text-center">
          <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Recall Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The recall information you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/")}>Return to Home</Button>
        </div>
      </div>
    );
  }

  const sourceDisplay = {
    cpsc: 'US CPSC',
    hc: 'Health Canada',
    eu: 'EU Safety Gate',
  }[recall.source] || recall.source.toUpperCase();

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
          <Button onClick={() => navigate("/")} variant="ghost">
            Back to Home
            </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="space-y-8">
          {/* Alert Banner */}
          <div className="glass-effect border-2 border-destructive/50 bg-destructive/10 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-8 w-8 text-destructive flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-destructive mb-2">Product Recall Alert</h2>
                <p className="text-foreground">
                  This product has been officially recalled. Please review the details below and take appropriate action.
                </p>
              </div>
            </div>
          </div>

          {/* Recall Details */}
          <div className="glass-effect border border-primary/20 rounded-2xl p-8 space-y-6">
            <div>
              <h1 className="text-3xl font-black text-foreground mb-2">{recall.title}</h1>
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Tag className="h-5 w-5" />
                  <span className="font-semibold">{recall.brand}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Tag className="h-5 w-5" />
                  <span>Model: {recall.model}</span>
                </div>
                {recall.published_date && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-5 w-5" />
                    <span>{new Date(recall.published_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-bold text-foreground mb-3">Source</h3>
              <p className="text-muted-foreground">{sourceDisplay}</p>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-bold text-foreground mb-3">What to Do Next</h3>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Stop using the product immediately</li>
                <li>Review the official recall notice for specific instructions</li>
                <li>Contact the manufacturer or retailer for a refund or replacement</li>
                <li>Follow any safety precautions outlined in the official notice</li>
              </ol>
            </div>

            <div className="border-t border-border pt-6 space-y-4">
              <Button
                onClick={() => window.open(recall.url, '_blank')}
                size="lg"
                className="w-full font-bold"
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                View Official Recall Notice
              </Button>
              <Button
                onClick={() => navigate("/dashboard")}
                variant="outline"
                size="lg"
                className="w-full font-bold"
              >
                Export Your Insurance Binder
              </Button>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Always refer to the official notice for the most accurate and up-to-date information.
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="glass-effect border border-primary/20 rounded-xl p-6 bg-muted/30">
            <h4 className="font-bold text-foreground mb-2">Disclaimer</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              KeepSafe provides recall information as a convenience. This information is sourced from official
              government databases and is for informational purposes only. We do not provide legal or medical advice.
              Always consult the official recall notice and contact the manufacturer for specific guidance.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RecallDetail;
