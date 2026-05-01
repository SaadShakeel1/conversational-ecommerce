"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { ProductOut } from "@/lib/types";
import ProductCard from "@/components/products/ProductCard";

export default function ProductsPage() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductOut[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const search = useCallback(async (q: string) => {
    setPending(true);
    setError(null);
    setHasSearched(true);
    try {
      const data = await api.products.search({ q, limit: 20 });
      setProducts(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setPending(false);
    }
  }, []);

  // Initial load — fetch all products
  useEffect(() => {
    search("");
  }, [search]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    search(query);
  };

  const toggleCompare = (id: number) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="section-container py-8 sm:py-12">
      {/* Header */}
      <div className="page-header !py-6">
        <h1 className="page-title">Products</h1>
        <p className="page-subtitle">
          Discover products with our AI-powered search
        </p>
      </div>

      {/* Search Bar */}
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto mb-10"
      >
        <div className="relative">
          <input
            id="product-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products by name, category, features..."
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
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

      {/* Compare Bar */}
      {compareIds.length > 0 && (
        <div className="glass-card p-4 mb-6 flex items-center justify-between animate-fade-in">
          <p className="text-sm text-gray-300">
            <span className="text-accent font-semibold">{compareIds.length}</span>{" "}
            product{compareIds.length > 1 ? "s" : ""} selected for comparison
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCompareIds([])}
              className="btn-ghost text-xs"
            >
              Clear
            </button>
            <Link
              href={`/compare?ids=${compareIds.join(",")}`}
              className="btn-primary text-xs !py-2"
            >
              Compare Now →
            </Link>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="glass-card border-red-500/30 p-4 text-red-400 text-sm mb-6 text-center animate-fade-in">
          ⚠️ {error}
        </div>
      )}

      {/* Loading Skeletons */}
      {pending && products.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="glass-card overflow-hidden">
              <div className="skeleton h-48" />
              <div className="p-4 space-y-3">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-8 w-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results Grid */}
      {!pending && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onCompare={toggleCompare}
              compareSelected={compareIds.includes(product.id)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!pending && hasSearched && products.length === 0 && !error && (
        <div className="glass-card p-12 text-center animate-fade-in">
          <span className="text-5xl mb-4 block">🔍</span>
          <h3 className="text-xl font-display font-semibold text-white mb-2">
            No products found
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            Try a different search term or browse all products.
          </p>
          <button
            onClick={() => {
              setQuery("");
              search("");
            }}
            className="btn-secondary text-sm"
          >
            Show All Products
          </button>
        </div>
      )}
    </div>
  );
}
