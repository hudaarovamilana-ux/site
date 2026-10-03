import { PRICING_PLANS } from "@/lib/pricing";

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-medium text-ink text-center mb-2">Тарифы</h1>
      <p className="text-center text-ink-muted text-sm mb-6 max-w-md mx-auto">
        Месяц или сопровождение на весь срок беременности — один платёж вместо девяти.
      </p>
      <p className="text-center text-xs text-ink-muted mb-12 max-w-xl mx-auto rounded-2xl bg-beige/50 px-4 py-3">
        «Женская консультация» — информационный цифровой сервис. Это не медицинское учреждение,
        не телемедицина и не замена очного приёма врача. Ответы даёт ИИ и носят общий характер.
      </p>

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
            <p className="mt-8 text-center text-sm text-ink-muted rounded-2xl bg-beige/50 px-4 py-3">
              Оплата пока не подключена. Кнопку оплаты покажем после договора с платёжным сервисом.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
