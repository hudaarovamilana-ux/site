"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordField } from "@/components/auth/PasswordField";
import { postJson } from "@/lib/api-client";
import { destroySession } from "@/lib/auth-client";
import { isValidEmail } from "@/lib/email-validation";
import { applyServerProfile, type ServerProfile } from "@/lib/profile-sync";
import {
  clearHealthProfile,
  clearPersonalData,
  saveUserName,
  setUserLoggedIn,
} from "@/lib/user-storage";

const inputClass =
  "w-full rounded-xl border border-beige-dark bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose/40";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const resetSuccess = searchParams.get("reset") === "1";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Введите email");
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setError("Email только латиницей, например name@mail.ru");
      return;
    }
    if (!password) {
      setError("Введите пароль");
      return;
    }
    if (password.length < 6) {
      setError("Неверный email или пароль");
      return;
    }

    setLoading(true);
    try {
      // Важно: сбрасываем СТАРУЮ cookie-сессию до проверки нового пароля.
      // Иначе при ошибке входа старый аккаунт остаётся открытым.
      await destroySession({ wipeProfile: true });

      const data = await postJson<{
        user: { email: string; name: string };
        profile?: ServerProfile | null;
      }>("/api/auth/login", {
        email: trimmedEmail,
        password,
      });

      clearPersonalData();
      clearHealthProfile();
      localStorage.removeItem("zk_checklist_progress");

      if (data.profile) {
        applyServerProfile({
          ...data.profile,
          name: data.profile.name || data.user.name,
          email: data.profile.email || data.user.email,
        });
      } else {
        saveUserName(data.user.name);
        setUserLoggedIn(data.user.email);
      }

      const next = searchParams.get("next");
      const target =
        next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
      router.replace(target);
      router.refresh();
    } catch (err) {
      await destroySession({ wipeProfile: true });
      setError(err instanceof Error ? err.message : "Неверный email или пароль");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Вход"
      subtitle={
        <>
          Нет аккаунта?{" "}
          <Link href="/register" className="text-ink underline hover:text-ink/80">
            Зарегистрироваться
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-ink mb-2">Email</label>
          <input
            type="email"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            autoComplete="email"
            placeholder="name@mail.ru"
          />
        </div>
        <PasswordField
          id="password"
          label="Пароль"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />
        <div className="text-right -mt-2">
          <Link
            href="/forgot-password"
            className="text-sm text-ink-muted underline hover:text-ink"
          >
            Забыли пароль?
          </Link>
        </div>

        {resetSuccess && (
          <p className="text-sm text-ink-muted bg-beige/60 rounded-xl px-4 py-3">
            Пароль успешно изменён. Войдите с новым паролем.
          </p>
        )}

        {error && (
          <p className="text-sm text-rose-muted bg-rose-pale/50 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-ink py-4 text-sm font-medium text-cream hover:bg-ink/90 disabled:opacity-50 transition"
        >
          {loading ? "Входим..." : "Войти"}
        </button>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthShell title="Вход" subtitle="Загрузка…">
          <div className="h-40 animate-pulse rounded-xl bg-beige/60" />
        </AuthShell>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
