import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined"
      ? encodeURIComponent(window.location.hostname)
      : "";
  const footerHref = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-subtle sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          {/* Botanical icon */}
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className="text-primary-foreground"
              aria-label="Jasmine leaf icon"
              role="img"
            >
              <path
                d="M12 22V10M12 10C12 10 8 8 6 4C9.5 3 13 5.5 12 10ZM12 10C12 10 16 8 18 4C14.5 3 11 5.5 12 10Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 16c1.5-1 3.5-1.5 6-1.5s4.5.5 6 1.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-display font-semibold text-foreground leading-tight">
              Jasmine Detect
            </h1>
            <p className="text-xs text-muted-foreground leading-tight">
              Maturity stage analysis
            </p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col">{children}</main>

      {/* Footer */}
      <footer className="bg-muted/40 border-t border-border py-3 px-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {year}.{" "}
          <a
            href={footerHref}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors duration-200"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
