"use client";

import { CalendarOff, Pause, Percent, Play, Trash2 } from "lucide-react";
import { useActionState } from "react";

import { deleteBlackoutAction, initialAdminActionState, saveBlackoutAction, saveDiscountAction, toggleDiscountAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminTourRow } from "@/lib/admin-data";

function Feedback({ state }: { state: { ok: boolean; message: string } }) {
  return state.message ? <p role="status" className={`text-sm font-semibold ${state.ok ? "text-success" : "text-error"}`}>{state.message}</p> : null;
}

export function DiscountForm({ tours, preview }: { tours: AdminTourRow[]; preview: boolean }) {
  const [state, action, pending] = useActionState(saveDiscountAction, initialAdminActionState);
  return (
    <form action={action} className="border border-charcoal/25 bg-frangipani p-5 shadow-sun sm:p-6">
      <fieldset disabled={preview || pending} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="Code" name="code" required placeholder="WELCOME10" className="font-mono uppercase" />
          <Input label="Percentage off" name="percentOff" type="number" min={1} max={50} required placeholder="10" />
          <Input label="Start date" name="startsAt" type="date" hint="Optional" />
          <Input label="End date" name="endsAt" type="date" hint="Optional" />
          <Input label="Usage limit" name="usageLimit" type="number" min={1} hint="Optional" />
          <label className="flex min-h-12 items-center gap-3 border border-charcoal/25 bg-limestone px-4 sm:self-end"><input type="checkbox" name="appliesToAll" defaultChecked className="size-5 accent-terrace" /><span><strong className="block text-sm">All packages</strong><span className="text-xs text-weathered">Uncheck to choose below</span></span></label>
        </div>
        <fieldset>
          <legend className="text-sm font-semibold">Specific packages <span className="font-normal text-weathered">(used only when “All packages” is unchecked)</span></legend>
          <div className="mt-3 grid max-h-48 gap-2 overflow-y-auto border border-charcoal/20 bg-limestone p-3 sm:grid-cols-2">
            {tours.map((tour) => <label key={tour.id} className="flex items-start gap-2 text-sm"><input type="checkbox" name="tourIds" value={tour.id} className="mt-0.5 size-4 accent-terrace" /><span>{tour.title}</span></label>)}
          </div>
        </fieldset>
        <div className="flex flex-col gap-3 border-t border-charcoal/15 pt-4 sm:flex-row sm:items-center sm:justify-between"><Feedback state={state} /><Button type="submit" loading={pending}><Percent className="size-4" aria-hidden="true" /> Create discount</Button></div>
      </fieldset>
    </form>
  );
}

export function DiscountToggle({ id, active, preview }: { id: string; active: boolean; preview: boolean }) {
  const [state, action, pending] = useActionState(toggleDiscountAction, initialAdminActionState);
  return <form action={action} className="text-right"><input type="hidden" name="id" value={id} /><input type="hidden" name="active" value={String(!active)} /><Button type="submit" size="sm" variant="ghost" disabled={preview} loading={pending}>{active ? <Pause className="size-3.5" aria-hidden="true" /> : <Play className="size-3.5" aria-hidden="true" />}{active ? "Pause" : "Activate"}</Button>{state.message ? <p className={`mt-1 text-xs ${state.ok ? "text-success" : "text-error"}`}>{state.message}</p> : null}</form>;
}

export function BlackoutForm({ preview }: { preview: boolean }) {
  const [state, action, pending] = useActionState(saveBlackoutAction, initialAdminActionState);
  return <form action={action} className="border border-charcoal/25 bg-frangipani p-5 shadow-sun sm:p-6"><fieldset disabled={preview || pending} className="grid gap-4 sm:grid-cols-[12rem_1fr_auto] sm:items-end"><Input label="Closure date" name="date" type="date" required /><Input label="Reason shown to guests" name="reason" required defaultValue="Nyepi — no driver transport operates in Bali" /><Button type="submit" loading={pending}><CalendarOff className="size-4" aria-hidden="true" /> Block date</Button><div className="sm:col-span-3"><Feedback state={state} /></div></fieldset></form>;
}

export function BlackoutDelete({ date, preview }: { date: string; preview: boolean }) {
  const [state, action, pending] = useActionState(deleteBlackoutAction, initialAdminActionState);
  return <form action={action} className="text-right"><input type="hidden" name="date" value={date} /><Button type="submit" size="sm" variant="ghost" disabled={preview} loading={pending} className="text-error"><Trash2 className="size-3.5" aria-hidden="true" /> Remove</Button>{state.message ? <p className={`mt-1 text-xs ${state.ok ? "text-success" : "text-error"}`}>{state.message}</p> : null}</form>;
}
