"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Baby, Heart, Shield, Sparkles } from "lucide-react";
import { BlurTitle } from "@/components/landing/BlurTitle";
import { FlowerDecor } from "@/components/landing/FlowerDecor";
import { ProfilePreviewCard } from "@/components/landing/ProfilePreviewCard";
import { getUserName, isUserLoggedIn } from "@/lib/user-storage";

const features = [
  {
    icon: Baby,
    title: "Беременность",
    text: "Неделя за неделей — развитие малыша, анализы, визиты к врачам по триместрам.",
  },
  {
    icon: Heart,
    title: "Здоровье",
    text: "Чеклисты профилактики, напоминания об обследованиях, день цикла и УЗИ.",
  },
  {
    icon: Sparkles,
    title: "ИИ и врачи",
    text: "Ответы на вопросы от ИИ. Платный тариф — консультация гинеколога.",
  },
];

export function LandingPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    setLoggedIn(isUserLoggedIn());
    setName(getUserName());
  }, []);

  return (
    <>
      <section className="hero-gradient relative min-h-[90vh] overflow-hidden">
        <div className="absolute left-4 bottom-20 hidden lg:block">
          <FlowerDecor className="w-24 h-32" />
        </div>
        <div className="absolute right-8 top-32 hidden lg:block rotate-12">
          <FlowerDecor className="w-20 h-28 opacity-30" />
        </div>

        <div className="mx-auto max-w-6xl px-6 pt-16 pb-12 lg:pt-20 lg:pb-14">
          <BlurTitle />

          <div className="relative z-10 mt-10 max-w-xl lg:mt-14">
            {loggedIn ? (
              <>
                <p className="text-lg text-ink-soft leading-relaxed text-balance lg:text-xl">
                  {name ? `Рады видеть вас снова, ${name}.` : "Рады видеть вас снова."}
                </p>
                <div className="mt-8 flex flex-wrap gap-4 lg:mt-10">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 rounded-full bg-ink px-8 py-4 text-sm font-medium text-cream transition hover:bg-ink/90"
                  >
                    Перейти в кабинет
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/dashboard/profile"
                    className="inline-flex items-center gap-2 rounded-full border border-beige-dark bg-white/50 px-8 py-4 text-sm font-medium text-ink backdrop-blur-sm transition hover:bg-white/80"
                  >
                    Мой профиль
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-lg text-ink-soft leading-relaxed text-balance lg:text-xl">
                  Ваш персональный гид для женщин репродуктивного возраста — беременность,
                  планирование и забота о здоровье каждый день.
                </p>
                <div className="mt-8 flex flex-wrap gap-4 lg:mt-10">
                  <Link
                    href="/onboarding"
                    className="inline-flex items-center gap-2 rounded-full bg-ink px-8 py-4 text-sm font-medium text-cream transition hover:bg-ink/90"
                  >
                    Выбрать свой статус
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-full border border-beige-dark bg-white/50 px-8 py-4 text-sm font-medium text-ink backdrop-blur-sm transition hover:bg-white/80"
                  >
                    Уже есть аккаунт
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="relative mx-auto max-w-6xl px-6 pb-20 lg:pb-28">
          <div className="absolute -inset-x-2 -inset-y-4 rounded-[2.5rem] bg-gradient-to-b from-rose-pale/40 via-blush/20 to-transparent blur-3xl" />
          <div className="relative">
            <ProfilePreviewCard />
          </div>
        </div>
      </section>

      <section className="py-24 bg-white/50">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center text-xs uppercase tracking-[0.25em] text-ink-muted mb-4">
            Возможности
          </p>
          <h2 className="text-center text-3xl md:text-4xl font-medium text-ink mb-16 text-balance">
            Всё, что было в боте — и больше
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-3xl border border-beige-dark/40 bg-cream/50 p-8 transition hover:border-rose/30 hover:shadow-[0_12px_40px_rgba(232,196,203,0.15)]"
              >
                <div className="mb-6 inline-flex rounded-2xl bg-rose-pale p-3 text-rose-muted">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-medium text-ink mb-3">{f.title}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 hero-gradient">
        <div className="mx-auto max-w-6xl px-6">
          <div className="glass-card rounded-[2rem] p-8 md:p-12 flex flex-col md:flex-row md:items-center gap-8">
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.25em] text-ink-muted mb-3">
                Тест · 2 минуты
              </p>
              <h2 className="text-2xl md:text-3xl font-medium text-ink mb-4 text-balance">
                Какой метод контрацепции подходит именно тебе?
              </h2>
              <p className="text-sm text-ink-soft leading-relaxed max-w-xl">
                Подберём метод контрацепции за 2 минуты — 8 вопросов, основной и
                альтернативный вариант с учётом вашей ситуации.
              </p>
            </div>
            <Link
              href="/contraception-test"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-ink px-8 py-4 text-sm font-medium text-cream transition hover:bg-ink/90"
            >
              <Shield className="w-4 h-4" />
              Пройти тест
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 hero-gradient">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Неделя беременности", desc: "Узнай на каком этапе развития малыш сегодня" },
              { title: "Чеклисты анализов", desc: "Узнай какие анализы нужно тебе проходить по возрасту" },
              { title: "Запись к врачу", desc: "Госполиклиника или партнёрская клиника" },
              { title: "День цикла", desc: "Узнай свой день цикла и рекомендации" },
              { title: "Полная оценка здоровья", desc: "Попробуйте бесплатно прямо сейчас" },
              {
                title: "Тест: контрацепция",
                desc: "Подберём метод за 2 минуты",
                href: "/contraception-test",
              },
              { title: "Вопрос гинекологу", desc: "Получи ответ на любой свой вопрос от профессионала" },
            ].map((item) =>
              "href" in item && item.href ? (
                <Link
                  key={item.title}
                  href={item.href}
                  className="glass-card rounded-2xl p-6 hover:bg-white/80 transition block"
                >
                  <h3 className="text-sm font-medium text-ink mb-2">{item.title}</h3>
                  <p className="text-xs text-ink-muted leading-relaxed">{item.desc}</p>
                </Link>
              ) : (
                <div
                  key={item.title}
                  className="glass-card rounded-2xl p-6 hover:bg-white/80 transition"
                >
                  <h3 className="text-sm font-medium text-ink mb-2">{item.title}</h3>
                  <p className="text-xs text-ink-muted leading-relaxed">{item.desc}</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <section className="py-32 text-center">
        <div className="mx-auto max-w-2xl px-6">
          {loggedIn ? (
            <>
              <h2 className="text-3xl md:text-5xl font-medium text-ink mb-6 text-balance">
                {name ? `${name}, ваш кабинет готов` : "Ваш кабинет готов"}
              </h2>
              <p className="text-ink-soft mb-10">
                Продолжайте следить за здоровьем — все данные сохранены.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-10 py-4 text-sm font-medium text-cream transition hover:bg-ink/90"
              >
                Открыть кабинет
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-3xl md:text-5xl font-medium text-ink mb-6 text-balance">
                Начните с выбора статуса
              </h2>
              <p className="text-ink-soft mb-10">
                Беременна, планирую или просто слежу за здоровьем — мы подстроимся под вас.
              </p>
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-10 py-4 text-sm font-medium text-cream transition hover:bg-ink/90"
              >
                Начать бесплатно
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </section>
    </>
  );
}
