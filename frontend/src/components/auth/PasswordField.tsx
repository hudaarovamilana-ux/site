"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-beige-dark bg-white px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-rose/40";

export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  placeholder,
  hint,
}: {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: "current-password" | "new-password";
  placeholder?: string;
  hint?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
          autoComplete={autoComplete}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {hint && <p className="text-xs text-ink-muted mt-1.5">{hint}</p>}
    </div>
  );
}
