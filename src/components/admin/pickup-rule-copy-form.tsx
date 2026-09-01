"use client";

import { Copy, MapPin } from "lucide-react";
import { useActionState, useState } from "react";

import { copyPickupRulesAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { initialAdminActionState } from "@/lib/admin-action-state";

interface TourOption {
  id: string;
  title: string;
}

export function PickupRuleCopyForm({ tours, preview }: { tours: TourOption[]; preview: boolean }) {
  const [state, action, pending] = useActionState(copyPickupRulesAction, initialAdminActionState);
  const [sourceTourId, setSourceTourId] = useState(tours[0]?.id ?? "");
  const [selected, setSelected] = useState<string[]>([]);
  const availableTargets = tours.filter((tour) => tour.id !== sourceTourId);

  function chooseSource(id: string) {
    setSourceTourId(id);
    setSelected((current) => current.filter((targetId) => targetId !== id));
  }

  function toggleTarget(id: string, checked: boolean) {
    setSelected((current) => checked ? [...current, id] : current.filter((targetId) => targetId !== id));
  }

  return (
    <details className="border border-charcoal/25 bg-frangipani">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 font-semibold marker:hidden">
        <span className="flex items-center gap-3"><MapPin className="size-5 text-clay" aria-hidden="true" /> Copy pickup rules between tours</span>
        <span className="text-xs font-normal text-weathered">Optional bulk tool</span>
      </summary>
      <form
        action={action}
        onSubmit={(event) => {
          if (!window.confirm(`Replace pickup rules on ${selected.length} selected ${selected.length === 1 ? "tour" : "tours"}? Other add-ons will not change.`)) event.preventDefault();
        }}
        className="border-t border-charcoal/20 p-5"
      >
        <fieldset disabled={preview || pending || !tours.length} className="space-y-5 disabled:opacity-65">
          <Select label="Copy rules from" name="sourceTourId" value={sourceTourId} onChange={(event) => chooseSource(event.target.value)} hint="The selected tour becomes the source of truth for pickup areas and charges.">
            {tours.map((tour) => <option key={tour.id} value={tour.id}>{tour.title}</option>)}
          </Select>
          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold">Apply to</p>
              <button type="button" onClick={() => setSelected(selected.length === availableTargets.length ? [] : availableTargets.map((tour) => tour.id))} className="min-h-11 border-b border-charcoal/35 text-sm font-semibold text-terrace hover:border-gold">{selected.length === availableTargets.length ? "Clear all" : "Select all"}</button>
            </div>
            <div className="grid max-h-72 gap-px overflow-y-auto border border-charcoal/20 bg-charcoal/20 sm:grid-cols-2 lg:grid-cols-3">
              {availableTargets.map((tour) => (
                <label key={tour.id} className="flex min-h-12 items-center gap-3 bg-limestone px-3 py-2 text-sm">
                  <input type="checkbox" name="targetTourIds" value={tour.id} checked={selected.includes(tour.id)} onChange={(event) => toggleTarget(tour.id, event.target.checked)} className="size-5 shrink-0 accent-terrace" />
                  <span>{tour.title}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 border-t border-charcoal/20 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-5 text-weathered">This replaces pickup rules only. Copy confirmed Ubud, Kuta, Canggu and Uluwatu coverage; leave other Bali areas as a manual quote until their costs are known.</p>
            <Button type="submit" loading={pending} disabled={!selected.length}><Copy className="size-4" aria-hidden="true" /> Copy to {selected.length || 0}</Button>
          </div>
          {state.message ? <p role="status" className={`border-l-4 p-3 text-sm font-semibold ${state.ok ? "border-success bg-success/8 text-success" : "border-error bg-error/8 text-error"}`}>{state.message}</p> : null}
        </fieldset>
      </form>
    </details>
  );
}

