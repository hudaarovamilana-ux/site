"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type PaymentStatus = {
  payment: { id: string; status: string; planId: string; receiptSent?: boolean };
  premium: { active: boolean; until: string | null };
};

function SuccessInner() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const [data, setData] = useState<PaymentStatus | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!paymentId) {
      setError("Не найден номер платежа");
      setLoading(false);
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const load = async () => {
      try {
        const res = await fetch(`/api/payments/${paymentId}`, {
          credentials: "include",
          cache: "no-store",
        });
        const json = (await res.json()) as PaymentStatus & { error?: string };
        if (!res.ok) {
          throw new Error(json.error || "Не удалось проверить оплату");
        }
        if (cancelled) return;
        setData(json);
        setLoading(false);

        if (json.payment.status !== "succeeded" && attempts < 8) {
          attempts += 1;
          setTimeout(load, 2000);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Ошибка проверки оплаты");
        setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [paymentId]);

  const succeeded = data?.payment.status === "succeeded" || data?.premium.active;
  const untilLabel = data?.premium.until
    ? new Date(data.premium.until).toLocaleDateString("ru-RU")
    : null;

  return (
    <div className="mx-auto max-w-lg px-6 py-20 text-center">
      <h1 className="text-3xl font-medium text-ink mb-4">
        {succeeded ? "Оплата прошла" : loading ? "Проверяем оплату..." : "Статус оплаты"}
      </h1>

      {error && (
        <p className="text-sm text-rose-muted bg-rose-pale/50 rounded-2xl px-4 py-3 mb-6">
          {error}
        </p>
      )}

      {!error && succeeded && (
        <p className="text-ink-soft mb-8">
          Доступ открыт{untilLabel ? ` до ${untilLabel}` : ""}. Можно переходить в кабинет.
          {data?.payment.receiptSent
            ? " Чек отправлен на email аккаунта."
            : " Чек придёт на email аккаунта в течение нескольких минут."}
        </p>
      )}

      {!error && !succeeded && !loading && (
        <p className="text-ink-soft mb-8">
          Платёж ещё обрабатывается. Обычно это занимает минуту. Обновите страницу чуть позже
          или напишите на email из реквизитов.
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/dashboard"
          className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream hover:bg-ink/90"
        >
          В кабинет
        </Link>
        <Link
          href="/pricing"
          className="rounded-full border border-beige-dark px-6 py-3 text-sm font-medium text-ink hover:bg-beige/40"
        >
          К тарифам
        </Link>
      </div>
    </div>
  );
}

export default function PricingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg px-6 py-20 text-center text-ink-muted">
          Загрузка...
        </div>
      }
    >
      <SuccessInner />
    </Suspense>
  );
}
