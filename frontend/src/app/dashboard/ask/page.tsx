"use client";

import { useEffect, useState } from "react";
import { AskForm } from "@/components/ask/AskForm";

const DRAFT_KEY = "contraception_ask_draft";

export default function DashboardAskPage() {
  const [initialQuestion, setInitialQuestion] = useState("");

  useEffect(() => {
    const draft = sessionStorage.getItem(DRAFT_KEY);
    if (draft) {
      setInitialQuestion(draft);
      sessionStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  return <AskForm initialQuestion={initialQuestion} />;
}
