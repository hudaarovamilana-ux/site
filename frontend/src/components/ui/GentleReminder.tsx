"use client";

import { useEffect, useState } from "react";
import { GENTLE_REMINDERS } from "@/lib/reminders";

export function GentleReminder({ className = "" }: { className?: string }) {
  const [text, setText] = useState(GENTLE_REMINDERS[0]);

  useEffect(() => {
    setText(GENTLE_REMINDERS[Math.floor(Math.random() * GENTLE_REMINDERS.length)]);
  }, []);

  return (
    <div
      className={`rounded-2xl border border-rose/20 bg-rose-pale/50 px-5 py-4 ${className}`}
    >
      <p className="text-sm text-ink-soft leading-relaxed italic">🤍 {text}</p>
    </div>
  );
}
