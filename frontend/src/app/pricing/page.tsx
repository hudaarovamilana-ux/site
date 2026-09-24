import Link from "next/link";
import { PRICING_PLANS } from "@/lib/pricing";

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-medium text-ink text-center mb-2">Тарифы</h1>
      <p className="text-center text-ink-muted text-sm mb-12">
        Выберите подходящий план
      </p>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {PRICING_PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-3xl p-8 ${
              plan.highlighted
                ? "border-2 border-ink bg-white shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
                : "border border-beige-dark/40 bg-white/60"
            }`}
          >
            <h2 className="text-lg font-medium text-ink">{plan.name}</h2>
            <p className="mt-4">
              <span className="text-4xl font-light">{plan.price}</span>
              <span className="text-sm text-ink-muted ml-2">/ {plan.period}</span>
            </p>
            <ul className="mt-8 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="text-sm text-ink-soft flex gap-2">
                  <span className="text-rose-muted">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={plan.id === "free" ? "/onboarding" : "/register"}
              className={`mt-8 block text-center rounded-full py-3 text-sm font-medium transition ${
                plan.highlighted
                  ? "bg-ink text-cream hover:bg-ink/90"
                  : "border border-beige-dark hover:bg-beige/40"
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
