"""Multi-turn state, guided follow-up prompts, command-based cart, size selection, order tracking."""
from typing import List, Dict, Any, Optional

# Conversation state: list of {role, content} + optional product_ids / cart_diff
# TODO: persist per session (e.g. in-memory or Redis)
# TODO: detect intent (search vs "add blue one to cart" vs "track order XYZ") and route to search_service / cart_service / order_service
# TODO: when search is too broad, return guided follow-up prompts from backend


def get_guided_follow_ups(intent: str, context: Dict[str, Any]) -> List[str]:
    """Return suggested follow-up questions when search is too broad."""
    return [
        "Narrow by price range?",
        "Any specific color or size?",
    ]
