"use client";

import { CalendarOff, CalendarRange, Pause, Percent, Play, Trash2 } from "lucide-react";
import { useActionState } from "react";

import { deleteBlackoutAction, saveBlackoutAction, saveDiscountAction, saveSeasonalDiscountAction, toggleDiscountAction } from "@/app/admin/actions";
import { initialAdminActionState } from "@/lib/admin-action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminTourRow } from "@/lib/admin-data";

function Feedback({ state }: { state: { ok: boolean; message: string } }) {
  return state.message ? <p role="status" className={`text-sm font-semibold ${state.ok ? "text-success" : "text-error"}`}>{state.message}</p> : null;
}

function PackageScope({ tours, prefix }: { tours: AdminTourRow[]; prefix: string }) {
  return <fieldset>
    <legend className="text-sm font-semibold">Packages</legend>
    <label className="mt-3 flex min-h-12 items-center gap-3 border border-charcoal/25 bg-limestone px-4"><input type="checkbox" name="appliesToAll" defaultChecked className="size-5 accent-terrace" /><span><strong className="block text-sm">All packages</strong><span className="text-xs text-weathered">Uncheck to select individual packages below</span></span></label>
    <div className="mt-2 grid max-h-44 gap-2 overflow-y-auto border border-charcoal/20 bg-limestone p-3 sm:grid-cols-2">
      {tours.map((tour) => <label key={`${prefix}-${tour.id}`} className="flex items-start gap-2 text-sm"><input type="checkbox" name="tourIds" value={tour.id} className="mt-0.5 size-4 accent-terrace" /><span>{tour.title}</span></label>)}
    </div>
  </fieldset>;
}

export function SeasonalDiscountForm({ tours, preview }: { tours: AdminTourRow[]; preview: boolean }) {
  const [state, action, pending] = useActionState(saveSeasonalDiscountAction, initialAdminActionState);
  return (
    <form action={action} className="border border-terrace/45 bg-frangipani shadow-sun">
      <div className="grid bg-terrace text-frangipani sm:grid-cols-[13rem_1fr]">
        <div className="border-b border-frangipani/15 p-5 sm:border-b-0 sm:border-r"><CalendarRange className="size-6 text-gold" aria-hidden="true" /><p className="mt-7 text-xs font-bold uppercase tracking-[0.12em] text-gold">Automatic at checkout</p><p className="mt-2 text-sm leading-6 text-frangipani/70">Guests see the reduction without entering a code.</p></div>
        <fieldset disabled={preview || pending} className="space-y-5 bg-frangipani p-5 text-charcoal sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Input label="Offer name" name="name" required placeholder="Quiet season offer" containerClassName="sm:col-span-2 lg:col-span-1" />
            <Input label="Percentage off" name="percentOff" type="number" min={1} max={50} required placeholder="10" />
            <Input label="Travel from" name="startsAt" type="date" required />
            <Input label="Travel until" name="endsAt" type="date" required />
          </div>
          <PackageScope tours={tours} prefix="seasonal" />
          <div className="flex flex-col gap-3 border-t border-charcoal/15 pt-4 sm:flex-row sm:items-center sm:justify-between"><Feedback state={state} /><Button type="submit" loading={pending}><CalendarRange className="size-4" aria-hidden="true" /> Create seasonal offer</Button></div>
        </fieldset>
      </div>
    </form>
  );
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
        </div>
        <PackageScope tours={tours} prefix="code" />
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
