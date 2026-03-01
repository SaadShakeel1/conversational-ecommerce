# Feature-to-module mapping (20 domain features)

1. **Natural language attribute filtering** — `search_service`, `text_parsing`, `rag_pipeline`, `routes_chat`
2. **Multi-constraint search** — same
3. **Dynamic comparison grid** — `comparison_service`, `ComparisonGrid` component
4. **Price range recognition** — `text_parsing`, `search_service`
5. **Tag-based discovery** — `Tag`/`product_tag` models, `search_service`
6. **Weighted sorting** — `search_service`
7. **Conversational size selection** — `conversational_agent`, `routes_chat`
8. **Real-time stock check** — `inventory` model, `search_service`, `routes_chat`
9. **Related item cross-selling** — product/order logic, `routes_products`
10. **Feature-based product bundling** — `comparison_service` / bundling service
11. **JSONB detail extraction** — `Product.specs`, product routes/schemas
12. **Text-based FAQ retrieval** — `faq_service`, `routes_faq`
13. **Guided follow-up prompts** — `conversational_agent`, ChatResponse
14. **Cart feature summary** — `cart_service`, `CartSummary` component
15. **Promo code validation** — `promo_service`, `routes_orders`
16. **Compatibility logic** — `compatibility_service`, `Product.model_tag`
17. **Popularity filtering** — `search_service`, reviews/ratings
18. **Review search** — `review` model, search/FAQ-style retrieval
19. **Command-based cart management** — `conversational_agent`, `cart_service`
20. **Order tracking query** — `order_service`, `routes_orders`
