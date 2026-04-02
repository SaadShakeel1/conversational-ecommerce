import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import routes_chat, routes_products, routes_cart, routes_orders, routes_faq, routes_auth, routes_rag
from app.config import settings
from app.core.rate_limiter import limiter

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware


def create_app() -> FastAPI:
    app = FastAPI(title="Conversational E-commerce API")
    logger = logging.getLogger("app")

    # Rate limiting
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)

    # CORS – allow frontend dev server
    allow_origins = [o.strip() for o in (settings.cors_allow_origins or "").split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Global exception handler
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.exception("Unhandled exception", exc_info=exc)
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
        )

    app.include_router(routes_auth.router, prefix="/api/auth", tags=["auth"])
    app.include_router(routes_chat.router, prefix="/api/chat", tags=["chat"])
    app.include_router(routes_products.router, prefix="/api/products", tags=["products"])
    app.include_router(routes_cart.router, prefix="/api/cart", tags=["cart"])
    app.include_router(routes_orders.router, prefix="/api/orders", tags=["orders"])
    app.include_router(routes_faq.router, prefix="/api/faq", tags=["faq"])
    app.include_router(routes_rag.router, prefix="/api/rag", tags=["rag"])

    return app


app = create_app()


