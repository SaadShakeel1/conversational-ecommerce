"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { CartSummaryOut } from "@/lib/types";

export function useCart() {
  const [cart, setCart] = useState<CartSummaryOut | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    setPending(true);
    setError(null);
    try {
      const data = await api.cart.summary();
      setCart(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load cart";
      setError(msg);
    } finally {
      setPending(false);
    }
  }, []);

  const addItem = useCallback(
    async (productId: number, quantity = 1) => {
      setPending(true);
      setError(null);
      try {
        await api.cart.addItem(productId, quantity);
        await fetchCart();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to add item";
        setError(msg);
      } finally {
        setPending(false);
      }
    },
    [fetchCart]
  );

  const removeItem = useCallback(
    async (productId: number) => {
      setPending(true);
      setError(null);
      try {
        await api.cart.removeItem(productId);
        await fetchCart();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to remove item";
        setError(msg);
      } finally {
        setPending(false);
      }
    },
    [fetchCart]
  );

  return { cart, pending, error, fetchCart, addItem, removeItem };
}
