import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const columns = [
  {
    title: "Сервис",
    links: [
      { href: "/onboarding", label: "Выбрать статус" },
      { href: "/dashboard", label: "Личный кабинет" },
      { href: "/articles", label: "Статьи" },
      { href: "/faq", label: "Частые вопросы" },
    ],
  },
  {
    title: "Беременность",
    links: [
      { href: "/dashboard/pregnancy", label: "Моя неделя" },
      { href: "/dashboard/checklist", label: "Анализы и врачи" },
      { href: "/dashboard/kicks", label: "Шевеления плода" },
    ],
  },
  {
    title: "Здоровье",
    links: [
      { href: "/dashboard/profile", label: "Профиль" },
      { href: "/dashboard/health-assessment", label: "Оценка здоровья" },
      { href: "/dashboard/ask", label: "Спросить врача" },
      { href: "/pricing", label: "Тарифы" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-beige-dark/50 bg-beige/30 mt-auto">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 text-ink/70 mb-4">
              <Logo className="w-6 h-8" />
              <span className="text-sm font-medium">Женская консультация</span>
            </div>
            <p className="text-sm text-ink-muted leading-relaxed">
              Персональный гид по женскому здоровью — напоминания, чеклисты и ответы на
              вопросы в одном месте.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs uppercase tracking-[0.15em] text-ink-muted mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-soft hover:text-ink transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-beige-dark/40 flex flex-col sm:flex-row justify-between gap-4 text-xs text-ink-muted">
          <span>© {new Date().getFullYear()} Женская консультация</span>
          <span>Информация не заменяет очный приём врача</span>
        </div>
      </div>
    </footer>
  );
}
