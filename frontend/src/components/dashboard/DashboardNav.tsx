"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Baby,
  Calendar,
  CheckSquare,
  Heart,
  MessageCircle,
  MessageCircleHeart,
  Shield,
  User,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { getUserStatus } from "@/lib/user-storage";
import { LogoutButton } from "@/components/auth/LogoutButton";
import type { UserStatus } from "@/lib/types";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  statuses: UserStatus[];
};

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Сегодня", icon: Heart, statuses: ["pregnant", "not_pregnant", "planning"] },
  { href: "/dashboard/pregnancy", label: "Моя неделя", icon: Baby, statuses: ["pregnant"] },
  { href: "/dashboard/checklist", label: "Чеклисты", icon: CheckSquare, statuses: ["pregnant", "planning"] },
  { href: "/dashboard/kicks", label: "Шевеления", icon: Activity, statuses: ["pregnant"] },
  { href: "/dashboard/preventive", label: "Профилактика", icon: Calendar, statuses: ["not_pregnant", "planning"] },
  { href: "/contraception-test", label: "Тест: контрацепция", icon: Shield, statuses: ["not_pregnant", "planning"] },
  { href: "/dashboard/trust-chat", label: "Чат доверия", icon: MessageCircleHeart, statuses: ["pregnant", "not_pregnant", "planning"] },
  { href: "/dashboard/ask", label: "Спросить", icon: MessageCircle, statuses: ["pregnant", "not_pregnant", "planning"] },
  { href: "/dashboard/profile", label: "Профиль", icon: User, statuses: ["pregnant", "not_pregnant", "planning"] },
];

export function DashboardNav() {
  const pathname = usePathname();
  const [status, setStatus] = useState<UserStatus>("not_pregnant");

  useEffect(() => {
    setStatus(getUserStatus());
  }, []);

  const items = NAV.filter((item) => item.statuses.includes(status));

  return (
    <div className="flex flex-col gap-4">
      <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm transition ${
              pathname === item.href
                ? "bg-beige/80 text-ink font-medium"
                : "text-ink-soft hover:bg-beige/60 hover:text-ink"
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <LogoutButton
        showIcon
        className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-ink-muted hover:bg-beige/60 hover:text-ink transition w-full lg:w-full"
      />
    </div>
  );
}
