"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordField } from "@/components/auth/PasswordField";
import { postJson } from "@/lib/api-client";
import { isValidEmail } from "@/lib/email-validation";

const inputClass =
  "w-full rounded-xl border border-beige-dark bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose/40";

type Step = "email" | "reset";

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***@${domain}`;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const sendCode = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Введите email");
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setError("Email только латиницей, например name@mail.ru");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await postJson<{ message: string }>(
        "/api/auth/forgot-password/send-code",
        { email: trimmedEmail }
      );
      setStep("reset");
      setCode("");
      setPassword("");
      setConfirmPassword("");
      setSuccess(data.message);
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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendCode();
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!/^\d{6}$/.test(code.trim())) {
      setError("Введите 6-значный код из письма");
      return;
    }
    if (password.length < 6) {
      setError("Пароль должен быть не менее 6 символов");
      return;
    }
    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    setLoading(true);
    try {
      await postJson("/api/auth/forgot-password/reset", {
        email: email.trim(),
        code: code.trim(),
        password,
      });
      router.push("/login?reset=1");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сменить пароль");
    } finally {
      setLoading(false);
    }
  };

  if (step === "reset") {
    return (
      <AuthShell
        title="Новый пароль"
        subtitle={
          <>
            Код отправлен на <span className="text-ink">{maskEmail(email)}</span>
          </>
        }
      >
        <form onSubmit={handleResetSubmit} noValidate className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Код из письма</label>
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

          <PasswordField
            id="new-password"
            label="Новый пароль"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            placeholder="Не менее 6 символов"
          />

          <PasswordField
            id="confirm-password"
            label="Повторите пароль"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            placeholder="Ещё раз новый пароль"
          />

          {success && (
            <p className="text-sm text-ink-muted bg-beige/60 rounded-xl px-4 py-3">{success}</p>
          )}

          {error && (
            <p className="text-sm text-rose-muted bg-rose-pale/50 rounded-xl px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full rounded-full bg-ink py-4 text-sm font-medium text-cream hover:bg-ink/90 disabled:opacity-50 transition"
          >
            {loading ? "Сохраняем..." : "Сохранить новый пароль"}
          </button>

          <div className="flex flex-col items-center gap-2 text-sm text-ink-muted">
            <button
              type="button"
              disabled={loading || resendCooldown > 0}
              onClick={sendCode}
              className="underline disabled:opacity-50 disabled:no-underline"
            >
              {resendCooldown > 0
                ? `Отправить код снова (${resendCooldown} с)`
                : "Отправить код снова"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
                setPassword("");
                setConfirmPassword("");
                setError("");
                setSuccess("");
              }}
              className="underline"
            >
              Изменить email
            </button>
            <Link href="/login" className="underline">
              Вернуться ко входу
            </Link>
          </div>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Забыли пароль?"
      subtitle={
        <>
          Введите email — мы отправим код для сброса пароля.{" "}
          <Link href="/login" className="text-ink underline hover:text-ink/80">
            Вернуться ко входу
          </Link>
        </>
      }
    >
      <form onSubmit={handleEmailSubmit} noValidate className="space-y-5">
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

        {error && (
          <p className="text-sm text-rose-muted bg-rose-pale/50 rounded-xl px-4 py-3">{error}</p>
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
