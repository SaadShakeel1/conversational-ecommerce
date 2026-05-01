"use client";

import Link from "next/link";
import type { ProductOut } from "@/lib/types";

interface ProductCardProps {
  product: ProductOut;
  onCompare?: (id: number) => void;
  compareSelected?: boolean;
}

export default function ProductCard({
  product,
  onCompare,
  compareSelected,
}: ProductCardProps) {
  return (
    <div className="glass-card-hover p-0 overflow-hidden group">
      {/* Product Image Placeholder */}
      <div className="relative h-48 bg-gradient-to-br from-surface-700 to-surface-800 flex items-center justify-center overflow-hidden">
        <div className="text-5xl opacity-50 group-hover:scale-110 transition-transform duration-500">
          {product.category === "electronics"
            ? "💻"
            : product.category === "footwear"
            ? "👟"
            : product.category === "clothing"
            ? "👕"
            : "🛍️"}
        </div>
        {/* Price Tag */}
        <div className="absolute top-3 right-3 bg-surface-900/80 backdrop-blur-sm text-accent font-bold text-sm px-3 py-1 rounded-full border border-accent/20">
          ${product.price.toFixed(2)}
        </div>
        {/* Category Badge */}
        {product.category && (
          <div className="absolute top-3 left-3">
            <span className="badge-neutral text-[10px]">{product.category}</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-white text-sm mb-1 line-clamp-1 hover:text-accent transition-colors">
            {product.name}
          </h3>
        </Link>
        {product.description && (
          <p className="text-gray-500 text-xs line-clamp-2 mb-3">
            {product.description}
          </p>
        )}

        {/* Attributes */}
        <div className="flex flex-wrap gap-1 mb-3">
          {product.color && (
            <span className="badge-neutral text-[10px]">{product.color}</span>
          )}
          {product.size && (
            <span className="badge-neutral text-[10px]">Size: {product.size}</span>
          )}
          {product.model_tag && (
            <span className="badge text-[10px]">{product.model_tag}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            href={`/products/${product.id}`}
            className="btn-primary flex-1 text-xs !py-2"
          >
            View Details
          </Link>
          {onCompare && (
            <button
              onClick={() => onCompare(product.id)}
              className={`p-2 rounded-lg border transition-all duration-200 ${
                compareSelected
                  ? "border-accent bg-accent-10 text-accent"
                  : "border-surface-400/40 text-gray-400 hover:border-accent/40 hover:text-accent"
              }`}
              title={compareSelected ? "Remove from comparison" : "Add to comparison"}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
