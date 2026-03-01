# Conversational E-commerce

RAG-powered e-commerce with natural language search. **Aligned with project proposal** (`proposal (1).pdf`): Layered RAG architecture (Frontend / Logic / AI / Data), Next.js + FastAPI + PostgreSQL + Pinecone or ChromaDB, 20 core domain features. See `docs/architecture.md` and `docs/features.md`.

## Structure

- **backend/** — FastAPI app (API, RAG pipeline, services, DB models)
- **frontend/** — Next.js + Tailwind (chat UI, product/cart pages)
- **infra/** — Docker Compose, Postgres init, Dockerfiles
- **docs/** — Architecture, API contracts, features
- **scripts/** — Seed DB, build embeddings (under `backend/scripts/`)

## Run locally

### 1. Environment

Copy env and set keys (optional for local stub behaviour):

```bash
cp .env.example .env
# Edit .env: DATABASE_URL, LLM_API_KEY, VECTOR_DB_API_KEY, NEXT_PUBLIC_API_URL
```

### 2. PostgreSQL

Using Docker (from repo root):

```bash
cd infra
docker compose up -d postgres
cd ..
```

Or use a local Postgres and set `DATABASE_URL` in `.env`.

### 3. Backend

```bash
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

API: http://localhost:8000  
Docs: http://localhost:8000/docs

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:3000

## Infra only (Postgres + Backend in Docker)

From repo root (with `.env` present):

```bash
cd infra
docker compose up -d postgres backend
```

Backend will be at http://localhost:8000. Run frontend locally with `npm run dev` in `frontend/`.
