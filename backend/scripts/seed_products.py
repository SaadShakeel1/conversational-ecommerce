"""Seed the database with sample products, tags, inventory, FAQs, reviews, and promo codes.

Run from the backend/ directory:
    python -m scripts.seed_products
"""
import sys
import os

# Ensure backend/ is on the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timezone, timedelta
from app.db.session import SessionLocal
from app.models.product import Product
from app.models.tag import Tag
from app.models.product_tag import product_tag
from app.models.inventory import Inventory
from app.models.faq import FAQ
from app.models.review import Review
from app.models.promo_code import PromoCode
from app.models.user import User
from app.core.security import get_password_hash


def seed():
    db = SessionLocal()
    try:
        # ------------------------------------------------------------------
        # 1. Tags
        # ------------------------------------------------------------------
        tag_names = [
            "professional", "waterproof", "lightweight", "budget",
            "premium", "wireless", "portable", "eco-friendly",
            "formal", "casual", "outdoor", "indoor",
        ]
        tags = {}
        for name in tag_names:
            t = db.query(Tag).filter(Tag.name == name).first()
            if not t:
                t = Tag(name=name)
                db.add(t)
                db.flush()
            tags[name] = t

        # ------------------------------------------------------------------
        # 2. Products (25 across 5 categories)
        # ------------------------------------------------------------------
        products_data = [
            # --- Electronics ---
            {
                "name": "ProBook Laptop 15",
                "description": "15.6-inch business laptop with Intel i7, 16GB RAM, 512GB SSD. Ideal for professionals.",
                "price": 899.99, "color": "Silver", "size": "15.6 inch",
                "category": "Electronics", "model_tag": "probook-15",
                "specs": {"processor": "Intel i7-13700H", "ram": "16GB DDR5", "storage": "512GB NVMe SSD", "battery": "72Wh", "weight": "1.78kg"},
                "tags": ["professional", "lightweight", "premium"],
            },
            {
                "name": "ProBook Laptop 14",
                "description": "14-inch ultra-portable business laptop. Perfect for travel and presentations.",
                "price": 749.99, "color": "Space Gray", "size": "14 inch",
                "category": "Electronics", "model_tag": "probook-14",
                "specs": {"processor": "Intel i5-13500H", "ram": "8GB DDR5", "storage": "256GB NVMe SSD", "battery": "56Wh", "weight": "1.35kg"},
                "tags": ["professional", "lightweight", "portable"],
            },
            {
                "name": "BassX Wireless Headphones",
                "description": "Over-ear noise cancelling headphones with 40-hour battery life.",
                "price": 149.99, "color": "Black", "size": "One Size",
                "category": "Electronics", "model_tag": "bassx-pro",
                "specs": {"driver": "40mm", "frequency_response": "20Hz-20kHz", "battery": "40 hours", "noise_cancelling": True, "weight": "250g"},
                "tags": ["wireless", "premium", "portable"],
            },
            {
                "name": "BassX Earbuds",
                "description": "True wireless earbuds with IPX5 water resistance. Great for workouts.",
                "price": 59.99, "color": "White", "size": "One Size",
                "category": "Electronics", "model_tag": "bassx-pro",
                "specs": {"driver": "12mm", "battery": "8 hours (32 with case)", "water_resistance": "IPX5", "weight": "6g per earbud"},
                "tags": ["wireless", "waterproof", "budget", "portable"],
            },
            {
                "name": "SmartWatch Pro",
                "description": "Fitness tracker and smartwatch with heart rate, GPS, and 7-day battery.",
                "price": 199.99, "color": "Black", "size": "42mm",
                "category": "Electronics", "model_tag": "smartwatch-pro",
                "specs": {"display": "1.4 inch AMOLED", "sensors": "HR, SpO2, GPS", "battery": "7 days", "water_resistance": "5ATM"},
                "tags": ["waterproof", "wireless", "outdoor"],
            },
            # --- Clothing ---
            {
                "name": "Classic Oxford Shirt",
                "description": "Slim-fit cotton oxford shirt. Perfect for formal and semi-formal occasions.",
                "price": 49.99, "color": "White", "size": "M",
                "category": "Clothing", "model_tag": None,
                "specs": {"material": "100% cotton", "fit": "slim", "care": "machine washable", "collar": "button-down"},
                "tags": ["formal", "professional"],
            },
            {
                "name": "Classic Oxford Shirt",
                "description": "Slim-fit cotton oxford shirt in blue. Perfect for the office.",
                "price": 49.99, "color": "Blue", "size": "L",
                "category": "Clothing", "model_tag": None,
                "specs": {"material": "100% cotton", "fit": "slim", "care": "machine washable", "collar": "button-down"},
                "tags": ["formal", "professional"],
            },
            {
                "name": "Outdoor Adventure Jacket",
                "description": "Waterproof and breathable hiking jacket with sealed seams.",
                "price": 129.99, "color": "Green", "size": "L",
                "category": "Clothing", "model_tag": None,
                "specs": {"material": "Gore-Tex", "waterproof_rating": "20,000mm", "breathability": "15,000g/m²", "weight": "380g"},
                "tags": ["waterproof", "outdoor", "lightweight"],
            },
            {
                "name": "Urban Sneakers",
                "description": "Comfortable everyday sneakers with memory foam insole.",
                "price": 79.99, "color": "White", "size": "10",
                "category": "Clothing", "model_tag": None,
                "specs": {"material": "mesh upper, rubber sole", "insole": "memory foam", "weight": "280g"},
                "tags": ["casual", "lightweight"],
            },
            {
                "name": "Linen Summer Pants",
                "description": "Relaxed fit linen pants, ideal for hot weather events.",
                "price": 59.99, "color": "Beige", "size": "32",
                "category": "Clothing", "model_tag": None,
                "specs": {"material": "100% linen", "fit": "relaxed", "care": "hand wash recommended"},
                "tags": ["casual", "outdoor", "lightweight"],
            },
            # --- Home ---
            {
                "name": "ErgoDesk Standing Desk",
                "description": "Electric sit-stand desk with programmable height presets.",
                "price": 449.99, "color": "Walnut", "size": "60x30 inch",
                "category": "Home", "model_tag": None,
                "specs": {"material": "bamboo top, steel frame", "height_range": "28-48 inches", "motor": "dual motor", "weight_capacity": "150lbs"},
                "tags": ["professional", "premium", "eco-friendly"],
            },
            {
                "name": "Smart LED Desk Lamp",
                "description": "Adjustable desk lamp with 5 brightness levels and USB charging.",
                "price": 34.99, "color": "White", "size": "18 inch",
                "category": "Home", "model_tag": None,
                "specs": {"brightness_levels": 5, "color_temperatures": 3, "usb_port": True, "power": "12W LED"},
                "tags": ["budget", "indoor"],
            },
            {
                "name": "Ceramic Coffee Mug Set",
                "description": "Set of 4 handcrafted ceramic mugs. Microwave and dishwasher safe.",
                "price": 24.99, "color": "Earth Tones", "size": "12oz",
                "category": "Home", "model_tag": None,
                "specs": {"material": "stoneware ceramic", "capacity": "12oz each", "quantity": 4, "safe": "microwave, dishwasher"},
                "tags": ["eco-friendly", "indoor", "budget"],
            },
            {
                "name": "Bamboo Cutting Board",
                "description": "Large organic bamboo cutting board with juice groove.",
                "price": 19.99, "color": "Natural", "size": "18x12 inch",
                "category": "Home", "model_tag": None,
                "specs": {"material": "organic bamboo", "dimensions": "18x12x1.5 inch", "features": "juice groove, handle"},
                "tags": ["eco-friendly", "budget"],
            },
            {
                "name": "Smart Home Speaker",
                "description": "Voice-controlled smart speaker with premium 360° audio.",
                "price": 89.99, "color": "Charcoal", "size": "One Size",
                "category": "Home", "model_tag": None,
                "specs": {"audio": "360° sound, dual drivers", "connectivity": "WiFi, Bluetooth 5.0", "voice_assistant": True},
                "tags": ["wireless", "premium", "indoor"],
            },
            # --- Sports ---
            {
                "name": "Carbon Road Bike",
                "description": "Lightweight carbon fiber road bike with Shimano 105 groupset.",
                "price": 1299.99, "color": "Red", "size": "56cm",
                "category": "Sports", "model_tag": None,
                "specs": {"frame": "carbon fiber", "groupset": "Shimano 105", "weight": "8.2kg", "wheels": "700c alloy"},
                "tags": ["premium", "lightweight", "outdoor"],
            },
            {
                "name": "Yoga Mat Pro",
                "description": "6mm thick non-slip yoga mat made from natural rubber.",
                "price": 39.99, "color": "Purple", "size": "72x24 inch",
                "category": "Sports", "model_tag": None,
                "specs": {"material": "natural rubber", "thickness": "6mm", "texture": "non-slip", "weight": "2.5kg"},
                "tags": ["eco-friendly", "portable", "indoor"],
            },
            {
                "name": "Trail Running Shoes",
                "description": "All-terrain trail running shoes with aggressive grip and waterproof upper.",
                "price": 119.99, "color": "Black/Orange", "size": "10",
                "category": "Sports", "model_tag": None,
                "specs": {"upper": "waterproof mesh", "sole": "Vibram rubber", "drop": "6mm", "weight": "310g"},
                "tags": ["waterproof", "outdoor", "lightweight"],
            },
            {
                "name": "Resistance Band Set",
                "description": "Set of 5 resistance bands with handles, ideal for home or travel workouts.",
                "price": 24.99, "color": "Multi", "size": "One Size",
                "category": "Sports", "model_tag": None,
                "specs": {"resistance_levels": "10-50 lbs", "quantity": 5, "includes": "door anchor, ankle straps, carry bag"},
                "tags": ["budget", "portable", "indoor"],
            },
            {
                "name": "Insulated Water Bottle",
                "description": "32oz double-wall insulated stainless steel water bottle. Keeps drinks cold 24hrs.",
                "price": 29.99, "color": "Navy", "size": "32oz",
                "category": "Sports", "model_tag": None,
                "specs": {"material": "18/8 stainless steel", "insulation": "double-wall vacuum", "capacity": "32oz", "cold": "24hrs", "hot": "12hrs"},
                "tags": ["eco-friendly", "outdoor", "portable"],
            },
            # --- Accessories ---
            {
                "name": "ProBook 15 Laptop Case",
                "description": "Protective case designed for ProBook 15 laptops. Shock-absorbent padding.",
                "price": 29.99, "color": "Black", "size": "15.6 inch",
                "category": "Accessories", "model_tag": "probook-15",
                "specs": {"material": "neoprene + nylon", "padding": "10mm shock-absorbent", "pockets": 2},
                "tags": ["professional", "portable"],
            },
            {
                "name": "ProBook 14 Laptop Sleeve",
                "description": "Slim laptop sleeve for ProBook 14. Water-resistant exterior.",
                "price": 24.99, "color": "Gray", "size": "14 inch",
                "category": "Accessories", "model_tag": "probook-14",
                "specs": {"material": "water-resistant polyester", "padding": "8mm foam", "closure": "magnetic"},
                "tags": ["professional", "lightweight", "portable"],
            },
            {
                "name": "SmartWatch Pro Band",
                "description": "Replacement silicone band for SmartWatch Pro. Multiple colors available.",
                "price": 14.99, "color": "Blue", "size": "42mm",
                "category": "Accessories", "model_tag": "smartwatch-pro",
                "specs": {"material": "medical-grade silicone", "closure": "pin-and-tuck", "compatible": "SmartWatch Pro 42mm"},
                "tags": ["budget", "outdoor"],
            },
            {
                "name": "Leather Bifold Wallet",
                "description": "Genuine leather wallet with RFID blocking. 8 card slots.",
                "price": 39.99, "color": "Brown", "size": "One Size",
                "category": "Accessories", "model_tag": None,
                "specs": {"material": "genuine leather", "card_slots": 8, "rfid_blocking": True, "dimensions": "4.5x3.5x0.5 inch"},
                "tags": ["professional", "premium"],
            },
            {
                "name": "Polarized Sunglasses",
                "description": "UV400 polarized sunglasses with lightweight TR90 frame.",
                "price": 44.99, "color": "Matte Black", "size": "One Size",
                "category": "Accessories", "model_tag": None,
                "specs": {"lens": "UV400 polarized", "frame": "TR90 nylon", "weight": "22g", "includes": "hard case, cleaning cloth"},
                "tags": ["outdoor", "lightweight", "casual"],
            },
        ]

        product_objs = []
        for pd_data in products_data:
            p_tags = pd_data.pop("tags")
            p = Product(**pd_data)
            db.add(p)
            db.flush()
            # Assign tags
            for tname in p_tags:
                db.execute(product_tag.insert().values(product_id=p.id, tag_id=tags[tname].id))
            product_objs.append(p)

        # ------------------------------------------------------------------
        # 3. Inventory
        # ------------------------------------------------------------------
        import random
        for p in product_objs:
            inv = Inventory(product_id=p.id, quantity=random.randint(5, 200))
            db.add(inv)

        # ------------------------------------------------------------------
        # 4. FAQs
        # ------------------------------------------------------------------
        faqs_data = [
            ("What is your return policy?", "We offer a 30-day return policy on all unused items in original packaging. Simply contact our support team and we'll arrange a return label."),
            ("How long does shipping take?", "Standard shipping takes 5-7 business days. Express shipping (2-3 days) is available for an additional fee at checkout."),
            ("Do you ship internationally?", "Yes! We ship to over 50 countries. International shipping typically takes 10-15 business days. Customs fees may apply."),
            ("How do I track my order?", "Once your order ships, you'll receive an email with a tracking number. You can also check order status on our website using your order ID."),
            ("What payment methods do you accept?", "We accept all major credit cards (Visa, MasterCard, Amex), debit cards, PayPal, and bank transfers."),
            ("Is my payment information secure?", "Absolutely. We use 256-bit SSL encryption and never store your full card details. All transactions are processed through secure payment gateways."),
            ("Can I cancel my order?", "Orders can be cancelled within 2 hours of placement. After that, please use our return process once the item arrives."),
            ("Do you offer warranty?", "Most electronic products come with a 1-year manufacturer warranty. Extended warranty options are available at checkout."),
            ("How can I contact customer support?", "You can reach us via chat (right here!), email at support@store.com, or phone at 1-800-SHOP. We're available 9 AM - 9 PM EST."),
            ("Do you price match?", "Yes, we offer price matching on identical items from authorized retailers. Contact support with the competitor's listing link."),
            ("What are your store hours?", "We are an online-only store, open 24/7! Customer support is available 9 AM - 9 PM EST, Monday through Saturday."),
            ("Do you offer gift wrapping?", "Yes! Gift wrapping is available for $3.99 per item. Select the option at checkout and add a personalized message."),
        ]
        for q, a in faqs_data:
            db.add(FAQ(question=q, answer=a))

        # ------------------------------------------------------------------
        # 5. Demo user
        # ------------------------------------------------------------------
        demo = db.query(User).filter(User.email == "demo@store.com").first()
        if not demo:
            demo = User(
                email="demo@store.com",
                password_hash=get_password_hash("demo1234"),
                is_active=True,
            )
            db.add(demo)
            db.flush()

        # ------------------------------------------------------------------
        # 6. Reviews
        # ------------------------------------------------------------------
        review_data = [
            (product_objs[0].id, 4.5, "Great laptop for work. Battery life could be better."),
            (product_objs[0].id, 5.0, "Best business laptop I've ever owned. Runs everything smoothly."),
            (product_objs[2].id, 4.0, "Noise cancelling is impressive. A bit heavy for long sessions."),
            (product_objs[4].id, 4.5, "Love the fitness features. GPS tracking is very accurate."),
            (product_objs[5].id, 5.0, "Perfect fit and premium cotton quality."),
            (product_objs[7].id, 4.5, "Kept me dry in heavy rain. Exactly as described."),
            (product_objs[10].id, 5.0, "Solid standing desk. Motor is whisper quiet."),
            (product_objs[15].id, 4.0, "Beautiful bike but assembly instructions could be clearer."),
            (product_objs[3].id, 3.5, "Good sound for the price. Ear tips could be more comfortable."),
            (product_objs[19].id, 4.5, "Keeps water ice cold all day. No leaks."),
        ]
        for pid, rating, text in review_data:
            db.add(Review(product_id=pid, user_id=demo.id, rating=rating, text=text))

        # ------------------------------------------------------------------
        # 7. Promo codes
        # ------------------------------------------------------------------
        promos = [
            PromoCode(code="WELCOME10", discount_percent=10.0, is_active=True, expires_at=datetime.now(timezone.utc) + timedelta(days=90)),
            PromoCode(code="SUMMER25", discount_percent=25.0, is_active=True, expires_at=datetime.now(timezone.utc) + timedelta(days=60)),
            PromoCode(code="EXPIRED5", discount_percent=5.0, is_active=True, expires_at=datetime.now(timezone.utc) - timedelta(days=1)),
        ]
        for promo in promos:
            existing = db.query(PromoCode).filter(PromoCode.code == promo.code).first()
            if not existing:
                db.add(promo)

        db.commit()
        print(f"[SUCCESS] Seeded {len(product_objs)} products, {len(tag_names)} tags, {len(faqs_data)} FAQs, {len(review_data)} reviews, {len(promos)} promo codes.")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
