"""Conversational agent orchestration (rules + guarded RAG)."""

from __future__ import annotations

import re
from decimal import Decimal
from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session

from app.config import settings
from app.schemas.chat import ChatRequest, ChatResponse
from app.services import (
    cart_service,
    faq_service,
    order_service,
    promo_service,
    search_service,
)
from app.models.inventory import Inventory


# NOTE: This is demo-only state. For correctness across restarts/workers, persist to DB/Redis.
_SESSION_CART_IDS: Dict[str, int] = {}


def get_guided_follow_ups(intent: str, context: Dict[str, Any]) -> List[str]:
    """Return suggested follow-up questions when search is too broad."""
    return [
        "Narrow by price range?",
        "Any specific color or size?",
    ]


def _extract_first_int(text: str) -> Optional[int]:
    match = re.search(r"\b(\d+)\b", text)
    return int(match.group(1)) if match else None


def _looks_like_order_tracking(message: str) -> bool:
    msg = message.lower()
    return ("order" in msg) and ("track" in msg or "tracking" in msg or "status" in msg)


def _looks_like_promo_validation(message: str) -> bool:
    msg = message.lower()
    return "promo" in msg or "coupon" in msg or "discount code" in msg or "code" in msg


def _extract_promo_code(message: str) -> Optional[str]:
    msg = message.strip()
    patterns = [
        r"promo\s*code\s*[:\-]?\s*([A-Za-z0-9]{3,})",
        r"coupon\s*code\s*[:\-]?\s*([A-Za-z0-9]{3,})",
        r"discount\s*code\s*[:\-]?\s*([A-Za-z0-9]{3,})",
        r"promo\s*[:\-]?\s*([A-Za-z0-9]{3,})",
        r"coupon\s*[:\-]?\s*([A-Za-z0-9]{3,})",
        r"code\s*[:\-]?\s*([A-Za-z0-9]{3,})",
    ]
    for pattern in patterns:
        match = re.search(pattern, msg, re.I)
        if match:
            return match.group(1).upper()
    generic_match = re.search(r"\b([A-Za-z0-9]{3,})\b", msg)
    return generic_match.group(1).upper() if generic_match else None


def _looks_like_faq_question(message: str) -> bool:
    msg = message.lower()
    return ("faq" in msg) or msg.strip().endswith("?") or any(k in msg for k in ["return", "shipping", "warranty", "payment"])


def _should_try_rag(message: str) -> bool:
    msg = message.lower()
    return (
        msg.strip().endswith("?")
        or any(
            k in msg
            for k in [
                "recommend",
                "recommendation",
                "looking for",
                "find ",
                "similar ",
                "help me choose",
                "what is",
                "how does",
                "compare options",
            ]
        )
    )


async def _try_rag_answer(message: str) -> Optional[tuple[str, List[int]]]:
    # Guard: embeddings + LLM both require LLM_API_KEY in our current implementation.
    if not settings.llm_api_key:
        return None
    if not settings.vector_db_api_key or not settings.pinecone_index_name or not settings.pinecone_host:
        return None

    try:
        from app.ai.rag_pipeline import retrieve_context, build_grounded_prompt
        from app.ai.embeddings_client import get_embeddings_client
        from app.ai.vector_store import get_vector_store
        from app.ai.llm_client import get_llm_client

        vector_store = get_vector_store()
        stats = vector_store.describe_stats()
        if int(stats.get("total_vector_count", 0) or 0) <= 0:
            return None

        embeddings_client = get_embeddings_client()
        context_docs = retrieve_context(message, vector_store, embeddings_client, top_k=5)
        if not context_docs:
            return None

        product_ids: list[int] = []
        for d in context_docs:
            md = d.get("metadata") if isinstance(d, dict) else None
            if isinstance(md, dict) and md.get("type") == "product" and md.get("product_id") is not None:
                try:
                    product_ids.append(int(md["product_id"]))
                except Exception:
                    continue

        unique_product_ids: List[int] = []
        for pid in product_ids:
            if pid not in unique_product_ids:
                unique_product_ids.append(pid)

        system_instruction = (
            "You are a conversational e-commerce assistant. Use ONLY the provided Context from the catalog/FAQ. "
            "Do not invent facts. If the Context does not contain the answer, say you don't know."
        )
        prompt = build_grounded_prompt(message, context_docs, system_instruction=system_instruction)
        llm = get_llm_client()
        reply = await llm.complete(prompt)
        return reply, unique_product_ids
    except Exception:
        return None


def _get_or_create_session_cart_id(db: Session, session_id: Optional[str]) -> int:
    key = session_id or "anonymous"
    if key in _SESSION_CART_IDS:
        return _SESSION_CART_IDS[key]
    cart = cart_service.get_or_create_cart(db, user_id=None)
    _SESSION_CART_IDS[key] = cart.id
    return cart.id


def _looks_like_checkout(message: str) -> bool:
    msg = message.lower()
    return ("checkout" in msg) or ("place order" in msg) or ("place an order" in msg) or ("buy now" in msg)


def _looks_like_add_to_cart(message: str) -> bool:
    msg = message.lower()
    return ("cart" in msg) and any(k in msg for k in ["add", "put", "include", "add to"])


def _looks_like_remove_from_cart(message: str) -> bool:
    msg = message.lower()
    return ("cart" in msg) and any(k in msg for k in ["remove", "delete", "take out"])


def _looks_like_cart_summary(message: str) -> bool:
    msg = message.lower()
    return (
        ("cart" in msg)
        and (
            "summary" in msg
            or "show cart" in msg
            or "my cart" in msg
            or "cart items" in msg
            or "cart contents" in msg
            or "what's in my cart" in msg
            or "whats in my cart" in msg
        )
    )


def _looks_like_compatibility_check(message: str) -> bool:
    msg = message.lower()
    return (
        "compatible" in msg
        or "compatibility" in msg
        or ("fit" in msg and "model" in msg)
        or ("will it" in msg and "fit" in msg)
    )


def _extract_two_product_ids(message: str) -> Optional[tuple[int, int]]:
    ints = re.findall(r"\b(\d+)\b", message)
    if len(ints) < 2:
        return None
    return int(ints[0]), int(ints[1])


def _looks_like_review_search(message: str) -> bool:
    msg = message.lower()
    return ("review" in msg) or ("reviews" in msg) or ("rating" in msg) or ("ratings" in msg)


def _looks_like_popularity_search(message: str) -> bool:
    msg = message.lower()
    return any(
        k in msg
        for k in [
            "popular",
            "most popular",
            "best seller",
            "best sellers",
            "top rated",
            "highly rated",
            "top ",
            "best ",
        ]
    )


def _remove_rank_tokens_for_q(q: str) -> str:
    q2 = q
    q2 = re.sub(r"\b(highly\s*rated|top\s*rated|most\s*popular)\b", " ", q2, flags=re.I)
    q2 = re.sub(r"\b(popular|best\s*sellers?|top\s*rated|highly\s*rated|most\s*popular)\b", " ", q2, flags=re.I)
    q2 = re.sub(r"\b(top|best|most)\b", " ", q2, flags=re.I)
    q2 = re.sub(r"\s+", " ", q2).strip()
    return q2


def _extract_explicit_product_id(message: str) -> Optional[int]:
    msg = message.lower()
    patterns = [
        r"(?:product\s*id|product)\s*[:#]?\s*(\d+)\b",
        r"\bid\s*[:#]?\s*(\d+)\b",
        r"#\s*(\d+)\b",
    ]
    for p in patterns:
        m = re.search(p, msg, re.I)
        if m:
            return int(m.group(1))
    return None


def _extract_quantity_for_cart(message: str) -> int:
    msg = message.lower()
    m = re.search(r"(?:quantity|qty)\s*[:=\-]?\s*(\d+)\b", msg, re.I)
    if m:
        return int(m.group(1))
    m = re.search(r"\bx\s*(\d+)\b", msg, re.I)
    if m:
        return int(m.group(1))
    return 1


def _extract_product_query_for_cart(message: str) -> str:
    msg = message
    msg = re.sub(r"\b(add|put|include|remove|delete|take out|to|into|from)\b", " ", msg, flags=re.I)
    msg = re.sub(r"\b(cart)\b", " ", msg, flags=re.I)
    msg = re.sub(r"\s+", " ", msg).strip(" ,.-")
    return msg


def _extract_price_bounds(message: str) -> tuple[Optional[Decimal], Optional[Decimal]]:
    msg = message.lower().replace(",", "")

    def _to_decimal(n: str) -> Decimal:
        return Decimal(n)

    m = re.search(r"between\s*\$?\s*(\d+(?:\.\d+)?)\s*(?:and|-)\s*\$?\s*(\d+(?:\.\d+)?)", msg, re.I)
    if m:
        a = _to_decimal(m.group(1))
        b = _to_decimal(m.group(2))
        return (min(a, b), max(a, b))

    m = re.search(r"\b\$?\s*(\d+(?:\.\d+)?)\s*-\s*\$?\s*(\d+(?:\.\d+)?)\b", msg, re.I)
    if m:
        a = _to_decimal(m.group(1))
        b = _to_decimal(m.group(2))
        return (min(a, b), max(a, b))

    m = re.search(r"(?:under|below|less than|<=)\s*\$?\s*(\d+(?:\.\d+)?)\b", msg, re.I)
    if m:
        return (None, _to_decimal(m.group(1)))

    m = re.search(r"(?:over|above|greater than|>=)\s*\$?\s*(\d+(?:\.\d+)?)\b", msg, re.I)
    if m:
        return (_to_decimal(m.group(1)), None)

    return (None, None)


def _extract_color_size_category_tags(message: str) -> tuple[Optional[str], Optional[str], Optional[str], Optional[List[str]]]:
    msg_lower = message.strip().lower()

    known_colors = [
        "red",
        "blue",
        "green",
        "black",
        "white",
        "silver",
        "gray",
        "grey",
        "gold",
        "brown",
        "yellow",
        "purple",
        "orange",
        "pink",
        "charcoal",
        "beige",
        "earth tones",
    ]

    color: Optional[str] = None
    m = re.search(r"(?:color|colour)\s*[:=\-]?\s*([A-Za-z ]+)", msg_lower, re.I)
    if m:
        token = m.group(1).strip()
        token = re.split(r"(?:[,\.;/]|\b(?:and|under|below|over|above|with)\b|\b(?:color|size|category|tag|tags?)\b)", token, flags=re.I)[0].strip()
        if token:
            color = f"%{token}%"
    if color is None:
        for c in known_colors:
            if c in msg_lower:
                color = f"%{c}%"
                break

    size: Optional[str] = None
    m = re.search(r"(?:size)\s*[:=\-]?\s*([A-Za-z0-9\.\- ]+)", msg_lower, re.I)
    if m:
        token = m.group(1).strip()
        token = re.split(r"(?:[,\.;/]|\b(?:and|under|below|over|above|with)\b|\b(?:color|size|category|tag|tags?)\b)", token, flags=re.I)[0].strip()
        if token:
            size = f"%{token}%"

    category: Optional[str] = None
    m = re.search(r"(?:category)\s*[:=\-]?\s*([A-Za-z0-9\.\- ]+)", msg_lower, re.I)
    if m:
        token = m.group(1).strip()
        token = re.split(r"(?:[,\.;/]|\b(?:and|under|below|over|above|with)\b|\b(?:color|size|category|tag|tags?)\b)", token, flags=re.I)[0].strip()
        if token:
            category = token

    tags: Optional[List[str]] = None
    if ("tag" in msg_lower) and (" " in msg_lower):
        m = re.search(r"(?:tags?|tag)\s*[:=\-]?\s*([A-Za-z0-9,\s\-]+)", msg_lower, re.I)
        if m:
            raw = m.group(1).strip()
            raw = re.split(r"\b(?:under|below|over|above)\b", raw, flags=re.I)[0].strip()
            parts = [p.strip().lower() for p in re.split(r"[,\s]+", raw) if p.strip()]
            tags = [p for p in parts if re.fullmatch(r"[a-z0-9\-]+", p)]
            tags = tags[:5] if tags else None

    return (color, size, category, tags)


def _remove_filter_tokens_for_q(message: str) -> str:
    msg = message
    msg = re.sub(r"\b(?:under|below|less than|over|above|between)\b[^\d]*(\$?\d+(?:\.\d+)?)", " ", msg, flags=re.I)
    msg = re.sub(r"(\$?\d+(?:\.\d+)?\s*-\s*\$?\d+(?:\.\d+)?)", " ", msg, flags=re.I)
    msg = re.sub(r"(?:color|colour)\s*[:=\-]?\s*[A-Za-z ]+", " ", msg, flags=re.I)
    msg = re.sub(r"\bsize\s*[:=\-]?\s*[A-Za-z0-9\.\- ]+", " ", msg, flags=re.I)
    msg = re.sub(r"\bcategory\s*[:=\-]?\s*[A-Za-z0-9\.\- ]+", " ", msg, flags=re.I)
    msg = re.sub(r"\b(?:tags?|tag)\s*[:=\-]?\s*[A-Za-z0-9,\s\-]+", " ", msg, flags=re.I)
    msg = re.sub(r"\s+", " ", msg).strip(" ,.-")
    return msg


async def handle_chat(body: ChatRequest, db: Session) -> ChatResponse:
    message = (body.message or "").strip()
    if not message:
        return ChatResponse(reply="Please type a message.", product_ids=[], follow_up_prompts=[])

    session_key = body.session_id

    # Transactional intents
    if _looks_like_checkout(message):
        cart_id = _get_or_create_session_cart_id(db, session_key)
        promo_code = _extract_promo_code(message) if _looks_like_promo_validation(message) else None
        try:
            result = order_service.create_order_from_cart(db, cart_id=cart_id, promo_code=promo_code)
        except ValueError as e:
            db.rollback()
            msg = str(e)
            follow = ["Reduce quantities or choose different products."] if "Insufficient stock" in msg else ["Add items to your cart first."]
            return ChatResponse(reply=msg, product_ids=[], follow_up_prompts=follow)

        reply = f"Order #{result['order_id']} confirmed."
        if result.get("total") is not None:
            reply += f" Total: ${result['total']:.2f}"
        return ChatResponse(reply=reply, product_ids=[], follow_up_prompts=[])

    if _looks_like_add_to_cart(message):
        cart_id = _get_or_create_session_cart_id(db, session_key)
        quantity = _extract_quantity_for_cart(message)

        explicit_pid = _extract_explicit_product_id(message)
        if explicit_pid is not None:
            product = search_service.get_product_by_id(db, explicit_pid)
            if not product:
                return ChatResponse(reply=f"I couldn't find product id {explicit_pid}.", product_ids=[], follow_up_prompts=["Send the product name or a different id."])
            inv = db.query(Inventory).filter(Inventory.product_id == explicit_pid).first()
            available_qty = int(inv.quantity) if inv else 0
            if available_qty <= 0:
                return ChatResponse(reply=f"Product id {explicit_pid} is currently out of stock.", product_ids=[], follow_up_prompts=[])
            qty_to_add = min(quantity, available_qty)
            reply_prefix = f"Only {available_qty} are available. " if qty_to_add != quantity else ""
            cart_service.add_item(db, cart_id, explicit_pid, qty_to_add)
            return ChatResponse(reply=f"{reply_prefix}Added '{product.name}' to your cart (x{qty_to_add}).", product_ids=[explicit_pid], follow_up_prompts=[])

        query = _extract_product_query_for_cart(message)
        if not query:
            return ChatResponse(reply="What product do you want to add to your cart?", product_ids=[], follow_up_prompts=["Send the product name or id (e.g., product id 175)."])

        products = search_service.search_products(db, q=query, limit=3, offset=0)
        candidate_ids = [p.id for p in products if getattr(p, "id", None) is not None]
        if not candidate_ids:
            return ChatResponse(reply="I couldn't identify the product to add. Tell me the product name (or id).", product_ids=[], follow_up_prompts=get_guided_follow_ups("search_broad", {"message": message}))

        in_stock_ids: list[int] = []
        available_by_pid: dict[int, int] = {}
        for cand_pid in candidate_ids:
            inv = db.query(Inventory).filter(Inventory.product_id == cand_pid).first()
            available_qty = int(inv.quantity) if inv else 0
            if available_qty > 0:
                in_stock_ids.append(cand_pid)
                available_by_pid[cand_pid] = available_qty

        if not in_stock_ids:
            return ChatResponse(reply="All matching products are currently out of stock. Try another name or product id.", product_ids=[], follow_up_prompts=[])

        if len(in_stock_ids) > 1:
            return ChatResponse(reply="I found multiple in-stock products. Which one should I add?", product_ids=in_stock_ids, follow_up_prompts=["Reply with the product id (e.g., product id 175)."])

        chosen_pid = in_stock_ids[0]
        chosen_available_qty = available_by_pid[chosen_pid]
        qty_to_add = min(quantity, chosen_available_qty)
        reply_prefix = f"Only {chosen_available_qty} are available. " if qty_to_add != quantity else ""
        cart_service.add_item(db, cart_id, chosen_pid, qty_to_add)
        return ChatResponse(reply=f"{reply_prefix}Added product id {chosen_pid} to your cart (x{qty_to_add}).", product_ids=[chosen_pid], follow_up_prompts=[])

    if _looks_like_remove_from_cart(message):
        cart_id = _get_or_create_session_cart_id(db, session_key)
        explicit_pid = _extract_explicit_product_id(message)
        if explicit_pid is not None:
            removed = cart_service.remove_item(db, cart_id, explicit_pid)
            if not removed:
                return ChatResponse(reply=f"Product id {explicit_pid} wasn't found in your cart.", product_ids=[], follow_up_prompts=[])
            return ChatResponse(reply=f"Removed product id {explicit_pid} from your cart.", product_ids=[explicit_pid], follow_up_prompts=[])

        query = _extract_product_query_for_cart(message)
        if not query:
            return ChatResponse(reply="What product do you want to remove from your cart?", product_ids=[], follow_up_prompts=["Send the product name or id (e.g., product id 175)."])

        products = search_service.search_products(db, q=query, limit=3, offset=0)
        candidate_ids = [p.id for p in products if getattr(p, "id", None) is not None]
        if not candidate_ids:
            return ChatResponse(reply="I couldn't identify the product to remove. Tell me the product name (or id).", product_ids=[], follow_up_prompts=[])
        if len(candidate_ids) > 1:
            return ChatResponse(reply="I found multiple products. Which one should I remove?", product_ids=candidate_ids, follow_up_prompts=["Reply with the product id (e.g., product id 175)."])

        pid = candidate_ids[0]
        removed = cart_service.remove_item(db, cart_id, pid)
        if not removed:
            return ChatResponse(reply=f"Product id {pid} wasn't found in your cart.", product_ids=[], follow_up_prompts=[])
        return ChatResponse(reply=f"Removed product id {pid} from your cart.", product_ids=[pid], follow_up_prompts=[])

    if _looks_like_cart_summary(message):
        cart_id = _get_or_create_session_cart_id(db, session_key)
        summary = cart_service.get_cart_summary(db, cart_id)
        items = summary.get("items", []) or []
        product_ids = [int(it["product_id"]) for it in items if it.get("product_id") is not None]
        if not items:
            return ChatResponse(reply=summary.get("text_summary", "Your cart is empty."), product_ids=[], follow_up_prompts=["Add items to your cart first."])
        return ChatResponse(reply=summary.get("text_summary", ""), product_ids=product_ids, follow_up_prompts=["Would you like to checkout?"])

    if _looks_like_compatibility_check(message):
        ids = _extract_two_product_ids(message)
        if ids is None:
            return ChatResponse(reply="Which two products should I check for compatibility?", product_ids=[], follow_up_prompts=["Send two product ids, e.g. product id 175 and 176."])
        from app.services import compatibility_service
        product_id_a, product_id_b = ids
        result = compatibility_service.check_compatibility(db, product_id_a, product_id_b)
        reason = (result.get("reason") or "").replace("—", "-")
        a_name = result.get("product_a", {}).get("name", f"Product {product_id_a}")
        b_name = result.get("product_b", {}).get("name", f"Product {product_id_b}")
        if result.get("compatible"):
            reply = f"Yes - '{a_name}' and '{b_name}' are compatible. {reason}"
        else:
            reply = f"No - '{a_name}' and '{b_name}' aren't compatible. {reason}"
        return ChatResponse(reply=reply, product_ids=[], follow_up_prompts=[])

    if _looks_like_review_search(message):
        product_id = _extract_first_int(message)
        if not product_id:
            return ChatResponse(reply="Which product id do you want reviews for?", product_ids=[], follow_up_prompts=["Send a product id (e.g., product id 175)."])
        from app.models.review import Review
        from sqlalchemy import func
        avg_rating = db.query(func.avg(Review.rating)).filter(Review.product_id == product_id).scalar()
        reviews = db.query(Review).filter(Review.product_id == product_id).order_by(Review.rating.desc()).limit(3).all()
        if not reviews:
            return ChatResponse(reply=f"I couldn't find any reviews for product id {product_id}.", product_ids=[], follow_up_prompts=[])
        avg_part = f"{float(avg_rating):.1f}/5" if avg_rating is not None else "unknown"
        lines: list[str] = []
        for r in reviews:
            rating = float(r.rating) if r.rating is not None else None
            text = (r.text or "").strip()
            if len(text) > 160:
                text = text[:157] + "..."
            label = f"{rating:.1f}/5" if rating is not None else "rating unknown"
            lines.append(f"- {label}: {text}" if text else f"- {label}")
        reply = f"Top reviews for product id {product_id} (avg {avg_part}):\n" + "\n".join(lines)
        return ChatResponse(reply=reply, product_ids=[], follow_up_prompts=[])

    if _looks_like_popularity_search(message):
        min_price, max_price = _extract_price_bounds(message)
        color, size, category, tags = _extract_color_size_category_tags(message)
        q_candidate = _remove_filter_tokens_for_q(message)
        q_candidate = _remove_rank_tokens_for_q(q_candidate)
        q_candidate_norm = (q_candidate or "").strip().lower()
        generic_q = {"product", "products", "item", "items", "product(s)", "ranked"}
        q: Optional[str] = None
        if q_candidate_norm and q_candidate_norm not in generic_q and len(q_candidate_norm) >= 2:
            q = q_candidate_norm

        products = search_service.search_products(
            db,
            q=q,
            min_price=min_price,
            max_price=max_price,
            color=color,
            size=size,
            category=category,
            tags=tags,
            sort_by="popularity",
            limit=5,
            offset=0,
        )
        product_ids = [p.id for p in products if getattr(p, "id", None) is not None]
        if not product_ids:
            return ChatResponse(reply="I couldn't find any popular items matching your request.", product_ids=[], follow_up_prompts=get_guided_follow_ups("search_broad", {"message": message}))
        follow_ups = get_guided_follow_ups("search_broad", {"message": message}) if len(product_ids) >= 3 else []
        return ChatResponse(reply="Here are some popular items that match your request. Want to narrow it down?", product_ids=product_ids, follow_up_prompts=follow_ups)

    if _looks_like_order_tracking(message):
        order_id = _extract_first_int(message)
        if not order_id:
            return ChatResponse(reply="Please tell me your order number so I can check the status.", product_ids=[], follow_up_prompts=["What is your order number?"])
        status = order_service.get_order_status(db, order_id)
        if not status:
            return ChatResponse(reply=f"I couldn't find an order with id {order_id}.", product_ids=[], follow_up_prompts=[])
        reply = f"Order #{status['order_id']} status: {status['order_status']}"
        if status.get("total") is not None:
            reply += f" (Total: ${status['total']:.2f})"
        return ChatResponse(reply=reply, product_ids=[], follow_up_prompts=[])

    if _looks_like_promo_validation(message):
        code = _extract_promo_code(message)
        if not code:
            return ChatResponse(reply="Please tell me the promo code (e.g., WELCOME10).", product_ids=[], follow_up_prompts=["What promo code do you have?"])
        promo_result = promo_service.validate_promo(db, code)
        if not promo_result.get("valid"):
            return ChatResponse(reply=promo_result.get("message", "Invalid promo code."), product_ids=[], follow_up_prompts=[])
        discount = promo_result.get("discount_percent")
        reply = f"{promo_result.get('message', 'Promo applied!')}"
        if discount is not None:
            reply += f" ({discount:.0f}% off)"
        return ChatResponse(reply=reply, product_ids=[], follow_up_prompts=[])

    if _looks_like_faq_question(message):
        faqs = faq_service.search_faqs(db, query=message, limit=3)
        if faqs:
            best = faqs[0]
            if getattr(best, "answer", None):
                return ChatResponse(reply=str(best.answer), product_ids=[], follow_up_prompts=[])

    # RAG fallback (knowledge/discovery only)
    if _should_try_rag(message):
        rag = await _try_rag_answer(message)
        if rag is not None:
            reply, product_ids = rag
            return ChatResponse(reply=reply, product_ids=product_ids, follow_up_prompts=[])

    # Default DB-backed product search
    min_price, max_price = _extract_price_bounds(message)
    color, size, category, tags = _extract_color_size_category_tags(message)
    q_candidate = _remove_filter_tokens_for_q(message)
    q: Optional[str] = q_candidate if q_candidate and len(q_candidate) >= 2 else None
    filters_used = any([min_price is not None, max_price is not None, color is not None, size is not None, category is not None, tags is not None])

    if filters_used:
        products = search_service.search_products(
            db,
            q=q,
            min_price=min_price,
            max_price=max_price,
            color=color,
            size=size,
            category=category,
            tags=tags,
            limit=5,
            offset=0,
        )
    else:
        products = search_service.search_products(db, q=message, limit=5, offset=0)
    product_ids = [p.id for p in products if getattr(p, "id", None) is not None]
    if not product_ids:
        return ChatResponse(reply="I couldn't find matching products. Try adding a color, size, or category.", product_ids=[], follow_up_prompts=get_guided_follow_ups("search_broad", {"message": message}))
    follow_ups = get_guided_follow_ups("search_broad", {"message": message}) if len(product_ids) >= 3 else []
    return ChatResponse(reply="Here are some products that match your request. Want to narrow it down?", product_ids=product_ids, follow_up_prompts=follow_ups)
