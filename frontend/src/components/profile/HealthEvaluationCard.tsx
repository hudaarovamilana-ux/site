"use client";

import type { HealthEvaluation } from "@/lib/health-evaluation";
import { HIPPOCRATES_QUOTE } from "@/lib/health-evaluation";

export function HealthEvaluationCard({ evaluation }: { evaluation: HealthEvaluation }) {
  return (
    <div className="rounded-2xl border border-beige-dark/50 bg-rose-pale/20 p-5 space-y-4">
      <h3 className="text-sm font-medium text-ink">Ваша оценка здоровья</h3>

      {evaluation.messages.map((msg) => (
        <p
          key={msg}
          className={`text-sm leading-relaxed ${
            evaluation.allExcellent ? "text-emerald-800 font-medium" : "text-ink"
          }`}
        >
          {msg}
        </p>
      ))}

      {evaluation.recommendations.length > 0 && (
        <ul className="space-y-2">
          {evaluation.recommendations.map((rec) => (
            <li key={rec} className="text-sm text-ink-soft capitalize leading-relaxed">
              • {rec.charAt(0).toUpperCase() + rec.slice(1)}
            </li>
          ))}
        </ul>
      )}

      <blockquote className="pt-3 border-t border-beige-dark/30 text-xs text-ink-muted italic text-center leading-relaxed">
        «{HIPPOCRATES_QUOTE}»
        <footer className="mt-1 not-italic">— Гиппократ</footer>
      </blockquote>
    </div>
  );
}
