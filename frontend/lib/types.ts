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
  name?: string;
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

/** Auth types */
export interface AuthUser {
  id: number;
  email: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

/** Chat message for the UI */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  product_ids?: number[];
  follow_up_prompts?: string[];
  timestamp: Date;
}
