import Link from "next/link";

const features = [
  {
    icon: "💬",
    title: "Natural Language Search",
    desc: "Ask for products like you'd ask a friend. Our AI understands what you need.",
  },
  {
    icon: "📊",
    title: "Smart Comparison",
    desc: "Compare products side-by-side with dynamic grids built from real specs.",
  },
  {
    icon: "🛒",
    title: "Conversational Cart",
    desc: "Add, remove, and manage your cart through simple chat commands.",
  },
  {
    icon: "🔍",
    title: "Real-Time Stock",
    desc: "Instant inventory checks so you never order what's unavailable.",
  },
  {
    icon: "🏷️",
    title: "Promo & Deals",
    desc: "Validate promo codes and discover discounts seamlessly.",
  },
  {
    icon: "❓",
    title: "Instant FAQ",
    desc: "Get answers to common questions powered by our knowledge base.",
  },
];

const stats = [
  { value: "20+", label: "Core Features" },
  { value: "AI", label: "RAG-Powered" },
  { value: "< 1s", label: "Search Speed" },
  { value: "0", label: "Hallucinations" },
];

export default function HomePage() {
  return (
    <>
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30" />
        {/* Gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-brand-500/5 rounded-full blur-3xl" />

        <div className="relative section-container py-20 sm:py-32 lg:py-40">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-10 border border-accent/20 text-accent text-xs font-medium mb-8 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              AI-Powered Shopping Experience
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-extrabold leading-tight animate-fade-up">
              <span className="text-white">Shop Smarter with</span>
              <br />
              <span className="bg-gradient-to-r from-brand-300 via-accent to-brand-400 bg-clip-text text-transparent">
                Conversational AI
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed animate-fade-up [animation-delay:100ms]">
              Search products, compare features, manage your cart, and get instant
              answers — all through natural language conversation.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up [animation-delay:200ms]">
              <Link href="/chat" className="btn-primary text-base px-8 py-4">
                💬 Start Chatting
              </Link>
              <Link href="/products" className="btn-secondary text-base px-8 py-4">
                🛍️ Browse Products
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 animate-fade-up [animation-delay:300ms]">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-display font-bold text-accent">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section className="section-container py-20">
        <div className="text-center mb-16">
          <h2 className="page-title text-3xl sm:text-4xl">
            Everything You Need
          </h2>
          <p className="page-subtitle">
            A complete AI-powered e-commerce experience in your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <div
              key={feat.title}
              className="glass-card-hover p-6 group"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-accent-10 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300 border border-accent/10">
                {feat.icon}
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                {feat.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="section-container py-20">
        <div className="glass-card p-12 sm:p-16 text-center relative overflow-hidden">
          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-accent-10 rounded-full blur-3xl" />

          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
              Ready to Shop Smarter?
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
              Try our AI shopping assistant now. No signup required to start chatting.
            </p>
            <Link href="/chat" className="btn-primary text-lg px-10 py-4">
              Start Shopping with AI →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
