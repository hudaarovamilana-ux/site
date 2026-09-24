"use client";

import { LogOut } from "lucide-react";
import { logoutUser } from "@/lib/user-storage";

interface LogoutButtonProps {
  className?: string;
  showIcon?: boolean;
}

export function LogoutButton({ className = "", showIcon = true }: LogoutButtonProps) {
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      /* ignore network errors — local logout still clears UI */
    }
    logoutUser();
    window.location.href = "/";
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={
        className ||
        "inline-flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-ink-muted hover:text-ink transition-colors"
      }
    >
      {showIcon && <LogOut className="w-3.5 h-3.5" />}
      Выйти
    </button>
  );
}
