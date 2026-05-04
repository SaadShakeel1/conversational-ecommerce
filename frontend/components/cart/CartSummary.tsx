"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { CartItemOut, CartSummaryOut, PromoValidateOut } from "@/lib/types";

export default function CartSummary() {
  const router = useRouter();
  const [cart, setCart] = useState<CartSummaryOut | null>(null);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);

  // Promo code state
  const [promoInput, setPromoInput] = useState("");
  const [promoResult, setPromoResult] = useState<PromoValidateOut | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    setPending(true);
    setError(null);
    try {
      const data = await api.cart.summary();
      setCart(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load cart");
    } finally {
      setPending(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleRemove = async (productId: number) => {
    setRemovingId(productId);
    try {
      await api.cart.removeItem(productId);
      await fetchCart();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to remove item");
    } finally {
      setRemovingId(null);
    }
  };

  const handleApplyPromo = async () => {
    const code = promoInput.trim();
    if (!code) return;
    setPromoLoading(true);
    setPromoResult(null);
    try {
      const result = await api.orders.validatePromo(code);
      setPromoResult(result);
      if (result.valid) {
        setAppliedPromo(code);
      } else {
        setAppliedPromo(null);
      }
    } catch (e: unknown) {
      setPromoResult({
        valid: false,
        message: e instanceof Error ? e.message : "Failed to validate code",
      });
      setAppliedPromo(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoInput("");
    setPromoResult(null);
    setAppliedPromo(null);
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    setError(null);
    try {
      const order = await api.orders.checkout(
        appliedPromo ? { promoCode: appliedPromo } : undefined
      );
      router.push(`/orders/track?orderId=${order.order_id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setCheckingOut(false);
    }
  };

  if (pending && !cart) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    const isAuthError =
      error.toLowerCase().includes("auth") ||
      error.toLowerCase().includes("log in") ||
      error.toLowerCase().includes("login") ||
      error.toLowerCase().includes("find");

    return (
      <div className="glass-card border-red-500/30 p-6 text-center">
        <span className="text-3xl mb-3 block">⚠️</span>
        <p className="text-red-400 text-sm">
          {isAuthError ? "Please sign in to view your cart." : error}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
          <button onClick={fetchCart} className="btn-secondary text-xs w-full sm:w-auto">
            Try Again
          </button>
          {isAuthError && (
            <a href="/auth/login" className="btn-primary text-xs w-full sm:w-auto">
              Sign In
            </a>
          )}
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="glass-card p-12 text-center animate-fade-in">
        <span className="text-5xl mb-4 block">🛒</span>
        <h3 className="text-xl font-display font-semibold text-white mb-2">
          Your cart is empty
        </h3>
        <p className="text-gray-500 text-sm mb-6">
          Start chatting with our AI or browse products to add items.
        </p>
        <div className="flex items-center justify-center gap-3">
          <a href="/chat" className="btn-primary text-sm">
            💬 Chat with AI
          </a>
          <a href="/products" className="btn-secondary text-sm">
            Browse Products
          </a>
        </div>
      </div>
    );
  }

  const total = cart.items.reduce(
    (sum: number, item: CartItemOut) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="animate-fade-in">
      {/* Items List */}
      <div className="space-y-3 mb-6">
        {cart.items.map((item: CartItemOut) => (
          <div
            key={item.product_id}
            className="glass-card flex items-center justify-between p-4 group hover:border-accent/20 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-700 flex items-center justify-center text-xl">
                🛍️
              </div>
              <div>
                <p className="text-white font-medium text-sm">
                  {item.name || `Product #${item.product_id}`}
                </p>
                <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-accent font-semibold text-sm">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
              <button
                onClick={() => handleRemove(item.product_id)}
                disabled={removingId === item.product_id}
                className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all
                  disabled:opacity-40"
                title="Remove item"
              >
                {removingId === item.product_id ? (
                  <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Promo Code Section */}
      <div className="glass-card p-5 mb-4">
        <label htmlFor="promo-code" className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-2 block">
          Promo Code
        </label>
        {appliedPromo ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-mono font-medium">
                🏷️ {appliedPromo.toUpperCase()}
              </span>
              <span className="text-green-400 text-xs">
                {promoResult?.discount_percent}% off
              </span>
            </div>
            <button
              onClick={handleRemovePromo}
              className="text-xs text-gray-500 hover:text-red-400 transition-colors"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              id="promo-code"
              type="text"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
              placeholder="Enter code (e.g. WELCOME10)"
              className="flex-1 px-3 py-2 rounded-lg bg-surface-800 border border-surface-600 text-white text-sm
                placeholder:text-gray-600 focus:outline-none focus:border-accent/50 transition-colors"
            />
            <button
              onClick={handleApplyPromo}
              disabled={promoLoading || !promoInput.trim()}
              className="btn-secondary text-xs px-4 disabled:opacity-40"
            >
              {promoLoading ? "..." : "Apply"}
            </button>
          </div>
        )}
        {promoResult && !promoResult.valid && (
          <p className="text-red-400 text-xs mt-2">{promoResult.message}</p>
        )}
        {promoResult && promoResult.valid && !appliedPromo && (
          <p className="text-green-400 text-xs mt-2">{promoResult.message}</p>
        )}
      </div>

      {/* Summary Card */}
      <div className="glass-card p-6 neon-border">
        {cart.text_summary && (
          <p className="text-gray-400 text-sm mb-4 italic">
            &ldquo;{cart.text_summary}&rdquo;
          </p>
        )}
        <div className="divider mb-4" />

        {/* Subtotal */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-gray-500 text-sm">Subtotal</span>
          <span className="text-gray-300 text-sm">${total.toFixed(2)}</span>
        </div>

        {/* Discount row (only when promo is applied) */}
        {promoResult?.valid && promoResult.discount_percent && (
          <div className="flex items-center justify-between mb-1">
            <span className="text-green-400 text-sm">
              Discount ({promoResult.discount_percent}%)
            </span>
            <span className="text-green-400 text-sm">
              -${((total * promoResult.discount_percent) / 100).toFixed(2)}
            </span>
          </div>
        )}

        <div className="divider my-3" />

        {/* Final Total */}
        <div className="flex items-center justify-between">
          <span className="text-gray-300 font-medium">Total</span>
          <div className="text-right">
            {promoResult?.valid && promoResult.discount_percent ? (
              <>
                <span className="text-gray-500 line-through text-sm mr-2">
                  ${total.toFixed(2)}
                </span>
                <span className="text-2xl font-bold text-accent">
                  ${(total * (1 - promoResult.discount_percent / 100)).toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-accent">
                ${total.toFixed(2)}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleCheckout}
          disabled={checkingOut}
          className="btn-primary w-full mt-4 disabled:opacity-60"
        >
          {checkingOut ? "Processing order..." : "Proceed to Checkout"}
        </button>
      </div>
    </div>
  );
}
