import { Shield, Lock, Eye, FileText, UserCheck, AlertCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Privacy = () => {
  const navigate = useNavigate();

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
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="glass-effect border border-primary/20 rounded-2xl p-8 space-y-8">
            {/* PIPEDA Principle 1: Accountability */}
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <UserCheck className="h-6 w-6 text-accent" />
                <h2 className="text-2xl font-bold text-foreground">Accountability</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                KeepSafe is responsible for personal information under its control. We have designated individuals
                accountable for our compliance with privacy principles. For questions or concerns, contact us at
                privacy@keepsafe.app.
              </p>
            </section>

            {/* PIPEDA Principle 2: Identifying Purposes */}
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-accent" />
                <h2 className="text-2xl font-bold text-foreground">Purpose of Collection</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We collect personal information to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Manage your home inventory and warranty tracking</li>
                <li>Alert you about product recalls affecting your items</li>
                <li>Provide binder exports and receipt management</li>
                <li>Improve our service and user experience</li>
              </ul>
            </section>

            {/* PIPEDA Principle 3: Consent */}
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-accent" />
                <h2 className="text-2xl font-bold text-foreground">Consent</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                By using KeepSafe, you consent to our collection, use, and disclosure of your personal information
                as described in this policy. You may withdraw consent at any time by deleting your account and data
                through the app settings.
              </p>
            </section>

            {/* PIPEDA Principle 4: Limiting Collection */}
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <Eye className="h-6 w-6 text-accent" />
                <h2 className="text-2xl font-bold text-foreground">Limiting Collection</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We only collect information necessary to fulfill the purposes identified. This includes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Email address for authentication</li>
                <li>Item details (name, brand, model, serial numbers)</li>
                <li>Receipt photos (optional)</li>
                <li>Usage analytics (signup, items added, recalls viewed)</li>
              </ul>
            </section>

            {/* PIPEDA Principle 5: Limiting Use, Disclosure, and Retention */}
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <Lock className="h-6 w-6 text-accent" />
                <h2 className="text-2xl font-bold text-foreground">Use and Disclosure</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Personal information is used only for the purposes for which it was collected. We do not sell, rent,
                or share your data with third parties except as required by law. Data is retained only as long as
                necessary to fulfill stated purposes.
              </p>
            </section>

            {/* PIPEDA Principle 6: Accuracy */}
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-accent" />
                <h2 className="text-2xl font-bold text-foreground">Accuracy</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We rely on you to ensure your personal information is accurate and up-to-date. You can update your
                information at any time through your account settings.
              </p>
            </section>

            {/* PIPEDA Principle 7: Safeguards */}
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-accent" />
                <h2 className="text-2xl font-bold text-foreground">Security Safeguards</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We protect personal information with security safeguards appropriate to the sensitivity of the
                information, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Encryption of data in transit (HTTPS/TLS)</li>
                <li>Secure authentication with industry-standard practices</li>
                <li>Row-level security policies on database tables</li>
                <li>Regular security audits and updates</li>
                <li>Rate limiting to prevent abuse</li>
              </ul>
            </section>

            {/* PIPEDA Principle 8: Openness */}
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <Eye className="h-6 w-6 text-accent" />
                <h2 className="text-2xl font-bold text-foreground">Openness</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                This privacy policy is publicly available and explains our practices regarding the management of
                personal information. Updates to this policy will be posted here with an updated date.
              </p>
            </section>

            {/* PIPEDA Principle 9: Individual Access */}
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-accent" />
                <h2 className="text-2xl font-bold text-foreground">Your Rights</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Access your personal information</li>
                <li>Request corrections to inaccurate data</li>
                <li>Export your data in CSV or PDF format</li>
                <li>Delete your account and all associated data</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                All these actions are available directly in the app under Settings.
              </p>
            </section>

            {/* PIPEDA Principle 10: Challenging Compliance */}
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-6 w-6 text-accent" />
                <h2 className="text-2xl font-bold text-foreground">Questions & Complaints</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions or concerns about our privacy practices, please contact us at:
              </p>
              <div className="bg-muted/50 rounded-lg p-4 mt-3">
                <p className="font-semibold text-foreground">Email: privacy@keepsafe.app</p>
                <p className="text-sm text-muted-foreground mt-2">
                  We will investigate and respond to all complaints within 30 days.
                </p>
              </div>
            </section>

            {/* Data Processing Location */}
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-accent" />
                <h2 className="text-2xl font-bold text-foreground">Data Storage</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Your data is stored on secure servers. We use Supabase for backend services, which provides
                enterprise-grade security and compliance. Recall information is sourced from official government
                databases (CPSC, Health Canada).
              </p>
            </section>
          </div>

          <div className="text-center pt-6">
            <Button onClick={() => navigate("/")} size="lg" className="font-bold">
              Return to Home
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
