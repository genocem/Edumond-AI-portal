import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-white font-bold text-sm">DM</span>
              </div>
              <span className="font-bold text-lg text-foreground">Digital Minds</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Helping students find the perfect study, training, and career programs abroad.
              Your gateway to international education and opportunities.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/questionnaire" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Start Questionnaire
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Destinations</h4>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground">🇩🇪 Germany</li>
              <li className="text-sm text-muted-foreground">🇮🇹 Italy</li>
              <li className="text-sm text-muted-foreground">🇪🇸 Spain</li>
              <li className="text-sm text-muted-foreground">🇧🇪 Belgium</li>
              <li className="text-sm text-muted-foreground">🇹🇷 Turkey</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Digital Minds. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
