"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLogout() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <button type="button" disabled={pending} onClick={async () => {
      setPending(true);
      await fetch("/api/admin/session", { method: "DELETE" });
      router.replace("/admin/login");
      router.refresh();
    }} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-frangipani/65 transition-colors hover:text-frangipani disabled:opacity-50">
      <LogOut className="size-4" aria-hidden="true" />
      Sign out
    </button>
  );
}
