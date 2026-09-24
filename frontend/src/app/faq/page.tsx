"use client";

import { useState } from "react";
import { FAQ_ITEMS } from "@/lib/faq";
import { GentleReminder } from "@/components/ui/GentleReminder";

export default function FaqPage() {
  const [open, setOpen] = useState<string | null>(null);
  const categories = [...new Set(FAQ_ITEMS.map((f) => f.category))];

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-medium text-ink mb-2">Частые вопросы</h1>
      <p className="text-ink-muted text-sm mb-10">
        Ответы на основе клинических рекомендаций Минздрава РФ
      </p>

      {categories.map((cat) => (
        <div key={cat} className="mb-8">
          <h2 className="text-xs uppercase tracking-[0.15em] text-ink-muted mb-4">{cat}</h2>
          <div className="space-y-2">
            {FAQ_ITEMS.filter((f) => f.category === cat).map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-beige-dark/40 bg-white/60 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpen(open === item.id ? null : item.id)}
                  className="w-full text-left px-5 py-4 text-sm font-medium text-ink hover:bg-white/80 transition"
                >
                  {item.question}
                </button>
                {open === item.id && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-ink-soft leading-relaxed">{item.answer}</p>
                    <GentleReminder className="mt-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
