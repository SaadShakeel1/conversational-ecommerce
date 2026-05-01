import type { Metadata } from "next";
import "@/styles/globals.css";
import { ThemeProvider } from "@/lib/ThemeContext";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import CursorTrail from "@/components/common/CursorTrail";

export const metadata: Metadata = {
  title: {
    default: "ConvoShop — AI-Powered Conversational E-Commerce",
    template: "%s | ConvoShop",
  },
  description:
    "Shop smarter with ConvoShop — an AI-powered conversational shopping assistant. Search, compare, and buy products using natural language.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider>
          <CursorTrail />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
