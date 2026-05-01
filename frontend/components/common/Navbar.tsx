"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getToken } from "@/lib/auth";
import ThemeToggle from "@/components/common/ThemeToggle";

const links = [
  { href: "/",            label: "Home",        icon: "🏠" },
  { href: "/chat",        label: "Chat",         icon: "💬" },
  { href: "/products",    label: "Products",     icon: "🛍️" },
  { href: "/cart",        label: "Cart",         icon: "🛒" },
  { href: "/faq",         label: "FAQ",          icon: "❓" },
  { href: "/orders/track",label: "Track Order",  icon: "📦" },
];

export default function Navbar() {
  const pathname   = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLogged,   setIsLogged]   = useState(false);

  useEffect(() => {
    setIsLogged(!!getToken());
  }, [pathname]);

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-xl border-b"
      style={{
        backgroundColor: "color-mix(in srgb, var(--color-bg) 80%, transparent)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="section-container flex items-center justify-between h-16">
        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2 group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:shadow-[var(--color-glow-md)] transition-all duration-300"
            style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))" }}
          >
            <span style={{ color: "var(--color-logo-text)" }} className="font-bold text-sm">
              CE
            </span>
          </div>
          <span className="font-display font-bold text-lg hidden sm:block">
            <span className="text-white">Convo</span>
            <span style={{ color: "var(--color-accent)" }}>Shop</span>
          </span>
        </Link>

        {/* ── Desktop Nav ── */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? "border"
                    : "text-gray-400 hover:text-white"
                }`}
                style={
                  active
                    ? {
                        backgroundColor: "var(--color-accent-10)",
                        color:           "var(--color-accent)",
                        borderColor:     "var(--color-accent-20)",
                      }
                    : undefined
                }
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                      "color-mix(in srgb, var(--color-surface-alt) 50%, transparent)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "";
                  }
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* ── Right side: Theme toggle + Auth + Hamburger ── */}
        <div className="flex items-center gap-2">
          {/* Theme Switcher */}
          <ThemeToggle />

          {/* Auth */}
          {isLogged ? (
            <Link
              href="/account"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors border"
              style={{
                backgroundColor: "var(--color-surface-alt)",
                borderColor:     "var(--color-border)",
              }}
              title="Account Settings"
            >
              <span className="text-lg">👤</span>
            </Link>
          ) : (
            <>
              <Link href="/auth/login"    className="btn-ghost text-xs sm:text-sm">Sign In</Link>
              <Link href="/auth/register" className="btn-primary text-xs sm:text-sm !px-4 !py-2">Sign Up</Link>
            </>
          )}

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
            style={{ backgroundColor: mobileOpen ? "var(--color-surface-alt)" : "" }}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div
          className="md:hidden border-t backdrop-blur-xl animate-fade-in"
          style={{
            backgroundColor: "color-mix(in srgb, var(--color-bg) 95%, transparent)",
            borderColor:      "var(--color-border)",
          }}
        >
          <div className="section-container py-4 space-y-1">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                  style={
                    active
                      ? { backgroundColor: "var(--color-accent-10)", color: "var(--color-accent)" }
                      : { color: "#9ca3af" }
                  }
                >
                  <span>{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
