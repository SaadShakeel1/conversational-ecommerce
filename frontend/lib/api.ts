/** Typed API client for FastAPI backend */
import type {
  ChatRequest,
  ChatResponse,
  ProductOut,
  CartSummaryOut,
  OrderTrackOut,
  PromoValidateOut,
  FAQOut,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  chat: {
    post: (body: ChatRequest) =>
      fetchApi<ChatResponse>("/api/chat", { method: "POST", body: JSON.stringify(body) }),
  },
  products: {
    search: (params: { q?: string; limit?: number; offset?: number }) => {
      const sp = new URLSearchParams();
      if (params.q) sp.set("q", params.q);
      if (params.limit != null) sp.set("limit", String(params.limit));
      if (params.offset != null) sp.set("offset", String(params.offset));
      return fetchApi<ProductOut[]>(`/api/products/search?${sp}`);
    },
    get: (id: number) => fetchApi<ProductOut | null>(`/api/products/${id}`),
    compare: (ids: number[]) =>
      fetchApi<{ products: ProductOut[] }>(`/api/products/compare?ids=${ids.join(",")}`),
  },
  cart: {
    summary: () => fetchApi<CartSummaryOut>("/api/cart/summary"),
    addItem: (product_id: number, quantity = 1) =>
      fetchApi<{ ok: boolean }>(`/api/cart/items?product_id=${product_id}&quantity=${quantity}`, {
        method: "POST",
      }),
    removeItem: (product_id: number) =>
      fetchApi<{ ok: boolean }>(`/api/cart/items/${product_id}`, { method: "DELETE" }),
  },
  orders: {
    track: (orderId: number) => fetchApi<OrderTrackOut | null>(`/api/orders/track?orderId=${orderId}`),
    validatePromo: (code: string) =>
      fetchApi<PromoValidateOut>(`/api/orders/promo/validate?code=${encodeURIComponent(code)}`),
  },
  faq: {
    search: (q: string) => fetchApi<FAQOut[]>(`/api/faq/search?q=${encodeURIComponent(q)}`),
  },
};
