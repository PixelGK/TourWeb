"use client";

import { CalendarPlus, Lock, Unlock } from "lucide-react";
import { useActionState } from "react";

import { saveAvailabilityAction, toggleAvailabilityAction } from "@/app/admin/actions";
import { initialAdminActionState } from "@/lib/admin-action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminTourRow } from "@/lib/admin-data";

export function AvailabilityRangeForm({ tour, preview }: { tour: AdminTourRow; preview: boolean }) {
  const [state, action, pending] = useActionState(saveAvailabilityAction, initialAdminActionState);
  return (
    <form action={action} className="border border-charcoal/30 bg-frangipani p-5 shadow-sun sm:p-6">
      <fieldset disabled={preview || pending} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <input type="hidden" name="tourId" value={tour.id} />
        <Input label="From" name="startDate" type="date" required />
        <Input label="Through" name="endDate" type="date" required />
        <Input label="Capacity per date" name="capacity" type="number" min={1} max={50} required defaultValue={6} />
        <div className="sm:col-span-2 lg:col-span-3 flex flex-col gap-3 border-t border-charcoal/15 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className={`text-sm ${state.ok ? "text-success" : "text-error"}`} role="status">{state.message || (preview ? "Read-only until Supabase is connected." : "Existing reservations are preserved when capacity changes.")}</p>
          <Button type="submit" loading={pending}><CalendarPlus className="size-4" aria-hidden="true" /> Open date range</Button>
        </div>
      </fieldset>
    </form>
  );
}

export function AvailabilityToggle({ id, isOpen, preview }: { id: string; isOpen: boolean; preview: boolean }) {
  const [state, action, pending] = useActionState(toggleAvailabilityAction, initialAdminActionState);
  return (
    <form action={action} className="flex items-center justify-end gap-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="isOpen" value={String(!isOpen)} />
      {state.message ? <span className={`text-xs ${state.ok ? "text-success" : "text-error"}`}>{state.message}</span> : null}
      <Button type="submit" size="sm" variant="ghost" disabled={preview} loading={pending}>{isOpen ? <Lock className="size-3.5" aria-hidden="true" /> : <Unlock className="size-3.5" aria-hidden="true" />}{isOpen ? "Close" : "Reopen"}</Button>
    </form>
  );
}
