# Architecture

This follows the **Layered RAG Approach** from the project proposal (Section 2.9).

## Four layers (proposal-aligned)

1. **Frontend** — React-based chat interface. We use Next.js (React) + Tailwind CSS for the chat UI, product/cart pages, and mobile-responsive layout (proposal §2.9, §2.13).
2. **Logic layer** — FastAPI handling conversational state, REST API, and routing to the AI layer (§2.9).
3. **AI layer** — RAG pipeline connecting the LLM to a Vector Store containing product embeddings; retrieval then generation so responses are grounded in the catalog (§2.9, §2.3.1 LangChain/Pinecone or ChromaDB).
4. **Data layer** — PostgreSQL for transactions (products, orders, carts, FAQs, reviews, tags); Pinecone or ChromaDB for semantic search (§2.9).

## What this architecture is called

- **Layered RAG architecture** — The four layers above; RAG (Retrieval-Augmented Generation) in the AI layer.
- **Monorepo** — Frontend, backend, infra, and docs in one repository.

## Proposal goals (Section 2.4) — alignment

| Goal | How we meet it |
|------|----------------|
| Multi-turn RAG agent grounded in product database | `conversational_agent`, `rag_pipeline`, `routes_chat`; context from vector store + PostgreSQL. |
| Sub-second retrieval from vector space | Vector store interface (Pinecone/Chroma); embeddings + indexed search. |
| Zero hallucinations; responses verified by catalog | `rag_pipeline.build_grounded_prompt`; LLM only sees retrieved catalog/FAQ context. |
| High mobile responsiveness | Next.js + Tailwind; responsive chat and product/cart UI. |

## Is it sound?

Yes. Clear separation of concerns, pluggable LLM and vector store, and a single place for conversation + RAG in the backend. Matches the proposal’s tech stack and 20 core domain features (see `docs/features.md`).

---

## Flow

User → Next.js (React) → FastAPI → Conversation/RAG → Vector DB + PostgreSQL → LLM → Response + product_ids + follow-up prompts.

See `docs/api-contracts.md` and `docs/features.md` for endpoints and feature-to-module mapping.
