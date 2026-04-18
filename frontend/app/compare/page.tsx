"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { ProductOut } from "@/lib/types";
import ComparisonGrid from "@/components/products/ComparisonGrid";

function CompareContent() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids");

  const [products, setProducts] = useState<ProductOut[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!idsParam) return;
    const ids = idsParam.split(",").map(Number).filter(Boolean);
    if (ids.length === 0) return;

    (async () => {
      setPending(true);
      setError(null);
      try {
        const data = await api.products.compare(ids);
        setProducts(data.products);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Comparison failed");
      } finally {
        setPending(false);
      }
    })();
  }, [idsParam]);

  const handleRemove = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <>
      {pending && (
        <div className="space-y-4">
          <div className="skeleton h-12 w-full rounded-xl" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-10 w-full rounded-xl" />
          ))}
        </div>
      )}

      {error && (
        <div className="glass-card border-red-500/30 p-4 text-red-400 text-sm text-center">
          ⚠️ {error}
        </div>
      )}

      {!pending && !error && idsParam && (
        <div className="glass-card overflow-hidden">
          <ComparisonGrid products={products} onRemove={handleRemove} />
        </div>
      )}

      {!pending && !idsParam && (
        <div className="glass-card p-12 text-center animate-fade-in">
          <span className="text-5xl mb-4 block">📊</span>
          <h3 className="text-xl font-display font-semibold text-white mb-2">
            No products selected
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            Go to the products page and select items to compare.
          </p>
          <Link href="/products" className="btn-primary text-sm">
            Browse Products →
          </Link>
        </div>
      )}
    </>
  );
}

export default function ComparePage() {
  return (
    <div className="section-container py-8 sm:py-12">
      <div className="page-header !py-6">
        <h1 className="page-title">Compare Products</h1>
        <p className="page-subtitle">
          See products side-by-side to make the best choice
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-4">
            <div className="skeleton h-12 w-full rounded-xl" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-10 w-full rounded-xl" />
            ))}
          </div>
        }
      >
        <CompareContent />
      </Suspense>
    </div>
  );
}
