"""
Build and upsert product + FAQ embeddings into Pinecone.

Run:
  cd backend
  python -m scripts.build_embeddings
"""

from __future__ import annotations

import json
from typing import List, Dict, Any, Tuple

from app.ai.embeddings_client import get_embeddings_client
from app.ai.vector_store import get_vector_store
from app.config import settings
from app.db.session import SessionLocal
from app.models.product import Product
from app.models.faq import FAQ


def _to_str(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False)
    return str(value)


def _product_to_text(p: Product) -> str:
    tags = ", ".join([t.name for t in (p.tags or [])]) if getattr(p, "tags", None) is not None else ""
    return " | ".join(
        [
            f"Product: {p.name}",
            f"Category: {p.category}" if p.category else "",
            f"Color: {p.color}" if p.color else "",
            f"Size: {p.size}" if p.size else "",
            f"Model tag: {p.model_tag}" if p.model_tag else "",
            f"Price: {p.price}",
            f"Description: {p.description or ''}",
            f"Specs: {_to_str(p.specs)}" if p.specs else "",
            f"Tags: {tags}" if tags else "",
        ]
    ).strip(" | ")


def _faq_to_text(f: FAQ) -> str:
    return f"FAQ: {f.question}\nAnswer: {f.answer}"


def _batch(iterable: List[Any], batch_size: int) -> List[List[Any]]:
    for i in range(0, len(iterable), batch_size):
        yield iterable[i : i + batch_size]


def build() -> None:
    # These will raise with clear messages if misconfigured.
    embeddings_client = get_embeddings_client()
    vector_store = get_vector_store()

    db = SessionLocal()
    try:
        print("[INFO] Fetching products...")
        products: List[Product] = db.query(Product).all()
        print(f"[INFO] Products fetched: {len(products)}")

        product_ids: List[str] = []
        product_embeddings: List[List[float]] = []
        product_metas: List[Dict[str, Any]] = []

        # Upsert products in batches
        batch_size = 50
        for i, p in enumerate(products, start=1):
            text = _product_to_text(p)
            vid = f"product:{p.id}"
            product_ids.append(vid)
            product_embeddings.append(embeddings_client.embed_query(text))
            product_metas.append(
                {
                    "type": "product",
                    "product_id": p.id,
                    "text": text,
                    "category": p.category,
                    "color": p.color,
                    "size": p.size,
                    "model_tag": p.model_tag,
                }
            )

            if len(product_ids) >= batch_size:
                print(f"[INFO] Upserting products batch at {i}/{len(products)}...")
                vector_store.add(product_ids, product_embeddings, metadatas=product_metas)
                product_ids, product_embeddings, product_metas = [], [], []

        if product_ids:
            print("[INFO] Upserting final products batch...")
            vector_store.add(product_ids, product_embeddings, metadatas=product_metas)

        # FAQs
        print("[INFO] Fetching FAQs...")
        faqs: List[FAQ] = db.query(FAQ).all()
        print(f"[INFO] FAQs fetched: {len(faqs)}")

        faq_ids: List[str] = []
        faq_embeddings: List[List[float]] = []
        faq_metas: List[Dict[str, Any]] = []

        for j, f in enumerate(faqs, start=1):
            text = _faq_to_text(f)
            vid = f"faq:{f.id}"
            faq_ids.append(vid)
            faq_embeddings.append(embeddings_client.embed_query(text))
            faq_metas.append({"type": "faq", "faq_id": f.id, "text": text})

            if len(faq_ids) >= batch_size:
                print(f"[INFO] Upserting FAQs batch at {j}/{len(faqs)}...")
                vector_store.add(faq_ids, faq_embeddings, metadatas=faq_metas)
                faq_ids, faq_embeddings, faq_metas = [], [], []

        if faq_ids:
            print("[INFO] Upserting final FAQs batch...")
            vector_store.add(faq_ids, faq_embeddings, metadatas=faq_metas)

        print("[SUCCESS] Embeddings upsert complete.")
    finally:
        db.close()


if __name__ == "__main__":
    build()
