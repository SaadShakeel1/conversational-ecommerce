"use client";

import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import type { PromoValidateOut } from "@/lib/types";

export default function PromoPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<PromoValidateOut | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setPending(true);
    setError(null);
    setResult(null);
    try {
      const data = await api.orders.validatePromo(code);
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Validation failed");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="section-container py-8 sm:py-12">
      <div className="page-header !py-6">
        <h1 className="page-title">Promo Code</h1>
        <p className="page-subtitle">
          Enter a promo code to check if it&#39;s valid
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-10">
        <div className="flex gap-3">
          <input
            id="promo-code-input"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter promo code (e.g. SAVE20)"
            className="input-field flex-1 font-mono uppercase tracking-widest"
          />
          <button
            type="submit"
            disabled={pending || !code.trim()}
            className="btn-primary"
          >
            {pending ? (
              <div className="w-5 h-5 border-2 border-surface-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              "Validate"
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="max-w-md mx-auto glass-card border-red-500/30 p-4 text-red-400 text-sm text-center animate-fade-in">
          ⚠️ {error}
        </div>
      )}

      {result && (
        <div
          className={`max-w-md mx-auto glass-card p-8 text-center animate-fade-up ${
            result.valid ? "neon-border" : "border-red-500/30"
          }`}
        >
          <span className="text-5xl mb-4 block">
            {result.valid ? "🎉" : "😞"}
          </span>
          <h3
            className={`text-2xl font-display font-bold mb-2 ${
              result.valid ? "text-accent" : "text-red-400"
            }`}
          >
            {result.valid ? "Code Valid!" : "Invalid Code"}
          </h3>
          {result.discount_percent != null && result.valid && (
            <p className="text-4xl font-bold text-white mb-2">
              {result.discount_percent}% OFF
            </p>
          )}
          <p className="text-gray-400 text-sm">{result.message}</p>
          {result.valid && (
            <a href="/cart" className="btn-primary mt-6 inline-block">
              Apply to Cart →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
