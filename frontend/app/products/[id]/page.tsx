"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { ProductOut } from "@/lib/types";

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<ProductOut | null>(null);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    (async () => {
      setPending(true);
      try {
        const data = await api.products.get(Number(params.id));
        setProduct(data);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load product");
      } finally {
        setPending(false);
      }
    })();
  }, [params.id]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    try {
      await api.cart.addItem(product.id);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  if (pending) {
    return (
      <div className="section-container py-12">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="skeleton h-80 rounded-2xl" />
          <div className="space-y-4">
            <div className="skeleton h-8 w-3/4" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-2/3" />
            <div className="skeleton h-12 w-40 mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="section-container py-20 text-center">
        <span className="text-5xl mb-4 block">😕</span>
        <h2 className="text-2xl font-display font-bold text-white mb-2">
          Product Not Found
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          {error || "This product doesn't exist or has been removed."}
        </p>
        <Link href="/products" className="btn-secondary">
          ← Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="section-container py-8 sm:py-12 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/products" className="hover:text-neon-green transition-colors">
          Products
        </Link>
        <span>/</span>
        <span className="text-gray-300 truncate">{product.name}</span>
      </nav>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="glass-card p-8 flex items-center justify-center min-h-[320px]">
          <div className="text-8xl opacity-60">
            {product.category === "electronics"
              ? "💻"
              : product.category === "footwear"
              ? "👟"
              : product.category === "clothing"
              ? "👕"
              : "🛍️"}
          </div>
        </div>

        {/* Details */}
        <div>
          {/* Category */}
          {product.category && (
            <span className="badge mb-4 inline-block">{product.category}</span>
          )}

          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">
            {product.name}
          </h1>

          <div className="text-3xl font-bold text-neon-green mb-4">
            ${product.price.toFixed(2)}
          </div>

          {product.description && (
            <p className="text-gray-400 leading-relaxed mb-6">
              {product.description}
            </p>
          )}

          {/* Attributes */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {product.color && (
              <div className="glass-card p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Color</p>
                <p className="text-sm text-white font-medium mt-1">{product.color}</p>
              </div>
            )}
            {product.size && (
              <div className="glass-card p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Size</p>
                <p className="text-sm text-white font-medium mt-1">{product.size}</p>
              </div>
            )}
            {product.model_tag && (
              <div className="glass-card p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Model</p>
                <p className="text-sm text-neon-green font-medium mt-1">{product.model_tag}</p>
              </div>
            )}
          </div>

          {/* Specs */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
                Specifications
              </h3>
              <div className="glass-card divide-y divide-surface-500/30">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-gray-400 capitalize">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="text-sm text-white font-medium">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="btn-primary flex-1"
            >
              {addingToCart ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-surface-900 border-t-transparent rounded-full animate-spin" />
                  Adding...
                </div>
              ) : addedToCart ? (
                "✓ Added to Cart!"
              ) : (
                "🛒 Add to Cart"
              )}
            </button>
            <Link href="/cart" className="btn-secondary">
              View Cart
            </Link>
          </div>

          {/* Success toast */}
          {addedToCart && (
            <div className="mt-4 p-3 rounded-xl bg-neon-green/10 border border-neon-green/30 text-neon-green text-sm animate-fade-in">
              ✓ Added to your cart!{" "}
              <Link href="/cart" className="underline font-medium">
                View cart →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
