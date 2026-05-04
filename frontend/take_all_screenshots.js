/**
 * Comprehensive Feature Screenshot Script
 * Captures all 20 proposal features and saves to ./picture/
 */
const { chromium } = require("playwright");
const path = require("path");

const BASE = "http://localhost:3000";
const API = "http://127.0.0.1:8000";
const OUT = path.join(__dirname, "..", "picture");

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function chatAndScreenshot(page, message, filename, waitMs = 8000) {
  // Navigate to fresh chat page
  await page.goto(`${BASE}/chat`, { waitUntil: "networkidle" });
  await sleep(1500);

  // Find and fill the chat input
  const input = page.locator("textarea#chat-input, textarea, input[type='text']").first();
  await input.fill(message);
  await input.press("Enter");

  // Wait for AI response
  await sleep(waitMs);
  await page.screenshot({ path: path.join(OUT, filename), fullPage: false });
  console.log(`[OK] ${filename}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // ───────────────────────────────────────────────
  // Feature 1: Natural Language Attribute Filtering
  // ───────────────────────────────────────────────
  await chatAndScreenshot(
    page,
    'Show me cheap mountain bikes',
    '01_natural_language_attribute_filtering.png'
  );

  // ───────────────────────────────────────────────
  // Feature 2: Multi-Constraint Search
  // ───────────────────────────────────────────────
  await chatAndScreenshot(
    page,
    'Find me blue bikes under $1000 in size large',
    '02_multi_constraint_search.png'
  );

  // ───────────────────────────────────────────────
  // Feature 3: Dynamic Comparison Grid
  // ───────────────────────────────────────────────
  await page.goto(`${BASE}/compare`, { waitUntil: "networkidle" });
  await sleep(2000);
  await page.screenshot({ path: path.join(OUT, "03_dynamic_comparison_grid.png"), fullPage: true });
  console.log("[OK] 03_dynamic_comparison_grid.png");

  // ───────────────────────────────────────────────
  // Feature 4: Price Range Recognition
  // ───────────────────────────────────────────────
  await chatAndScreenshot(
    page,
    'Show me products between $200 and $500',
    '04_price_range_recognition.png'
  );

  // ───────────────────────────────────────────────
  // Feature 5: Tag-Based Discovery
  // ───────────────────────────────────────────────
  await chatAndScreenshot(
    page,
    'Find professional waterproof gear',
    '05_tag_based_discovery.png'
  );

  // ───────────────────────────────────────────────
  // Feature 6: Weighted Sorting
  // ───────────────────────────────────────────────
  await page.goto(`${BASE}/products`, { waitUntil: "networkidle" });
  await sleep(2000);
  await page.screenshot({ path: path.join(OUT, "06_weighted_sorting.png"), fullPage: false });
  console.log("[OK] 06_weighted_sorting.png");

  // ───────────────────────────────────────────────
  // Feature 7: Conversational Size Selection
  // ───────────────────────────────────────────────
  await chatAndScreenshot(
    page,
    'I need that bike in size XL',
    '07_conversational_size_selection.png'
  );

  // ───────────────────────────────────────────────
  // Feature 8: Real-Time Stock Check
  // ───────────────────────────────────────────────
  await chatAndScreenshot(
    page,
    'Is the Mountain Pro 2024 in stock?',
    '08_realtime_stock_check.png'
  );

  // ───────────────────────────────────────────────
  // Feature 9: Related Item Cross-Selling
  // ───────────────────────────────────────────────
  await page.goto(`${BASE}/products/1`, { waitUntil: "networkidle" });
  await sleep(2000);
  // Scroll down to the related items section
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(1000);
  await page.screenshot({ path: path.join(OUT, "09_related_item_cross_selling.png"), fullPage: false });
  console.log("[OK] 09_related_item_cross_selling.png");

  // ───────────────────────────────────────────────
  // Feature 10: Feature-Based Product Bundling
  // ───────────────────────────────────────────────
  await chatAndScreenshot(
    page,
    'Can you suggest a bundle for a new rider?',
    '10_feature_based_product_bundling.png'
  );

  // ───────────────────────────────────────────────
  // Feature 11: JSONB Detail Extraction
  // ───────────────────────────────────────────────
  await page.goto(`${BASE}/products/1`, { waitUntil: "networkidle" });
  await sleep(2000);
  await page.screenshot({ path: path.join(OUT, "11_jsonb_detail_extraction.png"), fullPage: true });
  console.log("[OK] 11_jsonb_detail_extraction.png");

  // ───────────────────────────────────────────────
  // Feature 12: Text-Based FAQ Retrieval
  // ───────────────────────────────────────────────
  await chatAndScreenshot(
    page,
    'How do I return items? What is the return policy?',
    '12_text_based_faq_retrieval.png'
  );

  // ───────────────────────────────────────────────
  // Feature 13: Guided Follow-up Prompts
  // ───────────────────────────────────────────────
  await chatAndScreenshot(
    page,
    'I want a bike',
    '13_guided_followup_prompts.png'
  );

  // ───────────────────────────────────────────────
  // Feature 14: Cart Feature Summary
  // ───────────────────────────────────────────────
  await page.goto(`${BASE}/cart`, { waitUntil: "networkidle" });
  await sleep(2000);
  await page.screenshot({ path: path.join(OUT, "14_cart_feature_summary.png"), fullPage: true });
  console.log("[OK] 14_cart_feature_summary.png");

  // ───────────────────────────────────────────────
  // Feature 15: Promo Code Validation
  // ───────────────────────────────────────────────
  // First login so we can see the full cart
  // Try to apply a promo code on the cart page
  await page.goto(`${BASE}/cart`, { waitUntil: "networkidle" });
  await sleep(2000);
  // Look for the promo input
  const promoInput = page.locator("#promo-code");
  if (await promoInput.isVisible()) {
    await promoInput.fill("WELCOME10");
    await page.locator("button", { hasText: "Apply" }).click();
    await sleep(2000);
    await page.screenshot({ path: path.join(OUT, "15_promo_code_validation.png"), fullPage: true });
    console.log("[OK] 15_promo_code_validation.png");
  } else {
    // Fallback: screenshot cart page as-is
    await page.screenshot({ path: path.join(OUT, "15_promo_code_validation.png"), fullPage: true });
    console.log("[OK] 15_promo_code_validation.png (cart page - not logged in)");
  }

  // ───────────────────────────────────────────────
  // Feature 16: Compatibility Logic
  // ───────────────────────────────────────────────
  await chatAndScreenshot(
    page,
    'Is this pedal compatible with my mountain bike?',
    '16_compatibility_logic.png'
  );

  // ───────────────────────────────────────────────
  // Feature 17: Popularity Filtering
  // ───────────────────────────────────────────────
  await chatAndScreenshot(
    page,
    'Show me the most popular products with highest ratings',
    '17_popularity_filtering.png'
  );

  // ───────────────────────────────────────────────
  // Feature 18: Review Search
  // ───────────────────────────────────────────────
  await chatAndScreenshot(
    page,
    'What do people say about the brakes on mountain bikes?',
    '18_review_search.png'
  );

  // ───────────────────────────────────────────────
  // Feature 19: Command-Based Cart Management
  // ───────────────────────────────────────────────
  await chatAndScreenshot(
    page,
    'Add the Mountain Pro 2024 to my cart',
    '19_command_based_cart_management.png'
  );

  // ───────────────────────────────────────────────
  // Feature 20: Order Tracking Query
  // ───────────────────────────────────────────────
  await chatAndScreenshot(
    page,
    'Where is my order #12345?',
    '20_order_tracking_query.png'
  );

  // ───────────────────────────────────────────────
  // Bonus: FAQ Page
  // ───────────────────────────────────────────────
  await page.goto(`${BASE}/faq`, { waitUntil: "networkidle" });
  await sleep(2000);
  await page.screenshot({ path: path.join(OUT, "bonus_faq_page.png"), fullPage: false });
  console.log("[OK] bonus_faq_page.png");

  // ───────────────────────────────────────────────
  // Bonus: Homepage
  // ───────────────────────────────────────────────
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await sleep(2000);
  await page.screenshot({ path: path.join(OUT, "bonus_homepage.png"), fullPage: false });
  console.log("[OK] bonus_homepage.png");

  await browser.close();
  console.log("\n=== ALL 20 FEATURE SCREENSHOTS COMPLETE ===");
  console.log(`Saved to: ${OUT}`);
})();
