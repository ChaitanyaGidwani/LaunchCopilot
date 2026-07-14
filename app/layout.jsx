import "./globals.css";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

const title = "LaunchCopilot — promotion kit for your new app";
const description =
  "Turn basic info about your newly launched mobile app into channel-aware ASO copy, social posts, a Product Hunt pitch, a Reddit post, and a 7-day promotion plan.";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title,
  description,
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚀</text></svg>",
  },
  openGraph: {
    title,
    description,
    siteName: "LaunchCopilot",
    type: "website",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

// Applied before hydration so the light/dark theme never flashes on load.
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("lc-theme");document.documentElement.setAttribute("data-theme", t === "light" ? "light" : "dark");}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body suppressHydrationWarning>
        <header className="site-header">
          <div className="site-header-inner">
            <Link href="/" className="logo">
              <span className="logo-mark">🚀</span>
              <span className="logo-text">LaunchCopilot</span>
            </Link>
            <nav className="site-nav">
              <span className="tagline-sm">ship the app, we ship the launch</span>
              <Link href="/pricing" className="nav-link">
                Pricing
              </Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
        <footer className="site-footer">
          <div className="site-footer-inner">
            <span className="foot-brand">🚀 LaunchCopilot</span>
            <p className="hint">
              Your first launch kit is free · Pro ₹499/mo for unlimited apps,
              regeneration &amp; tracking
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
