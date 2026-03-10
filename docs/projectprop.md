## Project proposal summary

- **Project**: Conversational e‑commerce assistant with Layered RAG architecture.
- **Monorepo**: `frontend/` (Next.js + Tailwind), `backend/` (FastAPI + LangChain), `docs/`, `infra/` (minimal now, no Docker for DB), shared `.env`.
- **Core idea**: A chat‑based shopping assistant that can search, compare, and recommend products, manage cart and orders, and answer FAQs using a combination of PostgreSQL + vector search (Pinecone) + LLM.

## Architecture (high level)

- **Frontend (Next.js + Tailwind)**:
  - Chat UI (multi‑turn, mobile responsive).
  - Product listing/detail pages and comparison grid.
  - Cart and order‑tracking views.
  - Calls backend via REST (`/api/...` in `docs/api-contracts.md`).

- **Backend (FastAPI)**:
  - REST API routes for chat, products, cart, orders, FAQ.
  - Conversational agent and RAG pipeline (LangChain‑based).
  - Services for search, comparison, cart, promo codes, FAQs, etc.

- **AI / RAG layer**:
  - Embeddings + vector store (Pinecone or Chroma).
  - Retrieval of products, FAQs, reviews for each user query.
  - Prompt builder that grounds LLM responses only on retrieved context.

- **Data layer**:
  - **PostgreSQL (Neon)** for transactional data (products, users, orders, cart, reviews, FAQs, tags, inventory).
  - **Vector DB (Pinecone)** for semantic search over products/FAQs/reviews.

## API surface (backend)

See `docs/api-contracts.md` for detailed shapes. High‑level endpoints:

- **Chat**
  - `POST /api/chat` — multi‑turn conversation.

- **Products**
  - `GET /api/products/search`
  - `GET /api/products/compare?ids=1,2,3`
  - `GET /api/products/{product_id}`

- **Cart**
  - `GET /api/cart/summary`
  - `POST /api/cart/items` (add item)
  - `DELETE /api/cart/items/{product_id}` (remove item)

- **Orders**
  - `GET /api/orders/track?orderId=123`
  - `GET /api/orders/promo/validate?code=XYZ`

- **FAQ**
  - `GET /api/faq/search?q=...`

## Core domain features (from proposal)

Mapped in detail in `docs/features.md`; summary list:

1. Natural language attribute filtering and multi‑constraint search.
2. Dynamic product comparison grid.
3. Price range recognition and handling.
4. Tag‑based discovery and weighted sorting.
5. Conversational size/variant selection.
6. Real‑time stock checks using inventory.
7. Related‑item cross‑sell and bundles.
8. JSONB product specs and feature extraction.
9. Text‑based FAQ retrieval and guided follow‑up prompts.
10. Cart feature summary and command‑based cart management.
11. Promo code validation and discount logic.
12. Compatibility logic and popularity/review‑based filtering.
13. Review search and order‑tracking queries.

## Data model (target)

- **Core tables**:
  - `Product` (with JSONB `specs`, `model_tag`, price, category, etc.).
  - `Inventory`.
  - `Tag` and `product_tag` (many‑to‑many).
  - `User`.
  - `Review`.
  - `Cart` and `CartItem`.
  - `Order` and `OrderItem`.
  - `FAQ`.

- **ORM**:
  - SQLAlchemy 2.x with `Base` in `app/db/base.py`.
  - Alembic migrations to keep Neon schema in sync.

## Configuration and infrastructure

- **Backend config**:
  - `app/config.py` uses Pydantic `Settings`.
  - `database_url` defaults to the Neon Postgres URL, overridable via `DATABASE_URL` in `.env`.
  - API keys: `VECTOR_DB_API_KEY` (Pinecone) and `LLM_API_KEY` (OpenAI or compatible).

- **Vector store**:
  - Pinecone recommended; embeddings via LangChain/OpenAI.
  - Index stores product and FAQ/review embeddings, keyed by IDs linking back to Postgres.

- **Environment / runtime**:
  - Python virtualenv: `.venv` in repo root.
  - Backend deps: `backend/requirements.txt` (FastAPI, SQLAlchemy, Alembic, LangChain, LangChain‑OpenAI, psycopg2‑binary, etc.).
  - No local Postgres Docker; DB is Neon. Frontend runs with `npm run dev` pointing to `http://localhost:8000`.

## Implementation plan (step‑by‑step)

1. **Database & ORM**
   - Finalize SQLAlchemy models for all core tables.
   - Generate and apply Alembic migrations against Neon.
   - Seed minimal product/FAQ/test data for development.

2. **Vector pipeline**
   - Implement embeddings client and Pinecone client.
   - Build indexing scripts: push product/FAQ/review embeddings into Pinecone.
   - Implement retrieval functions used by RAG pipeline.

3. **RAG and conversational agent**
   - Implement `rag_pipeline` (retrieve → build prompt → call LLM → parse).
   - Implement `conversational_agent` to orchestrate multi‑turn context and intents (search, compare, cart, FAQ, order tracking).

4. **Backend API**
   - Implement `routes_chat`, `routes_products`, `routes_cart`, `routes_orders`, `routes_faq`.
   - Add Pydantic schemas that match `docs/api-contracts.md`.
   - Add services (`search_service`, `comparison_service`, `cart_service`, `faq_service`, `promo_service`, etc.).

5. **Frontend**
   - Build chat UI and wiring to `/api/chat`.
   - Build product list/detail, comparison grid, cart pages, and order tracking view.
   - Ensure responsive layout and good UX (mobile first).

6. **Quality, verification, and DX**
   - Implement logging and basic error handling in backend.
   - Add minimal test coverage for core flows (search, chat, cart, orders).
   - Use `docs/verification.md` checklist before final delivery.

This file is the working overview of the proposal and plan so we can quickly align while implementing without re‑reading all detailed docs.

