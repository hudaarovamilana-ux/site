import { PricingCards } from "@/components/pricing/PricingCards";

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

      <PricingCards />
    </div>
  );
}
