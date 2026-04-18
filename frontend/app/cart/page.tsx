import type { Metadata } from "next";
import CartSummary from "@/components/cart/CartSummary";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "View and manage items in your shopping cart.",
};

export default function CartPage() {
  return (
    <div className="section-container py-8 sm:py-12">
      <div className="page-header !py-6">
        <h1 className="page-title">Your Cart</h1>
        <p className="page-subtitle">Review your items and checkout</p>
      </div>

      <div className="max-w-3xl mx-auto">
        <CartSummary />
      </div>
    </div>
  );
}
