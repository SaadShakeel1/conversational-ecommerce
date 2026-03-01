# API contracts

Base URL (local): `http://localhost:8000`

## Chat
- **POST /api/chat** — Multi-turn conversation.
  - Body: `{ "message": string, "session_id"?: string }`
  - Response: `{ "reply": string, "product_ids": number[], "follow_up_prompts": string[] }`

## Products
- **GET /api/products/search** — Search products (query params: `q`, `limit`, `offset`). Returns list of `ProductOut`.
- **GET /api/products/compare?ids=1,2,3** — Compare products by id. Returns `{ "products": ProductOut[] }`.
- **GET /api/products/{product_id}** — Product detail. Returns `ProductOut` or 404.

## Cart
- **GET /api/cart/summary** — Cart feature summary. Returns `{ "items": CartItemOut[], "text_summary": string }`.
- **POST /api/cart/items** — Add item (query: `product_id`, `quantity`).
- **DELETE /api/cart/items/{product_id}** — Remove item.

## Orders
- **GET /api/orders/track?orderId=123** — Order status. Returns `OrderTrackOut` or 404.
- **GET /api/orders/promo/validate?code=XYZ** — Validate promo code. Returns `PromoValidateOut`.

## FAQ
- **GET /api/faq/search?q=...** — Text-based FAQ retrieval. Returns list of `FAQOut`.

## Shared types (backend Pydantic / frontend TS)
- **ProductOut**: id, name, description, price, color, size, category, specs, model_tag
- **CartItemOut**: product_id, quantity, price
- **OrderTrackOut**: order_id, order_status, created_at, total
- **PromoValidateOut**: valid, discount_percent?, message
- **FAQOut**: id, question, answer
- **ChatResponse**: reply, product_ids, follow_up_prompts
