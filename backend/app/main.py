from fastapi import FastAPI

from app.api import routes_chat, routes_products, routes_cart, routes_orders, routes_faq, routes_auth


def create_app() -> FastAPI:
    app = FastAPI(title="Conversational E-commerce API")

    app.include_router(routes_auth.router, prefix="/api/auth", tags=["auth"])
    app.include_router(routes_chat.router, prefix="/api/chat", tags=["chat"])
    app.include_router(routes_products.router, prefix="/api/products", tags=["products"])
    app.include_router(routes_cart.router, prefix="/api/cart", tags=["cart"])
    app.include_router(routes_orders.router, prefix="/api/orders", tags=["orders"])
    app.include_router(routes_faq.router, prefix="/api/faq", tags=["faq"])

    return app


app = create_app()

