/** Shared TS types mirroring backend schemas */

export interface ProductOut {
  id: number;
  name: string;
  description?: string;
  price: number;
  color?: string;
  size?: string;
  category?: string;
  specs?: Record<string, unknown>;
  model_tag?: string;
}

export interface CartItemOut {
  product_id: number;
  quantity: number;
  price: number;
}

export interface CartSummaryOut {
  items: CartItemOut[];
  text_summary: string;
}

export interface OrderTrackOut {
  order_id: number;
  order_status: string;
  created_at?: string;
  total?: number;
}

export interface PromoValidateOut {
  valid: boolean;
  discount_percent?: number;
  message: string;
}

export interface FAQOut {
  id: number;
  question?: string;
  answer?: string;
}

export interface ChatRequest {
  message: string;
  session_id?: string;
}

export interface ChatResponse {
  reply: string;
  product_ids: number[];
  follow_up_prompts: string[];
}
