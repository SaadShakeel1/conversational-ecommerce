"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { ProductOut, ReviewOut } from "@/lib/types";

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<ProductOut | null>(null);
  const [reviews, setReviews] = useState<ReviewOut[]>([]);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Review form state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    // Check auth state on mount
    setIsLoggedIn(!!getToken());
  }, []);

  useEffect(() => {
    (async () => {
      setPending(true);
      try {
        const [productData, reviewsData] = await Promise.all([
          api.products.get(Number(params.id)),
          api.products.reviews(Number(params.id)),
        ]);
        setProduct(productData);
        setReviews(reviewsData);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load product");
      } finally {
        setPending(false);
      }
    })();
  }, [params.id]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    try {
      await api.cart.addItem(product.id);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setSubmittingReview(true);
    setReviewError(null);
    try {
      const newReview = await api.products.createReview(
        product.id,
        reviewRating,
        reviewText.trim() || undefined
      );
      setReviews((prev) => [newReview, ...prev]);
      setReviewText("");
      setReviewRating(5);
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 4000);
    } catch (e: unknown) {
      setReviewError(
        e instanceof Error ? e.message : "Failed to submit review"
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  if (pending) {
    return (
      <div className="section-container py-12">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="skeleton h-80 rounded-2xl" />
          <div className="space-y-4">
            <div className="skeleton h-8 w-3/4" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-2/3" />
            <div className="skeleton h-12 w-40 mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="section-container py-20 text-center">
        <span className="text-5xl mb-4 block">😕</span>
        <h2 className="text-2xl font-display font-bold text-white mb-2">
          Product Not Found
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          {error || "This product doesn't exist or has been removed."}
        </p>
        <Link href="/products" className="btn-secondary">
          ← Back to Products
        </Link>
      </div>
    );
  }

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
      : null;

  return (
    <div className="section-container py-8 sm:py-12 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/products" className="hover:text-accent transition-colors">
          Products
        </Link>
        <span>/</span>
        <span className="text-gray-300 truncate">{product.name}</span>
      </nav>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="glass-card p-8 flex items-center justify-center min-h-[320px]">
          <div className="text-8xl opacity-60">
            {product.category === "electronics"
              ? "💻"
              : product.category === "footwear"
              ? "👟"
              : product.category === "clothing"
              ? "👕"
              : "🛍️"}
          </div>
        </div>

        {/* Details */}
        <div>
          {/* Category */}
          {product.category && (
            <span className="badge mb-4 inline-block">{product.category}</span>
          )}

          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">
            {product.name}
          </h1>

          {/* Average rating badge */}
          {avgRating !== null && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex text-accent text-lg">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={i < Math.round(avgRating) ? "text-accent" : "text-surface-400"}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm text-gray-400">
                {avgRating.toFixed(1)} ({reviews.length}{" "}
                {reviews.length === 1 ? "review" : "reviews"})
              </span>
            </div>
          )}

          <div className="text-3xl font-bold text-accent mb-4">
            ${product.price.toFixed(2)}
          </div>

          {product.description && (
            <p className="text-gray-400 leading-relaxed mb-6">
              {product.description}
            </p>
          )}

          {/* Attributes */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {product.color && (
              <div className="glass-card p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Color</p>
                <p className="text-sm text-white font-medium mt-1">{product.color}</p>
              </div>
            )}
            {product.size && (
              <div className="glass-card p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Size</p>
                <p className="text-sm text-white font-medium mt-1">{product.size}</p>
              </div>
            )}
            {product.model_tag && (
              <div className="glass-card p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Model</p>
                <p className="text-sm text-accent font-medium mt-1">{product.model_tag}</p>
              </div>
            )}
          </div>

          {/* Specs */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
                Specifications
              </h3>
              <div className="glass-card divide-y divide-surface-500/30">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-gray-400 capitalize">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="text-sm text-white font-medium">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="btn-primary flex-1"
            >
              {addingToCart ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-surface-900 border-t-transparent rounded-full animate-spin" />
                  Adding...
                </div>
              ) : addedToCart ? (
                "✓ Added to Cart!"
              ) : (
                "🛒 Add to Cart"
              )}
            </button>
            <Link href="/cart" className="btn-secondary">
              View Cart
            </Link>
          </div>

          {/* Success toast */}
          {addedToCart && (
            <div className="mt-4 p-3 rounded-xl bg-accent-10 border border-accent text-accent text-sm animate-fade-in">
              ✓ Added to your cart!{" "}
              <Link href="/cart" className="underline font-medium">
                View cart →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Reviews Section ─────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto mt-16 pt-16 border-t border-border">
        <h2 className="text-2xl font-display font-bold text-white mb-8">
          Customer Reviews
        </h2>

        {/* ── Write a Review (signed-in only) ── */}
        {isLoggedIn ? (
          <div className="glass-card p-6 mb-10">
            <h3 className="text-lg font-semibold text-white mb-4">Write a Review</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Star picker */}
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
                  Rating
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-3xl transition-transform hover:scale-110 focus:outline-none"
                      aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                    >
                      <span
                        className={
                          star <= (hoverRating || reviewRating)
                            ? "text-accent"
                            : "text-surface-400"
                        }
                      >
                        ★
                      </span>
                    </button>
                  ))}
                  <span className="ml-2 self-center text-sm text-gray-400">
                    {reviewRating} / 5
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label
                  htmlFor="review-text"
                  className="block text-xs text-gray-500 uppercase tracking-wider mb-2"
                >
                  Comment <span className="normal-case text-gray-600">(optional)</span>
                </label>
                <textarea
                  id="review-text"
                  rows={3}
                  maxLength={2000}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with this product…"
                  className="w-full bg-surface-800 border border-border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-accent transition-colors"
                />
                <p className="text-xs text-gray-600 text-right mt-1">
                  {reviewText.length}/2000
                </p>
              </div>

              {/* Feedback */}
              {reviewError && (
                <p className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
                  ⚠ {reviewError}
                </p>
              )}
              {reviewSuccess && (
                <p className="text-sm text-accent bg-accent/10 border border-accent rounded-lg px-3 py-2 animate-fade-in">
                  ✓ Review submitted — thank you!
                </p>
              )}

              <button
                type="submit"
                disabled={submittingReview}
                className="btn-primary"
              >
                {submittingReview ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-surface-900 border-t-transparent rounded-full animate-spin" />
                    Submitting…
                  </span>
                ) : (
                  "Submit Review"
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="glass-card p-6 mb-10 flex items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              Sign in to leave a review for this product.
            </p>
            <Link href="/auth/login" className="btn-secondary whitespace-nowrap">
              Sign In
            </Link>
          </div>
        )}

        {/* ── Existing Reviews ── */}
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet. Be the first!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="glass-card p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={i < review.rating ? "text-accent" : "text-surface-400"}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-white font-medium ml-2">
                    {Number(review.rating).toFixed(1)} / 5
                  </span>
                </div>
                {review.text && (
                  <p className="text-gray-400 text-sm leading-relaxed">
                    &ldquo;{review.text}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
