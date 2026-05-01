"use client";

import type { ProductOut } from "@/lib/types";

interface ComparisonGridProps {
  products: ProductOut[];
  onRemove?: (id: number) => void;
}

export default function ComparisonGrid({ products, onRemove }: ComparisonGridProps) {
  if (products.length === 0) {
    return (
      <div className="glass-card p-12 text-center animate-fade-in">
        <span className="text-4xl mb-4 block">📊</span>
        <h3 className="text-lg font-semibold text-white mb-2">No products to compare</h3>
        <p className="text-gray-500 text-sm">
          Search for products and click the compare icon to add them here.
        </p>
      </div>
    );
  }

  const allSpecs = new Set<string>();
  products.forEach((p) => {
    if (p.specs) Object.keys(p.specs).forEach((k) => allSpecs.add(k));
  });

  const rows = [
    { label: "Price", getValue: (p: ProductOut) => `$${p.price.toFixed(2)}` },
    { label: "Category", getValue: (p: ProductOut) => p.category ?? "—" },
    { label: "Color", getValue: (p: ProductOut) => p.color ?? "—" },
    { label: "Size", getValue: (p: ProductOut) => p.size ?? "—" },
    { label: "Model", getValue: (p: ProductOut) => p.model_tag ?? "—" },
    ...Array.from(allSpecs).map((spec) => ({
      label: spec.charAt(0).toUpperCase() + spec.slice(1).replace(/_/g, " "),
      getValue: (p: ProductOut) =>
        p.specs?.[spec] != null ? String(p.specs[spec]) : "—",
    })),
  ];

  return (
    <div className="overflow-x-auto animate-fade-in">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wider border-b border-surface-500/30">
              Feature
            </th>
            {products.map((p) => (
              <th
                key={p.id}
                className="text-left py-3 px-4 border-b border-surface-500/30"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-white font-semibold text-sm truncate">
                    {p.name}
                  </span>
                  {onRemove && (
                    <button
                      onClick={() => onRemove(p.id)}
                      className="text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
                      title="Remove from comparison"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.label}
              className={`${
                i % 2 === 0 ? "bg-surface-800/30" : ""
              } hover:bg-accent/5 transition-colors`}
            >
              <td className="py-3 px-4 text-gray-400 font-medium text-xs uppercase tracking-wider">
                {row.label}
              </td>
              {products.map((p) => {
                const val = row.getValue(p);
                const isPrice = row.label === "Price";
                return (
                  <td
                    key={p.id}
                    className={`py-3 px-4 ${
                      isPrice ? "text-accent font-semibold" : "text-gray-300"
                    }`}
                  >
                    {val}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
