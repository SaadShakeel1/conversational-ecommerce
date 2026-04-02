import time
from typing import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.session import get_db
import app.models  # noqa: F401  (register models)

from app.main import create_app
from app.models.inventory import Inventory
from app.models.product import Product


@pytest.fixture()
def db_session() -> Generator[Session, None, None]:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        future=True,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    try:
        # Seed one product + inventory for cart/checkout tests.
        p = Product(
            id=177,
            name="Test Headphones",
            description="Test product",
            price=149.99,
            color="black",
            size="M",
            category="audio",
            specs={"ram": "16GB DDR5"},
        )
        db.add(p)
        db.add(Inventory(product_id=177, quantity=100))
        db.commit()
        yield db
    finally:
        db.close()


@pytest.fixture()
def client(db_session: Session) -> Generator[TestClient, None, None]:
    app = create_app()

    def _override_get_db() -> Generator[Session, None, None]:
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c


@pytest.fixture()
def auth_headers(client: TestClient) -> dict:
    email = f"t_{int(time.time())}@example.com"
    pwd = "Passw0rd!"
    r = client.post("/api/auth/register", json={"email": email, "password": pwd})
    assert r.status_code == 201
    login = client.post(
        "/api/auth/login",
        data={"username": email, "password": pwd},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert login.status_code == 200
    tok = login.json().get("access_token")
    assert tok
    return {"Authorization": f"Bearer {tok}"}

