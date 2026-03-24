from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import routes_chat, routes_products, routes_cart, routes_orders, routes_faq, routes_auth


def create_app() -> FastAPI:
    app = FastAPI(title="Conversational E-commerce API")

    # CORS – allow frontend dev server
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Global exception handler
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={"detail": str(exc)},
        )

    app.include_router(routes_auth.router, prefix="/api/auth", tags=["auth"])
    app.include_router(routes_chat.router, prefix="/api/chat", tags=["chat"])
    app.include_router(routes_products.router, prefix="/api/products", tags=["products"])
    app.include_router(routes_cart.router, prefix="/api/cart", tags=["cart"])
    app.include_router(routes_orders.router, prefix="/api/orders", tags=["orders"])
    app.include_router(routes_faq.router, prefix="/api/faq", tags=["faq"])

    return app


app = create_app()


