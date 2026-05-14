import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Search, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Recall { id: number; brand: string; model: string; title: string; source: string; published_date: string | null; }
interface BrandGroup { brand: string; count: number; }

const PAGE_SIZE = 50;

const RecallDirectory = () => {
  const navigate = useNavigate();
  const [recalls, setRecalls] = useState<Recall[]>([]);
  const [brands, setBrands] = useState<BrandGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'brands' | 'search'>('brands');

  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('recalls')
          .select('brand')
          .order('brand', { ascending: true })
          .limit(1000);
        if (error) throw error;
        const brandMap = new Map<string, number>();
        (data || []).forEach((recall) => brandMap.set(recall.brand, (brandMap.get(recall.brand) || 0) + 1));
        setBrands(Array.from(brandMap.entries()).map(([brand, count]) => ({ brand, count })).sort((a, b) => a.brand.localeCompare(b.brand)));
      } catch (err) {
        console.error('Error fetching recall brands:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    const query = searchQuery.trim();
    setView(query.length > 0 ? 'search' : 'brands');
    if (query.length === 0) {
      setRecalls([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      setLoading(true);
      try {
        const pattern = `%${query.replace(/[%_]/g, '')}%`;
        const { data, error } = await supabase
          .from('recalls')
          .select('id, brand, model, title, source, published_date')
          .or(`title.ilike.${pattern},brand.ilike.${pattern},model.ilike.${pattern}`)
          .order('published_date', { ascending: false })
          .limit(PAGE_SIZE);
        if (error) throw error;
        setRecalls(data || []);
      } catch (err) {
        console.error('Error searching recalls:', err);
        setRecalls([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [searchQuery]);

  if (loading && view === 'brands' && brands.length === 0) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-center space-y-4"><div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary/30 border-t-primary" /><p className="text-muted-foreground font-medium">Loading recall directory...</p></div></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-effect border-b border-primary/20"><div className="container mx-auto px-6 py-4 flex justify-between items-center"><div className="flex items-center gap-3"><Shield className="h-6 w-6 text-primary" strokeWidth={2.5} /><h1 className="text-xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">KeepSafe</h1></div><Button onClick={() => navigate("/")} variant="ghost">Back to Home</Button></div></header>
      <main className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="mb-8"><h1 className="text-4xl font-black text-foreground mb-4">Recall Directory</h1><p className="text-muted-foreground mb-6">Search and browse official product recalls from CPSC, Health Canada, and EU Safety Gate.</p><div className="relative max-w-2xl"><Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input type="search" placeholder="Search by brand, model, or product name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-12 h-12 text-base" /></div></div>
        {view === 'brands' ? (
          <div><h2 className="text-2xl font-bold text-foreground mb-6">Browse by Brand ({brands.length})</h2><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{brands.map(({ brand, count }) => (<Link key={brand} to={`/recalls/${encodeURIComponent(brand)}`} className="glass-effect border border-primary/20 rounded-xl p-6 hover:border-primary/40 transition-all duration-150 hover:scale-105"><div className="flex justify-between items-center"><h3 className="text-lg font-bold text-foreground">{brand}</h3><span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">{count} recall{count !== 1 ? 's' : ''}</span></div></Link>))}</div></div>
        ) : (
          <div><h2 className="text-2xl font-bold text-foreground mb-6">Search Results {loading ? '(searching...)' : `(${recalls.length}${recalls.length === PAGE_SIZE ? '+' : ''})`}</h2>{recalls.length === 0 && !loading ? (<div className="text-center py-20"><AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" /><h3 className="text-2xl font-bold mb-2">No Results Found</h3><p className="text-muted-foreground">Try adjusting your search terms.</p></div>) : (<div className="grid gap-6">{recalls.map((recall) => (<Link key={recall.id} to={`/recalls/${encodeURIComponent(recall.brand)}/${encodeURIComponent(recall.model)}`} className="glass-effect border border-primary/20 rounded-2xl p-6 hover:border-primary/40 transition-all duration-150 hover:scale-[1.02]"><div className="flex items-start gap-4"><AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" /><div className="flex-1"><h3 className="text-lg font-bold text-foreground mb-2">{recall.title}</h3><div className="flex flex-wrap gap-4 text-sm text-muted-foreground"><span>Brand: {recall.brand}</span><span>Model: {recall.model}</span>{recall.published_date && <span>{new Date(recall.published_date).toLocaleDateString()}</span>}<span className="font-semibold">{recall.source === 'cpsc' ? 'US CPSC' : recall.source === 'hc' ? 'Health Canada' : 'EU Safety Gate'}</span></div></div></div></Link>))}</div>)}</div>
        )}
      </main>
    </div>
  );
};

export default RecallDirectory;
