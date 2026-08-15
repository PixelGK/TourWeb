"use client";

import { Save, Trash2 } from "lucide-react";
import { useActionState, type ReactNode } from "react";

import { deleteTourAction, saveTourAction } from "@/app/admin/actions";
import { initialAdminActionState } from "@/lib/admin-action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { AdminTourEditorData } from "@/lib/admin-data";

const categories = ["TREKKING", "WATER_SPORTS", "CULTURAL_TOUR", "CAR_CHARTER", "MULTI_DAY_TRIP", "CUSTOM_TOUR", "ISLAND_TRIP", "NATURE", "EXPERIENCE_DAY"];
const textAreaClass = "w-full rounded-field border border-charcoal/35 bg-frangipani px-3.5 py-3 text-sm leading-6 text-charcoal outline-none focus:border-terrace focus:ring-3 focus:ring-gold/30 disabled:bg-limestone disabled:text-weathered";

function FieldLabel({ htmlFor, children, hint }: { htmlFor: string; children: ReactNode; hint?: string }) {
  return <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold">{children}{hint ? <span className="ml-2 font-normal text-weathered">{hint}</span> : null}</label>;
}

function Feedback({ state }: { state: { ok: boolean; message: string } }) {
  return state.message ? <p role="status" className={`border-l-4 p-3 text-sm font-semibold ${state.ok ? "border-success bg-success/8 text-success" : "border-error bg-error/8 text-error"}`}>{state.message}</p> : null;
}

export function TourEditorForm({ tour, preview }: { tour: AdminTourEditorData; preview: boolean }) {
  const [state, action, pending] = useActionState(saveTourAction, initialAdminActionState);
  const [deleteState, deleteAction, deleting] = useActionState(deleteTourAction, initialAdminActionState);
  const itinerary = tour.itinerary.map((stop) => `${stop.timeLabel} | ${stop.title} | ${stop.description}`).join("\n");
  const pricing = tour.pricingTiers.map((tier) => `${tier.minPax}-${tier.maxPax} | ${tier.perPersonIdr}`).join("\n");
  const addons = tour.addons.map((addon) => `${addon.code} | ${addon.title} | ${addon.priceIdr} | ${addon.pricingMode} | ${addon.description ?? ""}`).join("\n");

  return (
    <div className="space-y-8">
      {preview ? <p className="border-l-4 border-gold bg-frangipani p-4 text-sm leading-6 text-weathered"><strong className="text-charcoal">Read-only preview.</strong> The complete editor is visible, but saving activates only after Supabase and the admin account are connected.</p> : null}
      <form action={action}>
        <fieldset disabled={preview || pending} className="space-y-10 disabled:opacity-75">
          {tour.id ? <input type="hidden" name="id" value={tour.id} /> : null}
          <section aria-labelledby="tour-basics" className="border-t-2 border-charcoal pt-5">
            <div className="mb-6 grid grid-cols-[2rem_1fr] gap-3"><span className="font-serif text-2xl text-gold-dark">01</span><div><h2 id="tour-basics" className="font-serif text-2xl">Listing basics</h2><p className="text-sm text-weathered">The information guests scan before opening the itinerary.</p></div></div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="Tour title" name="title" required defaultValue={tour.title} containerClassName="sm:col-span-2" />
              <Input label="URL slug" name="slug" required defaultValue={tour.slug} hint="Lowercase words separated by hyphens." />
              <Select label="Category" name="category" required defaultValue={tour.category}>{categories.map((category) => <option key={category} value={category}>{category.replaceAll("_", " ")}</option>)}</Select>
              <Input label="Duration in minutes" name="durationMinutes" type="number" min={30} required defaultValue={tour.durationMinutes} />
              <Input label="Base price in IDR" name="basePriceIdr" type="number" min={0} step={5000} required defaultValue={tour.basePriceIdr} />
              <Input label="Optional child price in IDR" name="childPriceIdr" type="number" min={0} step={5000} defaultValue={tour.childPriceIdr ?? ""} hint="Leave empty to charge the adult rate." />
              <Input label="Child age label" name="childAgeLabel" defaultValue={tour.childAgeLabel ?? ""} hint="For example: ages 3–12." />
              <Input label="Maximum group size" name="maxGroupSize" type="number" min={1} max={50} required defaultValue={tour.maxGroupSize} />
              <label className="flex min-h-12 items-center gap-3 border border-charcoal/25 bg-frangipani px-4 sm:self-end"><input type="checkbox" name="published" defaultChecked={tour.published} className="size-5 accent-terrace" /><span><strong className="block text-sm">Published</strong><span className="text-xs text-weathered">Visible and bookable on the public site</span></span></label>
              <div className="sm:col-span-2"><FieldLabel htmlFor="description">Description</FieldLabel><textarea id="description" name="description" required rows={5} defaultValue={tour.description} className={textAreaClass} /></div>
            </div>
          </section>

          <section aria-labelledby="tour-route" className="border-t-2 border-charcoal pt-5">
            <div className="mb-6 grid grid-cols-[2rem_1fr] gap-3"><span className="font-serif text-2xl text-gold-dark">02</span><div><h2 id="tour-route" className="font-serif text-2xl">Route and guest expectations</h2><p className="text-sm text-weathered">One structured stop per line keeps the public timeline consistent.</p></div></div>
            <div className="space-y-5">
              <Input label="Meeting point" name="meetingPoint" required defaultValue={tour.meetingPoint} />
              <div><FieldLabel htmlFor="itinerary" hint="time | title | description">Itinerary</FieldLabel><textarea id="itinerary" name="itinerary" required rows={10} defaultValue={itinerary} className={`${textAreaClass} font-mono text-xs`} /></div>
              <div><FieldLabel htmlFor="inclusions" hint="one item per line">Inclusions</FieldLabel><textarea id="inclusions" name="inclusions" rows={6} defaultValue={tour.inclusions.join("\n")} className={textAreaClass} /></div>
              <div><FieldLabel htmlFor="exclusions" hint="one item per line">Exclusions</FieldLabel><textarea id="exclusions" name="exclusions" rows={5} defaultValue={tour.exclusions.join("\n")} className={textAreaClass} /></div>
              <div><FieldLabel htmlFor="cancellationPolicy">Cancellation policy</FieldLabel><textarea id="cancellationPolicy" name="cancellationPolicy" required rows={5} defaultValue={tour.cancellationPolicy} className={textAreaClass} /></div>
            </div>
          </section>

          <section aria-labelledby="tour-commerce" className="border-t-2 border-charcoal pt-5">
            <div className="mb-6 grid grid-cols-[2rem_1fr] gap-3"><span className="font-serif text-2xl text-gold-dark">03</span><div><h2 id="tour-commerce" className="font-serif text-2xl">Photos and pricing</h2><p className="text-sm text-weathered">URLs are CDN-ready. Pricing and extras are parsed into database rows, not stored as blobs.</p></div></div>
            <div className="space-y-5">
              <div><FieldLabel htmlFor="images" hint="one URL per line">Image URLs</FieldLabel><textarea id="images" name="images" required rows={6} defaultValue={tour.images.join("\n")} className={`${textAreaClass} font-mono text-xs`} /></div>
              <div><FieldLabel htmlFor="pricingTiers" hint="min-max | per-person IDR">Group pricing tiers</FieldLabel><textarea id="pricingTiers" name="pricingTiers" required rows={5} defaultValue={pricing} className={`${textAreaClass} font-mono text-xs`} /></div>
              <div><FieldLabel htmlFor="addons" hint="code | title | price | pricing mode | description">Optional add-ons</FieldLabel><textarea id="addons" name="addons" rows={6} defaultValue={addons} className={`${textAreaClass} font-mono text-xs`} /></div>
            </div>
          </section>

          <Feedback state={state} />
          <div className="sticky bottom-3 z-20 flex justify-end border border-charcoal/25 bg-frangipani/95 p-3 shadow-sun backdrop-blur"><Button type="submit" size="lg" loading={pending}><Save className="size-4" aria-hidden="true" /> {tour.id ? "Save tour" : "Create tour"}</Button></div>
        </fieldset>
      </form>

      {tour.id ? (
        <section className="border-t border-error/40 pt-6">
          <h2 className="font-serif text-2xl text-error">Danger area</h2>
          <p className="mt-2 text-sm text-weathered">Tours with any booking history cannot be deleted. Unpublish them instead.</p>
          <form action={deleteAction} className="mt-4 flex flex-wrap items-center gap-4">
            <input type="hidden" name="id" value={tour.id} />
            <Button type="submit" variant="outline" disabled={preview} loading={deleting} className="border-error text-error hover:bg-error"><Trash2 className="size-4" aria-hidden="true" /> Delete tour</Button>
            <Feedback state={deleteState} />
          </form>
        </section>
      ) : null}
    </div>
  );
}
