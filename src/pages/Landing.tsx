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
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">KeepSafe</span>
          </div>
          <Button variant="outline" onClick={() => navigate("/auth")}>
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <div className="container mx-auto max-w-4xl">
          <div className="inline-block mb-4 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
            Protect Your Home & Family
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Your Home Inventory,
            <br />
            <span className="text-primary">Safe & Organized</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Track your belongings, monitor product recalls, and export everything for insurance claims. 
            The smart way to protect what matters most.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" onClick={() => navigate("/auth")} className="text-lg h-14 px-8">
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" className="text-lg h-14 px-8">
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8 border-t border-border">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Everything You Need to Stay Protected
            </h2>
            <p className="text-xl text-muted-foreground">
              Powerful features designed for busy families who want peace of mind
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-12">
            Trusted by Families Everywhere
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border">
              <CardContent className="pt-6">
                <p className="text-muted-foreground italic mb-4">
                  "KeepSafe saved me thousands when my house was burglarized. Had everything documented for insurance."
                </p>
                <p className="font-semibold text-foreground">- Sarah M.</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="pt-6">
                <p className="text-muted-foreground italic mb-4">
                  "The recall alerts are amazing. Got notified about a crib recall before it was on the news."
                </p>
                <p className="font-semibold text-foreground">- Michael T.</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="pt-6">
                <p className="text-muted-foreground italic mb-4">
                  "So easy to use. Took me 30 minutes to catalog my entire home. Worth every second."
                </p>
                <p className="font-semibold text-foreground">- Jessica L.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-4">
            Start Protecting Your Home Today
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of families who sleep better knowing their belongings are tracked and protected.
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate("/auth")} className="text-lg h-14 px-8">
            Create Free Account
          </Button>
          <p className="mt-4 text-sm opacity-75">
            No credit card required • Free forever • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-semibold text-foreground">KeepSafe</span>
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