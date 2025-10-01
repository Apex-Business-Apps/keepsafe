import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Camera, FileText, AlertTriangle, Lock, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Camera,
      title: "Scan & Store",
      description: "Instantly capture product barcodes and receipts with your camera. Never lose warranty info again."
    },
    {
      icon: FileText,
      title: "Digital Binder",
      description: "Export your entire inventory to a professional PDF binder. Perfect for insurance claims."
    },
    {
      icon: AlertTriangle,
      title: "Recall Monitoring",
      description: "Automatic alerts when your items are recalled. Stay informed and keep your family safe."
    },
    {
      icon: Lock,
      title: "Secure & Private",
      description: "Your data is encrypted and protected. You control your information, always."
    },
    {
      icon: Smartphone,
      title: "Works Offline",
      description: "Access your inventory anytime, anywhere. Progressive web app works without internet."
    },
    {
      icon: Shield,
      title: "Peace of Mind",
      description: "Track warranties, purchase dates, and values. Be prepared for insurance claims."
    }
  ];

  const stats = [
    { value: "10,000+", label: "Items Protected" },
    { value: "99.9%", label: "Uptime" },
    { value: "500+", label: "Happy Families" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Shield className="h-9 w-9 text-primary drop-shadow-lg" />
              <div className="absolute inset-0 glow-effect rounded-full opacity-50" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              KeepSafe
            </span>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate("/auth")}
            className="border-primary/20 hover:border-primary/40 hover:bg-primary/5"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-32 px-4 text-center gradient-hero overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="inline-flex items-center gap-2 mb-6 px-6 py-2.5 bg-primary/10 backdrop-blur-sm text-primary rounded-full text-sm font-semibold border border-primary/20 shadow-premium">
            <Shield className="h-4 w-4" />
            Protect Your Home & Family
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-foreground mb-8 leading-tight text-balance">
            Your Home Inventory,
            <br />
            <span className="gradient-primary bg-clip-text text-transparent">
              Safe & Organized
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed text-balance">
            Track your belongings, monitor product recalls, and export everything for insurance claims. 
            The smart way to protect what matters most.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center mb-16">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")} 
              className="text-lg h-16 px-10 gradient-primary hover:opacity-90 shadow-premium glow-effect transition-all duration-300 hover:scale-105"
            >
              Get Started Free
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg h-16 px-10 border-2 border-primary/30 hover:border-primary hover:bg-primary/5 transition-all duration-300"
            >
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-12 max-w-3xl mx-auto pt-12 border-t border-border/50">
            {stats.map((stat) => (
              <div key={stat.label} className="group">
                <div className="text-4xl md:text-5xl font-bold gradient-primary bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-4 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              Everything You Need to <span className="gradient-accent bg-clip-text text-transparent">Stay Protected</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto text-balance">
              Powerful features designed for busy families who want peace of mind
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={feature.title} 
                className="group border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-premium bg-card/50 backdrop-blur-sm overflow-hidden relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="pt-8 pb-6 relative z-10">
                  <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-32 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Trusted by <span className="gradient-primary bg-clip-text text-transparent">Families Everywhere</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-16">Real stories from real people</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "KeepSafe saved me thousands when my house was burglarized. Had everything documented for insurance.",
                author: "Sarah M.",
                role: "Homeowner"
              },
              {
                quote: "The recall alerts are amazing. Got notified about a crib recall before it was on the news.",
                author: "Michael T.",
                role: "Parent"
              },
              {
                quote: "So easy to use. Took me 30 minutes to catalog my entire home. Worth every second.",
                author: "Jessica L.",
                role: "Young Professional"
              }
            ].map((testimonial, index) => (
              <Card 
                key={index}
                className="border-border/50 hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur-sm shadow-premium hover:shadow-lg hover:scale-105"
              >
                <CardContent className="pt-8 pb-6">
                  <div className="flex justify-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-accent fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-muted-foreground italic mb-6 text-lg leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div className="pt-4 border-t border-border/50">
                    <p className="font-bold text-foreground text-lg">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4 gradient-primary text-primary-foreground overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-80 h-80 bg-accent rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
            Start Protecting Your Home Today
          </h2>
          <p className="text-xl md:text-2xl mb-12 opacity-95 max-w-3xl mx-auto leading-relaxed text-balance">
            Join thousands of families who sleep better knowing their belongings are tracked and protected.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate("/auth")} 
            className="text-lg h-16 px-12 bg-white text-primary hover:bg-white/90 shadow-premium hover:scale-105 transition-all duration-300 font-semibold"
          >
            Create Free Account
          </Button>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm opacity-90">
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              No credit card required
            </span>
            <span>•</span>
            <span>Free forever</span>
            <span>•</span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-4 bg-muted/20">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Shield className="h-7 w-7 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                KeepSafe
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 KeepSafe. Your home guardian. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;