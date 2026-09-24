"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordField } from "@/components/auth/PasswordField";
import { postJson } from "@/lib/api-client";
import { isValidEmail } from "@/lib/email-validation";
import { pushLocalProfileToServer } from "@/lib/profile-sync";
import { registerNewUser } from "@/lib/user-storage";

const inputClass =
  "w-full rounded-xl border border-beige-dark bg-white px-4 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-rose/40";

type Step = "form" | "verify";

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***@${domain}`;
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const validateForm = (): string | null => {
    if (!name.trim()) return "Введите имя";
    if (!email.trim()) return "Введите email";
    if (!isValidEmail(email)) return "Email только латиницей, например name@mail.ru";
    if (password.length < 6) return "Пароль должен быть не менее 6 символов";
    return null;
  };

  const sendCode = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await postJson("/api/auth/send-code", { email: email.trim(), name: name.trim() });
      setStep("verify");
      setCode("");
      setResendCooldown(60);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Не удалось отправить код";
      setError(message);
      const retry = (err as Error & { retryAfterSec?: number }).retryAfterSec;
      if (retry) setResendCooldown(retry);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendCode();
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(code.trim())) {
      setError("Введите 6-значный код из письма");
      return;
    }

    setLoading(true);
    try {
      const data = await postJson<{ verified: boolean; name: string; email: string }>(
        "/api/auth/verify-code",
        { email: email.trim(), code: code.trim(), password }
      );
      registerNewUser(data.name || name.trim(), data.email || email.trim());
      // Сохраняем на сервер анкету/имя, если уже заполняли на этом устройстве
      await pushLocalProfileToServer();
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неверный код");
    } finally {
      setLoading(false);
    }
  };

  if (step === "verify") {
    return (
      <AuthShell
        title="Подтвердите email"
        subtitle={
          <>
            Код отправлен на <span className="text-ink">{maskEmail(email)}</span>
          </>
        }
      >
        <form onSubmit={handleVerifySubmit} noValidate className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              Код из письма
            </label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className={`${inputClass} text-center text-2xl tracking-[0.4em] font-medium`}
              placeholder="000000"
            />
            <p className="text-xs text-ink-muted mt-2">Код действует 10 минут</p>
          </div>

          {error && (
            <p className="text-sm text-rose-muted bg-rose-pale/50 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full rounded-full bg-ink py-4 text-sm font-medium text-cream hover:bg-ink/90 disabled:opacity-50 transition"
          >
            {loading ? "Проверяем..." : "Подтвердить и создать аккаунт"}
          </button>

          <div className="flex flex-col items-center gap-2 text-sm text-ink-muted">
            <button
              type="button"
              disabled={loading || resendCooldown > 0}
              onClick={sendCode}
              className="underline disabled:opacity-50 disabled:no-underline"
            >
              {resendCooldown > 0
                ? `Отправить снова (${resendCooldown} с)`
                : "Отправить код снова"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("form");
                setCode("");
                setError("");
              }}
              className="underline"
            >
              Изменить email
            </button>
          </div>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Регистрация"
      subtitle={
        <>
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-ink underline hover:text-ink/80">
            Войти
          </Link>
        </>
      }
    >
      <form onSubmit={handleFormSubmit} noValidate className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-ink mb-2">Имя</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="Как к вам обращаться"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            autoComplete="email"
            placeholder="you@example.com"
          />
          <p className="text-xs text-ink-muted mt-1.5">
            На этот адрес придёт код подтверждения
          </p>
        </div>
        <PasswordField
          label="Пароль"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          placeholder="Не менее 6 символов"
        />

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
          {loading ? "Отправляем код..." : "Получить код на почту"}
        </button>
      </form>
    </AuthShell>
  );
}
