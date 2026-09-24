"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AskForm } from "@/components/ask/AskForm";
import { FlowerDecor } from "@/components/landing/FlowerDecor";

const DRAFT_KEY = "contraception_ask_draft";

export default function AskPage() {
  const [initialQuestion, setInitialQuestion] = useState("");

  useEffect(() => {
    const draft = sessionStorage.getItem(DRAFT_KEY);
    if (draft) {
      setInitialQuestion(draft);
      sessionStorage.removeItem(DRAFT_KEY);
    }
  }, []);

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

        <AskForm initialQuestion={initialQuestion} />
      </div>
    </div>
  );
}
