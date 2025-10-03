import { useEffect } from "react";

const SitemapRoute = () => {
  useEffect(() => {
    // Redirect to edge function that generates sitemap
    const fetchSitemap = async () => {
      try {
        const response = await fetch(
          'https://aljdaazlgjcfwirqfjuc.supabase.co/functions/v1/generate-sitemap'
        );
        const xml = await response.text();
        
        // Create blob and download
        const blob = new Blob([xml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sitemap.xml';
        link.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error fetching sitemap:', error);
      }
    };

    fetchSitemap();
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary/30 border-t-primary" />
        <p className="text-muted-foreground font-medium">Generating sitemap...</p>
      </div>
    </div>
  );
};

export default SitemapRoute;
