"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { ProductOut } from "@/lib/types";

export function useProducts() {
  const [results, setResults] = useState<ProductOut[]>([]);
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (q: string, limit = 20, offset = 0) => {
      setError(null);
      setPending(true);
      setQuery(q);
      try {
        const data = await api.products.search({ q, limit, offset });
        setResults(data);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Search failed";
        setError(msg);
      } finally {
        setPending(false);
      }
    },
    []
  );

  const getProduct = useCallback(async (id: number) => {
    setPending(true);
    setError(null);
    try {
      const data = await api.products.get(id);
      return data;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load product";
      setError(msg);
      return null;
    } finally {
      setPending(false);
    }
  }, []);

  return { results, query, pending, error, search, getProduct };
}
