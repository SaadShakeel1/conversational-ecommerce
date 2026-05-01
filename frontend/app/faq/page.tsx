"use client";

import { useState, useEffect, type FormEvent } from "react";
import { api } from "@/lib/api";
import type { FAQOut } from "@/lib/types";

export default function FAQPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FAQOut[]>([]);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchInitialFaqs = async () => {
      try {
        const data = await api.faq.search("");
        if (mounted) setResults(data);
      } catch (e: unknown) {
        if (mounted) setError(e instanceof Error ? e.message : "FAQ load failed");
      } finally {
        if (mounted) setPending(false);
      }
    };
    fetchInitialFaqs();
    return () => { mounted = false; };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    setHasSearched(true);
    try {
      const data = await api.faq.search(query);
      setResults(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "FAQ search failed");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="section-container py-8 sm:py-12">
      <div className="page-header !py-6">
        <h1 className="page-title">Frequently Asked Questions</h1>
        <p className="page-subtitle">
          Search our knowledge base for quick answers
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-10">
        <div className="relative">
          <input
            id="faq-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What would you like to know?"
            className="input-field pl-12 pr-24"
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <button
            type="submit"
            disabled={pending}
            className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary !py-2 !px-5 text-xs"
          >
            {pending ? "..." : "Search"}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="glass-card border-red-500/30 p-4 text-red-400 text-sm text-center mb-6">
          ⚠️ {error}
        </div>
      )}

      {/* Loading */}
      {pending && (
        <div className="max-w-3xl mx-auto space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6">
              <div className="skeleton h-5 w-3/4 mb-3" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-2/3 mt-2" />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!pending && results.length > 0 && (
        <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
          {results.map((faq) => (
            <div key={faq.id} className="glass-card-hover p-6">
              <h3 className="text-white font-semibold mb-2 flex items-start gap-3">
                <span className="text-accent text-lg leading-none">Q</span>
                {faq.question}
              </h3>
              <div className="flex items-start gap-3 ml-0">
                <span className="text-brand-400 text-lg leading-none font-bold">A</span>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!pending && hasSearched && results.length === 0 && !error && (
        <div className="glass-card p-12 text-center max-w-2xl mx-auto animate-fade-in">
          <span className="text-5xl mb-4 block">🤔</span>
          <h3 className="text-xl font-display font-semibold text-white mb-2">
            No matches found
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            Try a different question or chat with our AI for personalized help.
          </p>
          <a href="/chat" className="btn-primary text-sm">
            💬 Ask AI Instead
          </a>
        </div>
      )}
    </div>
  );
}

