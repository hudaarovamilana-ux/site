"use client";

import { useEffect, useState } from "react";
import { PROFILE_SYNC_EVENT, type ProfileSyncResult } from "@/lib/profile-sync";

export function ProfileSyncNotice() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const onSync = (event: Event) => {
      const detail = (event as CustomEvent<ProfileSyncResult>).detail;
      if (!detail || detail.ok || detail.anonymous) {
        setMessage(null);
        return;
      }
      setMessage(detail.message);
    };

    window.addEventListener(PROFILE_SYNC_EVENT, onSync);
    return () => window.removeEventListener(PROFILE_SYNC_EVENT, onSync);
  }, []);

  if (!message) return null;

  return (
    <div className="border-b border-rose/30 bg-rose-pale/80 px-6 py-3 text-sm text-rose-900">
      {message}
    </div>
  );
}
