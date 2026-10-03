import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/legal/LegalShell";
import { getLegalOperator, hasLegalOperator } from "@/lib/legal-operator";

export const metadata: Metadata = {
  title: "Реквизиты — Женская консультация",
};

export const dynamic = "force-dynamic";

export default function RequisitesPage() {
  const op = getLegalOperator();
  const ready = hasLegalOperator(op);

  return (
    <LegalShell title="Реквизиты" updated="3 октября 2026 г.">
      <p>Контакты и реквизиты сервиса «Женская консультация».</p>

      {ready ? (
        <div className="rounded-2xl border border-beige-dark/50 bg-white/70 px-5 py-5 space-y-3 text-ink">
          <p>
            <span className="text-ink-muted">Исполнитель: </span>
            {op.fullName}
          </p>
          <p>
            <span className="text-ink-muted">ИНН: </span>
            {op.inn}
          </p>
          <p>
            <span className="text-ink-muted">Email: </span>
            <a href={`mailto:${op.email}`} className="underline">
              {op.email}
            </a>
          </p>
          {op.phone && (
            <p>
              <span className="text-ink-muted">Телефон: </span>
              <a href={`tel:${op.phone.replace(/\s/g, "")}`} className="underline">
                {op.phone}
              </a>
            </p>
          )}
          <p>
            <span className="text-ink-muted">Сайт: </span>
            <a href={op.siteUrl} className="underline">
              {op.siteUrl}
            </a>
          </p>
        </div>
      ) : (
        <p className="rounded-2xl border border-beige-dark/50 bg-beige/40 px-5 py-4">
          Реквизиты скоро будут опубликованы на этой странице.
        </p>
      )}

      <h2>Документы</h2>
      <ul>
        <li>
          <Link href="/legal/offer" className="underline text-ink">
            Публичная оферта
          </Link>
        </li>
        <li>
          <Link href="/legal/privacy" className="underline text-ink">
            Политика конфиденциальности
          </Link>
        </li>
        <li>
          <Link href="/legal/delivery" className="underline text-ink">
            Порядок оказания услуг
          </Link>
        </li>
        <li>
          <Link href="/pricing" className="underline text-ink">
            Тарифы и цены
          </Link>
        </li>
      </ul>
    </LegalShell>
  );
}
