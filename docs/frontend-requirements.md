# Frontend Requirements Specification

This document defines the frontend implementation scope and requirements for the conversational ecommerce project using only currently available backend contracts and existing project docs.

## 1) Tech Stack and Runtime

- Framework: Next.js 14 (React 18).
- Styling: Tailwind CSS.
- Language: TypeScript.
- API base URL source: `NEXT_PUBLIC_API_URL` from environment.
- Local backend base URL default: `http://localhost:8000`.

## 2) Core Frontend Goals

- Provide a mobile-responsive ecommerce chat experience.
- Support product discovery/search/compare flows.
- Support cart summary and cart item actions.
- Support FAQ retrieval UI.
- Support order tracking and promo validation UI.
- Support authentication flows (register/login/me) with JWT.

## 3) Required Pages and Routes

The following frontend routes must exist:

1. `/`  
   Landing page with entry points to chat and product search.

2. `/chat`  
   Multi-turn chat interface integrated with `POST /api/chat`.

3. `/products`  
   Search/list page integrated with `GET /api/products/search`.

4. `/products/[id]`  
   Product detail page integrated with `GET /api/products/{product_id}`.

5. `/compare`  
   Comparison page integrated with `GET /api/products/compare?ids=...`.

6. `/cart`  
   Cart summary page integrated with:
   - `GET /api/cart/summary`
   - `POST /api/cart/items`
   - `DELETE /api/cart/items/{product_id}`

7. `/orders/track`  
   Order tracking page integrated with `GET /api/orders/track?orderId=...`.

8. `/promo`  
   Promo validation page integrated with `GET /api/orders/promo/validate?code=...`.

9. `/faq`  
   FAQ search page integrated with `GET /api/faq/search?q=...`.

10. `/auth/register`  
    Registration page integrated with `POST /api/auth/register`.

11. `/auth/login`  
    Login page integrated with `POST /api/auth/login`.

12. `/account`  
    Profile/session page integrated with `GET /api/auth/me`.

## 4) API Integration Requirements

All API calls must use a single typed API client layer.

### 4.1 Chat

- Endpoint: `POST /api/chat`
- Request: `{ message: string, session_id?: string }`
- Response:
  - `reply: string`
  - `product_ids: number[]`
  - `follow_up_prompts: string[]`
- UI requirements:
  - Message input and submit.
  - Render assistant text.
  - Render clickable follow-up prompts.
  - Render product links for returned `product_ids`.

### 4.2 Products

- Search endpoint: `GET /api/products/search?q=&limit=&offset=`
- Compare endpoint: `GET /api/products/compare?ids=1,2,3`
- Detail endpoint: `GET /api/products/{product_id}`
- `ProductOut` fields required in UI:
  - `id`, `name`, `description`, `price`, `color`, `size`, `category`, `specs`, `model_tag`

### 4.3 Cart

- Summary endpoint: `GET /api/cart/summary`
- Add endpoint: `POST /api/cart/items?product_id=&quantity=`
- Remove endpoint: `DELETE /api/cart/items/{product_id}`
- UI requirements:
  - Render line items.
  - Render backend-provided `text_summary`.
  - Support add/remove with loading and error states.

### 4.4 Orders

- Track endpoint: `GET /api/orders/track?orderId=123`
- Promo endpoint: `GET /api/orders/promo/validate?code=XYZ`
- UI requirements:
  - Track form (order id input).
  - Promo validation form (code input).
  - Render empty/not found states.

### 4.5 FAQ

- Endpoint: `GET /api/faq/search?q=...`
- UI requirements:
  - Query input with submit.
  - List question/answer results.

### 4.6 Auth

- Register endpoint: `POST /api/auth/register`
- Login endpoint: `POST /api/auth/login`
  - Uses OAuth2 password form format (`username`, `password`).
- Me endpoint: `GET /api/auth/me` with `Authorization: Bearer <token>`.
- UI requirements:
  - Register form: email + password.
  - Login form: email + password.
  - Persist JWT access token.
  - Fetch current user on app load when token exists.
  - Logout action clears stored token and user state.

## 5) State Management Requirements

- Auth state:
  - `token`, `currentUser`, `isAuthenticated`, `loading`, `error`.
- Chat state:
  - `messages`, `session_id`, `pending`, `error`.
- Product state:
  - `query`, `results`, `pagination`, `pending`, `error`.
- Cart state:
  - `items`, `text_summary`, `pending`, `error`.
- Recommendation:
  - Use React Context + hooks (minimum).
  - If state grows, move to Zustand.

## 6) UX and UI Requirements

- Mobile-first layout with Tailwind breakpoints.
- Consistent loading indicators on all API actions.
- Consistent error surfaces:
  - Inline error messages for forms.
  - Fallback error banner for page-level failures.
- Empty states for:
  - No search results.
  - Empty cart.
  - No FAQ matches.
  - Order not found.
- Basic accessibility:
  - Proper labels for form inputs.
  - Keyboard navigation on chat and auth forms.
  - Focus styles and sufficient contrast.

## 7) Frontend Project Structure Requirements

Suggested structure:

- `frontend/app/`
  - `chat/`, `products/`, `products/[id]/`, `compare/`, `cart/`, `faq/`, `orders/track/`, `promo/`, `auth/login/`, `auth/register/`, `account/`
- `frontend/components/`
  - `chat/`, `products/`, `cart/`, `auth/`, `common/`
- `frontend/lib/`
  - `api.ts` (request helper)
  - `auth.ts` (token helpers)
  - `types.ts` (shared frontend types mapped from backend schemas)
- `frontend/hooks/`
  - `useAuth`, `useChat`, `useProducts`, `useCart`

## 8) Security Requirements (Frontend)

- Do not hardcode API keys or secrets in frontend code.
- Only use `NEXT_PUBLIC_` variables for browser-required values.
- Send JWT via `Authorization` header for protected endpoints.
- Clear token and user data on logout.
- Never commit real `.env` values.

## 9) Testing and Verification Requirements

Minimum frontend verification before merge:

1. Register user from UI -> success response shown.
2. Login user from UI -> token stored and user marked authenticated.
3. `/account` loads `/api/auth/me` successfully with bearer token.
4. Chat request returns and renders `reply` and `follow_up_prompts`.
5. Product search and detail pages render backend data.
6. Cart add/remove updates cart summary.
7. Order tracking handles both found and not-found responses.
8. Promo validation renders both valid/invalid states.
9. FAQ search returns and renders answers.

## 10) Known Blockers / Required Clarifications (No Assumptions)

These must be confirmed or fixed before frontend auth integration:

1. **Auth model field mismatch**
   - Current `routes_auth.py` uses `user.password_hash` and creates `User(..., password_hash=...)`.
   - Current `User` model uses `hashed_password`.
   - Required: backend must expose one consistent field name.

2. **Protected endpoint scope**
   - Confirm exactly which endpoints require auth now:
     - Candidate: cart + orders + account.
   - Current API docs do not explicitly mark auth-required routes.

3. **Token persistence policy**
   - Confirm storage mechanism:
     - `localStorage` (faster to implement), or
     - httpOnly cookie flow (more secure, requires backend cookie strategy).

4. **Session handling in chat**
   - Confirm whether frontend should generate and persist `session_id` locally.

5. **Route naming approval**
   - Confirm final frontend route names listed in Section 3.

---

If you approve this spec, implementation can proceed without hidden assumptions.

