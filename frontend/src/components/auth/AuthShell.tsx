import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="hero-gradient min-h-[calc(100vh-12rem)]">
      <div className="mx-auto max-w-md px-6 py-16 md:py-20">
        <div className="glass-card rounded-[2rem] p-8 md:p-10">
          <h1 className="text-3xl font-medium text-ink mb-2">{title}</h1>
          {subtitle && <div className="text-ink-muted text-sm mb-8">{subtitle}</div>}
          {children}
        </div>
      </div>
    </div>
  );
}
