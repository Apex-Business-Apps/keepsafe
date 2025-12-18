import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Camera, FileText, AlertTriangle, Lock, Smartphone, Zap, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoSvg from "@/assets/keepsafe-logo.svg";

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
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background Grid */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass-effect border-b border-primary/20">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/30 blur-xl rounded-full" />
              <div className="h-8 w-8 relative z-10 text-primary" style={{ 
                WebkitMask: `url(${logoSvg}) center/contain no-repeat`,
                mask: `url(${logoSvg}) center/contain no-repeat`,
                backgroundColor: 'currentColor'
              }} />
            </div>
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              KeepSafe
            </span>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate("/auth")}
            className="border-primary/30 hover:border-accent hover:bg-accent/10 hover:text-accent-foreground font-semibold transition-all"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 gradient-hero overflow-hidden">
        {/* Animated orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="container mx-auto max-w-5xl relative z-10">
          {/* Badge centered in inner column */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-5 py-2 glass-effect rounded-full text-sm font-bold border border-accent/30 neon-effect">
              <Zap className="h-4 w-4 text-accent" />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Next-Gen Home Protection
              </span>
            </div>
          </div>
          
          {/* Hero content raised higher */}
          <h1 className="text-6xl md:text-7xl font-black text-foreground mb-5 leading-[0.95] text-balance text-center">
            Secure Your
            <br />
            <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent inline-block">
              Entire Life
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed font-medium text-center">
            Finally, a way to remember what you own and get a heads-up when something's recalled. 
            Because <span className="text-accent font-bold">your stuff matters</span>.
          </p>
          
          {/* Single primary CTA below subhead */}
          <div className="flex justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")} 
              className="text-lg h-14 px-10 gradient-accent hover:opacity-90 shadow-premium neon-effect transition-all duration-150 hover:scale-105 font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 text-primary"
              aria-label="Get Started with KeepSafe"
            >
              Get Started
            </Button>
          </div>

          {/* Trust chips row under CTA */}
          <ul className="hero__chips" aria-label="Key benefits">
            <li>2-min setup</li>
            <li aria-hidden="true">•</li>
            <li>No credit card to start</li>
            <li aria-hidden="true">•</li>
            <li>Start free, upgrade anytime</li>
          </ul>

          {/* Stats with unique styling */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto pt-12 mt-12 border-t border-primary/20">
            {stats.map((stat) => (
              <div key={stat.label} className="group text-center">
                <div className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-150">
                  {stat.value}
                </div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4 clip-diagonal bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-1.5 glass-effect rounded-full border border-primary/20">
              <span className="text-sm font-bold uppercase tracking-wider text-primary">Features</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-foreground mb-6 text-balance">
              Built for <span className="text-accent">Maximum Protection</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title} 
                className="group relative glass-effect border border-primary/20 rounded-2xl p-8 hover:border-accent/50 transition-all duration-300 hover:shadow-premium hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 w-14 h-14 flex items-center justify-center mb-5 group-hover:neon-effect transition-all duration-300">
                    <feature.icon className="h-6 w-6 text-primary group-hover:text-accent transition-colors" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-black text-foreground mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
              Loved by <span className="text-primary">Thousands</span>
            </h2>
            <p className="text-lg text-muted-foreground font-medium">Real results from real users</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
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
              <div 
                key={index}
                className="glass-effect border border-primary/20 rounded-2xl p-6 hover:border-accent/50 transition-all duration-300 hover:shadow-premium hover:-translate-y-1"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-accent fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-foreground/90 mb-6 leading-relaxed font-medium">
                  "{testimonial.quote}"
                </p>
                <div className="pt-4 border-t border-primary/10">
                  <p className="font-bold text-foreground">{testimonial.author}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 gradient-primary text-primary-foreground overflow-hidden clip-diagonal">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-20 w-96 h-96 bg-accent rounded-full blur-[100px]" />
          <div className="absolute bottom-10 right-20 w-[500px] h-[500px] bg-background rounded-full blur-[120px]" />
        </div>
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-black mb-6 text-balance">
            Ready to Protect Everything?
          </h2>
          <p className="text-xl md:text-2xl mb-10 opacity-95 max-w-3xl mx-auto leading-relaxed font-medium">
            Join the security revolution. Start cataloging in under 5 minutes.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate("/auth")} 
            className="text-lg h-16 px-12 bg-accent text-accent-foreground hover:bg-accent/90 shadow-premium neon-effect hover:scale-105 transition-all duration-300 font-black"
          >
            Start Now - It's Free
            <Zap className="ml-2 h-5 w-5" />
          </Button>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm opacity-90 font-medium">
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              No credit card
            </span>
            <span>•</span>
            <span>2min setup</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/20 py-8 px-4 glass-effect">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 text-primary" style={{ 
                WebkitMask: `url(${logoSvg}) center/contain no-repeat`,
                mask: `url(${logoSvg}) center/contain no-repeat`,
                backgroundColor: 'currentColor'
              }} />
              <span className="text-xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                KeepSafe
              </span>
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              © 2025 KeepSafe. Advanced Protection Tech. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;