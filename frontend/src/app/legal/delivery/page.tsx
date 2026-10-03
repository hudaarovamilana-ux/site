import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/legal/LegalShell";
import { LEGAL_DOCS_UPDATED_LABEL } from "@/lib/legal-docs";

export const metadata: Metadata = {
  title: "Порядок оказания услуг — Женская консультация",
};

export default function DeliveryPage() {
  return (
    <LegalShell title="Порядок оказания услуг" updated={LEGAL_DOCS_UPDATED_LABEL}>
      <p>
        Сервис «Женская консультация» — полностью цифровой. Физической доставки товаров нет.
      </p>

      <h2>Как получить доступ</h2>
      <ol>
        <li>Создайте аккаунт на сайте (бесплатная регистрация).</li>
        <li>
          Выберите тариф на странице{" "}
          <Link href="/pricing" className="underline text-ink">
            Тарифы
          </Link>
          .
        </li>
        <li>Оплатите картой или другим способом на защищённой платёжной форме.</li>
        <li>После подтверждения оплаты доступ открывается в личном кабинете автоматически.</li>
      </ol>

      <h2>Сроки</h2>
      <ul>
        <li>Обычный срок открытия доступа — несколько минут после успешной оплаты.</li>
        <li>Премиум на месяц: 30 дней с момента оплаты.</li>
        <li>Пакет на беременность: 270 дней с момента оплаты.</li>
      </ul>

      <h2>Если доступ не открылся</h2>
      <p>
        Напишите на email из раздела{" "}
        <Link href="/legal/requisites" className="underline text-ink">
          Реквизиты
        </Link>
        , укажите email аккаунта и время оплаты. Мы проверим платёж и откроем доступ вручную.
      </p>

      <h2>Возврат</h2>
      <p>
        Условия возврата описаны в{" "}
        <Link href="/legal/offer" className="underline text-ink">
          Публичной оферте
        </Link>
        .
      </p>
    </LegalShell>
  );
}
