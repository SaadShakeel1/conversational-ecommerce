import time


def test_auth_register_login_me(client):
    email = f"a_{int(time.time())}@example.com"
    pwd = "Passw0rd!"
    reg = client.post("/api/auth/register", json={"email": email, "password": pwd})
    assert reg.status_code == 201

    login = client.post(
        "/api/auth/login",
        data={"username": email, "password": pwd},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert login.status_code == 200
    tok = login.json().get("access_token")
    assert tok

    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {tok}"})
    assert me.status_code == 200


def test_protected_routes_require_auth(client):
    assert client.get("/api/cart/summary").status_code == 401
    assert client.post("/api/orders/checkout").status_code == 401
    assert client.get("/api/orders/track", params={"orderId": 1}).status_code == 401


def test_chat_size_limit_413(client):
    big = "x" * 3000
    r = client.post("/api/chat", json={"message": big, "session_id": "s"})
    assert r.status_code == 413


def test_rate_limit_chat_429(client):
    # /api/chat is limited to 20/min; make 25 quick calls.
    codes = []
    for _ in range(25):
        r = client.post("/api/chat", json={"message": "hi", "session_id": "rl"})
        codes.append(r.status_code)
    assert 429 in codes


def test_cart_and_checkout_flow(auth_headers, client):
    add = client.post("/api/cart/items", params={"product_id": 177, "quantity": 1}, headers=auth_headers)
    assert add.status_code == 200

    co = client.post("/api/orders/checkout", headers=auth_headers)
    assert co.status_code == 200
    assert co.json().get("order_id") is not None


def test_order_track_owner_vs_other(client):
    # owner
    email1 = f"o_{int(time.time())}@example.com"
    pwd = "Passw0rd!"
    _ = client.post("/api/auth/register", json={"email": email1, "password": pwd})
    login1 = client.post(
        "/api/auth/login",
        data={"username": email1, "password": pwd},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    tok1 = login1.json().get("access_token")
    h1 = {"Authorization": f"Bearer {tok1}"}
    _ = client.post("/api/cart/items", params={"product_id": 177, "quantity": 1}, headers=h1)
    co = client.post("/api/orders/checkout", headers=h1)
    order_id = co.json().get("order_id")
    assert order_id is not None

    ok = client.get("/api/orders/track", params={"orderId": order_id}, headers=h1)
    assert ok.status_code == 200

    # other
    email2 = f"x_{int(time.time())}@example.com"
    _ = client.post("/api/auth/register", json={"email": email2, "password": pwd})
    login2 = client.post(
        "/api/auth/login",
        data={"username": email2, "password": pwd},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    tok2 = login2.json().get("access_token")
    h2 = {"Authorization": f"Bearer {tok2}"}
    bad = client.get("/api/orders/track", params={"orderId": order_id}, headers=h2)
    assert bad.status_code == 403

