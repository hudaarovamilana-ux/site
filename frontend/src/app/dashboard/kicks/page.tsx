"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getUserStatus } from "@/lib/user-storage";

export default function KicksPage() {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    setAllowed(getUserStatus() === "pregnant");
  }, []);

  if (allowed === null) return null;

  if (!allowed) {
    return (
      <div className="max-w-md">
        <h1 className="text-2xl font-medium text-ink mb-4">Шевеления плода</h1>
        <p className="text-sm text-ink-soft mb-4">
          Подсчёт шевелений доступен при статусе «Беременна».
        </p>
        <Link href="/dashboard" className="text-sm underline text-ink">
          Вернуться в кабинет
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center max-w-md mx-auto">
      <h1 className="text-2xl font-medium text-ink mb-2">Шевеления плода</h1>
      <p className="text-sm text-ink-muted mb-10">
        Отмечайте каждое шевеление. Цель — 10 за 2 часа с 28 недели.
      </p>

      <div className="glass-card rounded-full w-48 h-48 mx-auto flex flex-col items-center justify-center mb-8">
        <span className="text-5xl font-light text-ink">{count}</span>
        <span className="text-xs text-ink-muted mt-1">сегодня</span>
      </div>

      <button
        type="button"
        onClick={() => setCount((c) => c + 1)}
        className="rounded-full bg-ink px-12 py-5 text-sm font-medium text-cream hover:bg-ink/90 transition mb-4"
      >
        + Шевеление
      </button>

      {count >= 10 && (
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-xl px-4 py-3">
          Отлично! 10 шевелений зафиксировано 🤍
        </p>
      )}
    </div>
  );
}
