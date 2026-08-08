"use client";

import { ArrowRight, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminLoginForm({ previewEnabled }: { previewEnabled: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(payload: { email?: string; password?: string; preview?: boolean }) {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/admin/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Sign-in failed");
      router.replace("/admin");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Sign-in failed");
      setPending(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await submit({ email: String(data.get("email") ?? ""), password: String(data.get("password") ?? "") });
  }

  return (
    <div className="border border-charcoal/30 bg-frangipani p-6 shadow-sun-raised sm:p-8">
      <div className="flex items-center gap-3 border-b border-charcoal/20 pb-5">
        <span className="grid size-10 place-items-center bg-terrace text-frangipani"><LockKeyhole className="size-5" aria-hidden="true" /></span>
        <div><p className="font-bold">Owner access</p><p className="text-xs text-weathered">Eight-hour secure session</p></div>
      </div>
      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        <Input label="Admin email" name="email" type="email" autoComplete="username" required />
        <Input label="Password" name="password" type="password" autoComplete="current-password" required />
        {error ? <p role="alert" className="border-l-4 border-error bg-error/8 p-3 text-sm font-semibold text-error">{error}</p> : null}
        <Button type="submit" size="lg" loading={pending} className="w-full">Open admin <ArrowRight className="size-4" aria-hidden="true" /></Button>
      </form>
      {previewEnabled ? (
        <div className="mt-6 border-t border-charcoal/20 pt-6">
          <p className="mb-3 text-xs leading-5 text-weathered">Supabase isn’t connected in this local preview. Open the read-only dashboard to review the workflow.</p>
          <Button type="button" variant="outline" size="lg" disabled={pending} onClick={() => submit({ preview: true })} className="w-full">Open read-only preview</Button>
        </div>
      ) : null}
    </div>
  );
}
