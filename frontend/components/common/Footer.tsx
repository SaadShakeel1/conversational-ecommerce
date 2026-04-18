"use client";

import Link from "next/link";

const footerLinks = [
  {
    title: "Shop",
    links: [
      { href: "/products", label: "All Products" },
      { href: "/compare", label: "Compare" },
      { href: "/cart", label: "Cart" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/orders/track", label: "Track Order" },
      { href: "/promo", label: "Promo Codes" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/auth/login", label: "Sign In" },
      { href: "/auth/register", label: "Register" },
      { href: "/account", label: "My Account" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-surface-500/30 bg-surface-900/50 mt-20">
      <div className="section-container py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-neon-green flex items-center justify-center">
                <span className="text-surface-900 font-bold text-sm">CE</span>
              </div>
              <span className="font-display font-bold text-lg">
                <span className="text-white">Convo</span>
                <span className="text-neon-green">Shop</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              AI-powered conversational shopping. Find products, compare,
              and shop — all through natural language.
            </p>
          </div>

          {footerLinks.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
                {col.title}
              </h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-neon-green transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="divider mt-8 mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-600 text-xs">
          <p>© {new Date().getFullYear()} ConvoShop. Conversational E-Commerce Platform.</p>
          <p>
            Powered by <span className="text-neon-green">RAG</span> · Built with Next.js + FastAPI
          </p>
        </div>
      </div>
    </footer>
  );
}
