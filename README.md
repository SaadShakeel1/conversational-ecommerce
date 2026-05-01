# Conversational E-commerce

RAG-powered e-commerce with natural language search. **Aligned with project proposal** (`proposal (1).pdf`): Layered RAG architecture (Frontend / Logic / AI / Data), Next.js + FastAPI + PostgreSQL + Pinecone or ChromaDB, 20 core domain features. See `docs/architecture.md` and `docs/features.md`.

## Structure

- **backend/** — FastAPI app (API, RAG pipeline, services, DB models)
- **frontend/** — Next.js + Tailwind (chat UI, product/cart pages)
- **infra/** — Docker Compose, Postgres init, Dockerfiles
- **docs/** — Architecture, API contracts, features
- **scripts/** — Seed DB, build embeddings (under `backend/scripts/`)

## Run locally (Comprehensive Guide)

### 1. Environment Setup

Copy `.env.example` to `.env` in the root folder, and `.env.example` to `backend/.env`. Configure the required values:

```bash
cp .env.example .env
cp .env.example backend/.env
# Edit .env: DATABASE_URL, GROQ_API_KEY or LLM_API_KEY
```

> **Note:**
> - `GROQ_API_KEY` (or `LLM_API_KEY`) is **required** to enable AI-generated chat responses and the RAG system.
> - By default, the system uses a local `ChromaDB` for the vector store. Make sure you install `chromadb` (`pip install chromadb`).

### 2. Start the PostgreSQL Database

Using Docker (from the repo root):

```powershell
cd infra
docker compose up -d postgres
cd ..
```

### 3. Setup and Run the Backend

Open a terminal at the project root and run:

```powershell
cd backend

# Create and activate virtual environment (Windows example)
python -m venv venv
.\venv\Scripts\activate

# Install dependencies (including chromadb for local embeddings)
pip install -r requirements.txt
pip install chromadb

# Run database migrations
python -m alembic upgrade head

# Seed the database with products, FAQs, tags, and reviews
python -m scripts.seed_products

# Build the vector database embeddings (Required for AI search)
python -m scripts.build_embeddings

# Start the FastAPI server
python -m uvicorn app.main:app --reload --port 8000
```

The Backend API will be available at: http://localhost:8000  
API Documentation (Swagger UI): http://localhost:8000/docs

### 4. Setup and Run the Frontend

Open a **new terminal window** at the project root:

```powershell
cd frontend
npm install
npm run dev
```

The Next.js App will be available at: http://localhost:3000

---

## Technical Highlights

- **Multi-Theme UI:** A fully dynamic design system built with Tailwind CSS and CSS Custom Properties. Users can switch between "Neon Green", "Purple Neon", "Blue Tech", and "Orange Energy" instantly without page reloads.
- **RAG AI Chat:** Users can chat with an AI assistant that intelligently retrieves product information from the Postgres/ChromaDB vector store.
- **Product Reviews:** Full review system integrated into the backend and displayed on product detail pages.
- **Database Architecture:** Layered PostgreSQL database managed by Alembic, including models for Products, Inventory, Orders, Cart, Users, Reviews, and FAQs.

## Infra only (Postgres + Backend in Docker)

From repo root (with `.env` present):

```bash
cd infra
docker compose up -d postgres backend
```

Backend will be at http://localhost:8000. Run frontend locally with `npm run dev` in `frontend/`.
