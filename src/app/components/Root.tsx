import { Outlet, Link, useLocation } from "react-router";
import { Button } from "./ui/button.js";
import { Menu, X } from "lucide-react";
import { useId, useState } from "react";

function BrandMark({ className = "" }: { className?: string }) {
  const gradientId = useId();

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id={gradientId} x1="5" y1="4" x2="35" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9333EA" />
          <stop offset="1" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      <path
        d="M6 14.5H34V31.5C34 33.433 32.433 35 30.5 35H9.5C7.567 35 6 33.433 6 31.5V14.5Z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M7.5 12.5L11 5H15L11.5 12.5M19 5L15.5 12.5M26.5 5L23 12.5M34 5L30.5 12.5"
        stroke={`url(#${gradientId})`}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M18 20.25L25 24.75L18 29.25V20.25Z" fill="white" />
    </svg>
  );
}

export function Root() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <BrandMark className="size-8 shrink-0" />
              <span className="font-bold text-xl">My Portfolio</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm transition-colors hover:text-foreground/80 ${
                    isActive(item.path)
                      ? "text-foreground font-medium"
                      : "text-foreground/60"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <Button asChild>
                <Link to="/contact">Get in Touch</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm transition-colors hover:text-foreground/80 ${
                    isActive(item.path)
                      ? "text-foreground font-medium"
                      : "text-foreground/60"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Button asChild className="w-full">
                <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>
                  Get in Touch
                </Link>
              </Button>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <BrandMark className="size-6 shrink-0" />
              <span className="font-semibold">My Portfolio</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 My Portfolio. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                YouTube
              </a>
              <a
                href="https://vimeo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Vimeo
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
