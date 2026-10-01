import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AskPageClient } from "@/components/ask/AskPageClient";
import { GuestAskGate } from "@/components/ask/GuestAskGate";
import { FlowerDecor } from "@/components/landing/FlowerDecor";
import { getSessionFromCookies } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AskPage() {
  const session = await getSessionFromCookies();

  return (
    <div className="hero-gradient min-h-[85vh] relative overflow-hidden">
      <div className="absolute right-8 top-24 hidden lg:block opacity-25">
        <FlowerDecor className="w-24 h-32" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          На главную
        </Link>

        {session ? <AskPageClient /> : <GuestAskGate />}
      </div>
    </div>
  );
}
