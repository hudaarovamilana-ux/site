"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { fetchAndHydrateProfile } from "@/lib/profile-sync";
import { AUTH_CHANGE_EVENT, getUserName, isUserLoggedIn } from "@/lib/user-storage";

const nav = [
  { href: "/", label: "Главная" },
  { href: "/articles", label: "Статьи" },
  { href: "/faq", label: "Вопросы" },
  { href: "/pricing", label: "Тарифы" },
];

export function Header() {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const [loggedIn, setLoggedIn] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    const onAuthChange = () => {
      setLoggedIn(isUserLoggedIn());
      setName(getUserName());
    };

    const sync = async () => {
      onAuthChange();
      await fetchAndHydrateProfile();
      onAuthChange();
    };

    void sync();
    window.addEventListener(AUTH_CHANGE_EVENT, onAuthChange);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, onAuthChange);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isLanding ? "bg-cream/70 backdrop-blur-md border-b border-beige-dark/30" : "glass border-b border-beige-dark/40"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href={loggedIn ? "/dashboard" : "/"} className="flex items-center gap-3 group">
          <span className="text-ink/80 group-hover:text-ink transition-colors">
            <Logo className="w-7 h-9" />
          </span>
          <span className="hidden sm:block text-sm font-medium tracking-wide text-ink-soft">
            Женская консультация
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-xs uppercase tracking-[0.15em] transition-colors ${
                pathname === item.href
                  ? "text-ink font-medium"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {loggedIn ? (
            <>
              {name && (
                <span className="hidden sm:inline text-xs text-ink-muted">{name}</span>
              )}
              <Link
                href="/dashboard"
                className="rounded-full bg-ink px-5 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-cream transition hover:bg-ink/90"
              >
                Кабинет
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline text-xs uppercase tracking-[0.12em] text-ink-muted hover:text-ink transition-colors"
              >
                Войти
              </Link>
              <Link
                href="/onboarding"
                className="rounded-full bg-ink px-5 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-cream transition hover:bg-ink/90"
              >
                Начать
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
