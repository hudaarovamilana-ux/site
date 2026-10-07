"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { postJson } from "@/lib/api-client";
import { PRICING_PLANS } from "@/lib/pricing";

export function PricingCards() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState("");

  const startPayment = async (planId: string) => {
    setError("");
    setLoadingPlan(planId);
    try {
      const me = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
      if (!me.ok) {
        router.push(`/login?next=${encodeURIComponent("/pricing")}`);
        return;
      }

      const data = await postJson<{ confirmationUrl: string }>("/api/payments/create", {
        planId,
      });
      if (!data.confirmationUrl) {
        throw new Error("Не удалось получить ссылку на оплату");
      }
      window.location.href = data.confirmationUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось начать оплату");
      setLoadingPlan(null);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <p className="text-center text-sm text-rose-muted bg-rose-pale/50 rounded-2xl px-4 py-3 max-w-xl mx-auto">
          {error}
        </p>
      )}

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {PRICING_PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-3xl p-8 ${
              plan.highlighted
                ? "border-2 border-ink bg-white shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
                : "border border-beige-dark/40 bg-white/60"
            }`}
          >
            {plan.badge && (
              <p className="absolute -top-3 left-8 rounded-full bg-ink px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-cream">
                {plan.badge}
              </p>
            )}
            <h2 className="text-lg font-medium text-ink">{plan.name}</h2>
            <p className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              {plan.compareAt && (
                <span className="text-sm text-ink-muted line-through">{plan.compareAt}</span>
              )}
              <span className="text-4xl font-light">{plan.price}</span>
              <span className="text-sm text-ink-muted">/ {plan.period}</span>
            </p>
            {plan.perMonthHint && (
              <p className="mt-2 text-xs text-ink-muted">{plan.perMonthHint}</p>
            )}
            <ul className="mt-8 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="text-sm text-ink-soft flex gap-2">
                  <span className="text-rose-muted">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled={loadingPlan !== null}
              onClick={() => startPayment(plan.id)}
              className="mt-8 w-full rounded-full bg-ink py-3.5 text-sm font-medium text-cream hover:bg-ink/90 disabled:opacity-50 transition"
            >
              {loadingPlan === plan.id ? "Переходим к оплате..." : "Оплатить"}
            </button>
            <p className="mt-3 text-center text-xs text-ink-muted">
              Нужен аккаунт. Нет?{" "}
              <Link href="/register" className="underline text-ink">
                Зарегистрироваться
              </Link>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
