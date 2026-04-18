"use client";

import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import type { OrderTrackOut } from "@/lib/types";

export default function OrderTrackPage() {
  const [orderId, setOrderId] = useState("");
  const [result, setResult] = useState<OrderTrackOut | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const id = Number(orderId);
    if (!id) return;
    setPending(true);
    setError(null);
    setHasSearched(true);
    try {
      const data = await api.orders.track(id);
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Tracking failed");
      setResult(null);
    } finally {
      setPending(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "text-neon-green bg-neon-green/10 border-neon-green/20";
      case "shipped":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "processing":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "cancelled":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  return (
    <div className="section-container py-8 sm:py-12">
      <div className="page-header !py-6">
        <h1 className="page-title">Track Your Order</h1>
        <p className="page-subtitle">Enter your order ID to check the status</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-10">
        <div className="flex gap-3">
          <input
            id="order-id-input"
            type="number"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter Order ID (e.g. 123)"
            className="input-field flex-1"
            min={1}
          />
          <button
            type="submit"
            disabled={pending || !orderId}
            className="btn-primary"
          >
            {pending ? (
              <div className="w-5 h-5 border-2 border-surface-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              "Track"
            )}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="max-w-md mx-auto glass-card border-red-500/30 p-4 text-red-400 text-sm text-center mb-6 animate-fade-in">
          ⚠️ {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="max-w-md mx-auto glass-card p-6 animate-fade-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Order</p>
              <p className="text-2xl font-display font-bold text-white">
                #{result.order_id}
              </p>
            </div>
            <span
              className={`px-4 py-1.5 rounded-full text-sm font-medium border ${statusColor(
                result.order_status
              )}`}
            >
              {result.order_status}
            </span>
          </div>

          <div className="divider mb-4" />

          <div className="space-y-3">
            {result.created_at && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Placed</span>
                <span className="text-sm text-white">
                  {new Date(result.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}
            {result.total != null && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Total</span>
                <span className="text-lg font-bold text-neon-green">
                  ${result.total.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Not Found */}
      {!pending && hasSearched && !result && !error && (
        <div className="max-w-md mx-auto glass-card p-12 text-center animate-fade-in">
          <span className="text-5xl mb-4 block">📭</span>
          <h3 className="text-xl font-display font-semibold text-white mb-2">
            Order not found
          </h3>
          <p className="text-gray-500 text-sm">
            Please check the order ID and try again.
          </p>
        </div>
      )}
    </div>
  );
}
