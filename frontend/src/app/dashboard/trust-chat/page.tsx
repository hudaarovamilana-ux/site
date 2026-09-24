"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AI_LIMITS } from "@/lib/ai-limits";
import { postJson } from "@/lib/api-client";

const WELCOME =
  "Здесь вы можете анонимно поделиться тем, что вас беспокоит. Мы рядом и готовы выслушать.";

export default function TrustChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "support"; text: string }[]>([
    { role: "support", text: WELCOME },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/ai-usage")
      .then((r) => r.json())
      .then((data) => setRemaining(data.trust?.remaining ?? null))
      .catch(() => setRemaining(null));
  }, []);

  const limitReached = remaining === 0;

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading || limitReached) return;

    const text = message.trim();
    setMessage("");
    setError(null);
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", text }]);

    const history = messages
      .filter((m) => m.role === "user" || m.role === "support")
      .map((m) => ({
        role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
        text: m.text,
      }))
      .filter((m) => m.text !== WELCOME);

    try {
      const data = await postJson<{ reply: string; remaining: number }>("/api/trust-chat", {
        message: text,
        history,
      });
      setMessages((prev) => [...prev, { role: "support", text: data.reply }]);
      setRemaining(data.remaining);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Не удалось отправить сообщение";
      setError(msg);
      if (msg.includes("лимит")) setRemaining(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl flex flex-col h-[calc(100vh-12rem)]">
      <h1 className="text-2xl font-medium text-ink mb-2">Чат доверия</h1>
      <p className="text-sm text-ink-muted mb-2">
        Анонимно и конфиденциально. Не заменяет помощь специалиста в острых ситуациях.
      </p>
      {remaining !== null && (
        <p className="text-xs text-ink-muted mb-6">
          Бесплатно: {remaining} из {AI_LIMITS.trustChat} сообщений
        </p>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 rounded-2xl border border-beige-dark/40 bg-white/50 p-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              m.role === "user"
                ? "ml-auto bg-ink text-cream"
                : "bg-rose-pale/60 text-ink-soft"
            }`}
          >
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm bg-rose-pale/60 text-ink-muted">
            Печатает...
          </div>
        )}
      </div>

      {error && <p className="text-sm text-rose-700 mb-2">{error}</p>}

      {limitReached ? (
        <p className="text-sm text-ink-soft">
          Лимит сообщений исчерпан.{" "}
          <Link href="/pricing" className="underline font-medium text-ink">
            Подключите премиум
          </Link>
        </p>
      ) : (
        <form onSubmit={send} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Напишите сообщение..."
            disabled={loading}
            className="flex-1 rounded-full border border-beige-dark bg-white px-4 py-3 text-sm disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream hover:bg-ink/90 transition shrink-0 disabled:opacity-50"
          >
            Отправить
          </button>
        </form>
      )}
    </div>
  );
}
