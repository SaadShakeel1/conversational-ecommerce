"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/chat", label: "Chat", icon: "💬" },
  { href: "/products", label: "Products", icon: "🛍️" },
  { href: "/cart", label: "Cart", icon: "🛒" },
  { href: "/faq", label: "FAQ", icon: "❓" },
  { href: "/orders/track", label: "Track Order", icon: "📦" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-surface-900/80 border-b border-surface-500/30">
      <div className="section-container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-neon-green flex items-center justify-center
            group-hover:shadow-glow transition-all duration-300">
            <span className="text-surface-900 font-bold text-sm">CE</span>
          </div>
          <span className="font-display font-bold text-lg hidden sm:block">
            <span className="text-white">Convo</span>
            <span className="text-neon-green">Shop</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-neon-green/10 text-neon-green border border-neon-green/20"
                    : "text-gray-400 hover:text-white hover:bg-surface-700/50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Auth + Mobile Toggle */}
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="btn-ghost text-xs sm:text-sm">
            Sign In
          </Link>
          <Link href="/auth/register" className="btn-primary text-xs sm:text-sm !px-4 !py-2">
            Sign Up
          </Link>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-surface-700/50 transition-colors"
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

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-surface-500/30 bg-surface-900/95 backdrop-blur-xl animate-fade-in">
          <div className="section-container py-4 space-y-1">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-neon-green/10 text-neon-green"
                      : "text-gray-400 hover:text-white hover:bg-surface-700/50"
                  }`}
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
