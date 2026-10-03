import type { ReactNode } from "react";

export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs uppercase tracking-wider text-ink-muted mb-2">Документы</p>
      <h1 className="text-3xl font-medium text-ink mb-2">{title}</h1>
      <p className="text-sm text-ink-muted mb-10">Дата публикации: {updated}</p>
      <div className="space-y-6 text-sm text-ink-soft leading-relaxed [&_h2]:text-base [&_h2]:font-medium [&_h2]:text-ink [&_h2]:mt-8 [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1">
        {children}
      </div>
    </div>
  );
}
