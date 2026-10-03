export type PricingPlan = {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  highlighted: boolean;
  badge?: string;
  compareAt?: string;
  perMonthHint?: string;
};

/** Месяц: 299 ₽. Полный срок 9×299 = 2 691 ₽ → пакет 1 990 ₽ (~2 месяца в подарок). */
export const PRICE_MONTHLY = 299;
export const PRICE_PREGNANCY = 1990;
export const PRICE_PREGNANCY_FULL = PRICE_MONTHLY * 9;

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "premium_month",
    name: "Премиум",
    price: "299 ₽",
    period: "в месяц",
    features: [
      "Неделя, ПДР, чеклисты и напоминания",
      "Расширенные вопросы к ИИ в кабинете",
      "Оценка здоровья по профилю",
      "Приоритетная поддержка сервиса",
      "Доступ ко всем материалам сайта",
    ],
    cta: "Оплата скоро",
    highlighted: false,
  },
  {
    id: "premium_pregnancy",
    name: "На всю беременность",
    price: "1 990 ₽",
    period: "на 9 месяцев",
    badge: "2 месяца в подарок",
    compareAt: "2 691 ₽",
    perMonthHint: "≈ 221 ₽ в месяц",
    features: [
      "Всё из месячного Премиума",
      "Один платёж вместо девяти",
      "Информационное сопровождение на срок до 270 дней",
      "Расширенные вопросы к ИИ",
      "Чеклисты и материалы по неделям",
    ],
    cta: "Оплата скоро",
    highlighted: true,
  },
];
