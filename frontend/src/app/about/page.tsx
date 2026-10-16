import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "О проекте — Женская консультация",
  description:
    "Цифровой информационный сервис для женщин: недели беременности, чеклисты, напоминания и ответы ИИ. Не клиника и не замена очного врача.",
};

const built = [
  "Маршрут с первого экрана: беременность, планирование или забота о здоровье.",
  "Неделя беременности, чеклисты обследований, напоминания и учёт шевелений.",
  "Оценка здоровья и вопросы к информационной системе. Ответ — ориентир, не назначение.",
  "Короткий тест по контрацепции: основной и запасной вариант с учётом ситуации.",
  "Статьи, частые вопросы, публичная оферта, политика и реквизиты самозанятого.",
];

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16 md:py-20">
      <p className="text-xs uppercase tracking-[0.22em] text-ink-muted mb-4">О проекте</p>
      <h1 className="text-3xl md:text-5xl font-medium text-ink leading-tight text-balance mb-6">
        Вопрос появляется сегодня. Приём — не всегда.
      </h1>
      <p className="text-lg text-ink-soft leading-relaxed mb-6">
        «Женская консультация» занимает эту паузу. Женщина открывает кабинет, видит свою
        неделю, свой чеклист и ясный следующий шаг. Сервис не ставит диагноз и не назначает
        лечение. Он перестаёт оставлять человека один на один с поисковой строкой до визита
        к врачу.
      </p>

      <h2 className="mt-14 text-2xl font-medium text-ink mb-4">Где теряется решение</h2>
      <p className="text-ink-soft leading-relaxed mb-4">
        Женское здоровье не ждёт расписания регистратуры. Беременность, планирование,
        цикл, анализ, тревога поздно вечером. Врач в этой цепочке незаменим. До кабинета
        человек всё равно остаётся с обрывками советов: форум, лента, чужой опыт, который
        звучит уверенно и ни за что не отвечает.
      </p>
      <p className="text-ink-soft leading-relaxed">
        Цена такого пробела конкретная. Пропущенный срок анализа. Неделя, прожитая в
        неопределённости. Решение, принятое из страха, а не из порядка. Клиника не
        масштабируется на каждый такой момент. Лента масштабируется, но не держит
        ответственность за полноту. Между ними и стоит этот сервис.
      </p>

      <h2 className="mt-14 text-2xl font-medium text-ink mb-4">Что уже можно пройти руками</h2>
      <ul className="space-y-3">
        {built.map((item) => (
          <li
            key={item}
            className="rounded-2xl border border-beige-dark/40 bg-white/60 px-5 py-4 text-sm text-ink-soft leading-relaxed"
          >
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-ink-muted leading-relaxed">
        Путь пользователя начинается с главной. Отдельного доступа для проверки не нужно:
        описание, цены и документы открыты.
      </p>

      <h2 className="mt-14 text-2xl font-medium text-ink mb-4">На чём держится содержание</h2>
      <p className="text-ink-soft leading-relaxed mb-4">
        Сроки обследований, наблюдение беременности и профилактика в сервисе собраны по
        клиническим рекомендациям Минздрава РФ. Женщина видит не обрывок из ленты, а
        понятный порядок: какая сейчас неделя, какие обследования относятся к этому
        сроку и о чём стоит говорить на приёме.
      </p>
      <p className="text-ink-soft leading-relaxed">
        Врач по-прежнему нужен для осмотра, диагноза и лечения. Сервис занимает время до
        этого визита. Он помогает прийти подготовленной: с ясной картиной своего срока и
        списком вопросов, а не с тревогой из случайных советов.
      </p>

      <div className="mt-14 flex flex-col sm:flex-row gap-3">
        <Link
          href="/onboarding"
          className="rounded-full bg-ink px-6 py-3 text-center text-sm font-medium text-cream hover:bg-ink/90"
        >
          Выбрать статус
        </Link>
        <Link
          href="/pricing"
          className="rounded-full border border-beige-dark px-6 py-3 text-center text-sm font-medium text-ink hover:bg-beige/40"
        >
          Смотреть тарифы
        </Link>
      </div>
    </article>
  );
}
