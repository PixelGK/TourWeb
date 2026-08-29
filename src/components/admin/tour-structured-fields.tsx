"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useMemo, useRef, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { AdminTourEditorData } from "@/lib/admin-data";
import { paidPickupAreas, pickupAddonCode } from "@/lib/pickup-areas";

type ItineraryRow = AdminTourEditorData["itinerary"][number];
type PricingRow = AdminTourEditorData["pricingTiers"][number];
type AddonRow = Omit<AdminTourEditorData["addons"][number], "costPriceIdr"> & { costPriceIdr: number | "" };
type VariantRow = AdminTourEditorData["variants"][number];
type Keyed<T> = T & { _key: string };

const panelClass = "border border-charcoal/20 bg-frangipani p-4 sm:p-5";
const textareaClass = "min-h-24 w-full rounded-field border border-charcoal/35 bg-limestone px-3.5 py-3 text-sm leading-6 text-charcoal outline-none focus:border-terrace focus:ring-3 focus:ring-gold/30";

function rowData<T extends object>(row: Keyed<T>): T {
  const result = { ...row };
  Reflect.deleteProperty(result, "_key");
  return result;
}

function useRows<T extends object>(initial: T[], createEmpty: () => T, prefix: string) {
  const nextKey = useRef(initial.length);
  const [rows, setRows] = useState<Keyed<T>[]>(() => initial.map((row, index) => ({ ...row, _key: `${prefix}-${index}` })));
  const add = (value?: T) => setRows((current) => [...current, { ...(value ?? createEmpty()), _key: `${prefix}-${nextKey.current++}` }]);
  const update = (index: number, patch: Partial<T>) => setRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row));
  const remove = (index: number) => setRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
  const move = (index: number, direction: -1 | 1) => setRows((current) => {
    const destination = index + direction;
    if (destination < 0 || destination >= current.length) return current;
    const next = [...current];
    [next[index], next[destination]] = [next[destination], next[index]];
    return next;
  });
  return { rows, add, update, remove, move };
}

function SectionIntro({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-col gap-3 border-b border-charcoal/20 pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div><h3 className="font-serif text-xl">{title}</h3><p className="mt-1 max-w-2xl text-sm leading-5 text-weathered">{description}</p></div>
      {action}
    </div>
  );
}

function RowControls({ label, index, count, onMove, onRemove }: { label: string; index: number; count: number; onMove: (direction: -1 | 1) => void; onRemove: () => void }) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Button type="button" variant="ghost" size="icon" onClick={() => onMove(-1)} disabled={index === 0} aria-label={`Move ${label} up`}><ArrowUp className="size-4" aria-hidden="true" /></Button>
      <Button type="button" variant="ghost" size="icon" onClick={() => onMove(1)} disabled={index === count - 1} aria-label={`Move ${label} down`}><ArrowDown className="size-4" aria-hidden="true" /></Button>
      <Button type="button" variant="ghost" size="icon" onClick={onRemove} aria-label={`Remove ${label}`} className="text-error hover:border-error hover:bg-error hover:text-frangipani"><Trash2 className="size-4" aria-hidden="true" /></Button>
    </div>
  );
}

function SimpleListEditor({ title, description, rows, onAdd, onUpdate, onRemove, onMove }: {
  title: string;
  description: string;
  rows: Keyed<{ value: string }>[];
  onAdd: () => void;
  onUpdate: (index: number, value: string) => void;
  onRemove: (index: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
}) {
  return (
    <div className={panelClass}>
      <SectionIntro title={title} description={description} action={<Button type="button" variant="outline" size="sm" onClick={onAdd}><Plus className="size-4" aria-hidden="true" /> Add item</Button>} />
      <ol className="space-y-3">
        {rows.map((row, index) => (
          <li key={row._key} className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <label className="sr-only" htmlFor={`${row._key}-value`}>{title} item {index + 1}</label>
            <input id={`${row._key}-value`} required value={row.value} onChange={(event) => onUpdate(index, event.target.value)} className="min-h-11 flex-1 rounded-field border border-charcoal/35 bg-limestone px-3.5 text-sm outline-none focus:border-terrace focus:ring-3 focus:ring-gold/30" />
            <RowControls label={`${title.toLowerCase()} item ${index + 1}`} index={index} count={rows.length} onMove={(direction) => onMove(index, direction)} onRemove={() => onRemove(index)} />
          </li>
        ))}
      </ol>
      {!rows.length ? <p className="border-l-4 border-error pl-3 text-sm text-error">Add at least one item before saving.</p> : null}
    </div>
  );
}

export function TourStructuredFields({ tour }: { tour: AdminTourEditorData }) {
  const itinerary = useRows<ItineraryRow>(tour.itinerary, () => ({ timeLabel: "08:00", title: "", description: "" }), "route");
  const inclusions = useRows(tour.inclusions.map((value) => ({ value })), () => ({ value: "" }), "included");
  const exclusions = useRows(tour.exclusions.map((value) => ({ value })), () => ({ value: "" }), "excluded");
  const pricing = useRows<PricingRow>(tour.pricingTiers, () => ({ minPax: 1, maxPax: 1, perPersonIdr: 0 }), "price");
  const initialAddons: AddonRow[] = tour.addons.map((addon) => ({ ...addon, costPriceIdr: addon.costPriceIdr ?? "" }));
  const addons = useRows<AddonRow>(initialAddons.filter((addon) => !addon.code.startsWith("pickup-")), () => ({ code: "", title: "", priceIdr: 0, costPriceIdr: "", pricingMode: "PER_BOOKING", description: "", active: true }), "addon");
  const pickupRules = useRows<AddonRow>(initialAddons.filter((addon) => addon.code.startsWith("pickup-")), () => ({ code: "pickup-kuta", title: "Pickup from Kuta", priceIdr: 0, costPriceIdr: "", pricingMode: "PER_BOOKING", description: "Private pickup and return in Kuta.", active: false }), "pickup");
  const variants = useRows<VariantRow>(tour.variants, () => ({ code: "", title: "", description: "", priceAdjustmentIdr: 0, supplierUnitCostIdr: 0, guestsPerUnit: 1, remainderCostIdr: 0, isDefault: false, active: true }), "option");

  const structuredValue = useMemo(() => JSON.stringify({
    itinerary: itinerary.rows.map(rowData),
    inclusions: inclusions.rows.map((row) => row.value),
    exclusions: exclusions.rows.map((row) => row.value),
    pricingTiers: pricing.rows.map(rowData),
    addons: [...pickupRules.rows, ...addons.rows].map(rowData),
    variants: variants.rows.map(rowData),
  }), [itinerary.rows, inclusions.rows, exclusions.rows, pricing.rows, pickupRules.rows, addons.rows, variants.rows]);

  const addPickupTemplate = () => {
    const existingCodes = new Set(pickupRules.rows.map((rule) => rule.code));
    for (const area of paidPickupAreas) {
      const code = pickupAddonCode(area.code);
      if (!existingCodes.has(code)) pickupRules.add({ code, title: `Pickup from ${area.label}`, description: `Private pickup and return in ${area.label}.`, priceIdr: 0, costPriceIdr: "", pricingMode: "PER_BOOKING", active: false });
    }
  };

  return (
    <div className="space-y-6">
      <input type="hidden" name="structuredTourData" value={structuredValue} />

      <div className={panelClass}>
        <SectionIntro title="Day itinerary" description="Put stops in the order guests will experience them. Use a clear time or timing label such as ‘After lunch’." action={<Button type="button" variant="outline" size="sm" onClick={() => itinerary.add()}><Plus className="size-4" aria-hidden="true" /> Add stop</Button>} />
        <ol className="space-y-4">
          {itinerary.rows.map((row, index) => (
            <li key={row._key} className="border-l-4 border-gold bg-limestone p-4">
              <div className="mb-3 flex items-center justify-between gap-3"><strong className="text-sm">Stop {index + 1}</strong><RowControls label={`stop ${index + 1}`} index={index} count={itinerary.rows.length} onMove={(direction) => itinerary.move(index, direction)} onRemove={() => itinerary.remove(index)} /></div>
              <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
                <Input label="Time" required value={row.timeLabel} onChange={(event) => itinerary.update(index, { timeLabel: event.target.value })} className="bg-frangipani text-sm" />
                <Input label="Stop title" required value={row.title} onChange={(event) => itinerary.update(index, { title: event.target.value })} className="bg-frangipani text-sm" />
                <label className="space-y-2 sm:col-span-2"><span className="block text-sm font-semibold">What happens here</span><textarea required value={row.description} onChange={(event) => itinerary.update(index, { description: event.target.value })} className={textareaClass} /></label>
              </div>
            </li>
          ))}
        </ol>
        {!itinerary.rows.length ? <p className="border-l-4 border-error pl-3 text-sm text-error">Add at least one itinerary stop before saving.</p> : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SimpleListEditor title="Included" description="What the selling price definitely covers." rows={inclusions.rows} onAdd={() => inclusions.add()} onUpdate={(index, value) => inclusions.update(index, { value })} onRemove={inclusions.remove} onMove={inclusions.move} />
        <SimpleListEditor title="Not included" description="Costs or arrangements the guest handles separately." rows={exclusions.rows} onAdd={() => exclusions.add()} onUpdate={(index, value) => exclusions.update(index, { value })} onRemove={exclusions.remove} onMove={exclusions.move} />
      </div>

      <div className={panelClass}>
        <SectionIntro title="Group pricing" description="Each group size from 1 to the package maximum must be covered once, without gaps or overlaps." action={<Button type="button" variant="outline" size="sm" onClick={() => pricing.add()}><Plus className="size-4" aria-hidden="true" /> Add tier</Button>} />
        <ol className="space-y-3">
          {pricing.rows.map((row, index) => (
            <li key={row._key} className="grid gap-3 border-b border-charcoal/15 pb-3 last:border-b-0 sm:grid-cols-[1fr_1fr_1.5fr_auto] sm:items-end">
              <Input label="From guests" type="number" min={1} max={50} required value={row.minPax} onChange={(event) => pricing.update(index, { minPax: Number(event.target.value) })} className="bg-limestone text-sm" />
              <Input label="To guests" type="number" min={1} max={50} required value={row.maxPax} onChange={(event) => pricing.update(index, { maxPax: Number(event.target.value) })} className="bg-limestone text-sm" />
              <Input label="Selling price · IDR" type="number" min={0} step={5000} required value={row.perPersonIdr} onChange={(event) => pricing.update(index, { perPersonIdr: Number(event.target.value) })} className="bg-limestone text-sm" />
              <RowControls label={`pricing tier ${index + 1}`} index={index} count={pricing.rows.length} onMove={(direction) => pricing.move(index, direction)} onRemove={() => pricing.remove(index)} />
            </li>
          ))}
        </ol>
      </div>

      <div className={panelClass}>
        <SectionIntro title="Pickup-area charges" description="Ubud is included automatically. Paid-area rules stay private until enabled and are added to the guest’s final IDR total." action={<Button type="button" variant="outline" size="sm" onClick={addPickupTemplate}><Plus className="size-4" aria-hidden="true" /> Add standard areas</Button>} />
        <p className="mb-4 border-l-4 border-gold bg-gold/10 px-4 py-3 text-sm leading-5 text-weathered">New standard areas start inactive with a zero selling price. Enter the selling charge and internal driving cost, then switch each area on.</p>
        <ol className="space-y-4">
          {pickupRules.rows.map((row, index) => {
            const areaCode = row.code.replace(/^pickup-/, "");
            return (
              <li key={row._key} className="border border-charcoal/20 bg-limestone p-4">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_auto] xl:items-end">
                  <Select label="Pickup area" value={areaCode} onChange={(event) => { const area = paidPickupAreas.find((item) => item.code === event.target.value); if (area) pickupRules.update(index, { code: pickupAddonCode(area.code), title: `Pickup from ${area.label}`, description: `Private pickup and return in ${area.label}.` }); }}>
                    {!paidPickupAreas.some((area) => area.code === areaCode) ? <option value={areaCode}>{row.title}</option> : null}
                    {paidPickupAreas.map((area) => <option key={area.code} value={area.code}>{area.label}</option>)}
                  </Select>
                  <Input label="Guest charge · IDR" type="number" min={0} step={5000} required value={row.priceIdr} onChange={(event) => pickupRules.update(index, { priceIdr: Number(event.target.value) })} className="bg-frangipani text-sm" />
                  <Input label="Internal cost · IDR" type="number" min={0} step={5000} value={row.costPriceIdr} onChange={(event) => pickupRules.update(index, { costPriceIdr: event.target.value === "" ? "" : Number(event.target.value) })} className="bg-frangipani text-sm" />
                  <div className="flex items-center justify-between gap-2 xl:justify-end"><label className="flex min-h-11 items-center gap-2 px-2 text-sm font-semibold"><input type="checkbox" checked={row.active} onChange={(event) => pickupRules.update(index, { active: event.target.checked })} className="size-5 accent-terrace" /> Active</label><RowControls label={`${row.title} rule`} index={index} count={pickupRules.rows.length} onMove={(direction) => pickupRules.move(index, direction)} onRemove={() => pickupRules.remove(index)} /></div>
                </div>
              </li>
            );
          })}
        </ol>
        {!pickupRules.rows.length ? <p className="text-sm text-weathered">No paid pickup areas have been configured yet.</p> : null}
      </div>

      <div className={panelClass}>
        <SectionIntro title="Optional add-ons" description="Meals, admission upgrades, or other choices guests can add to this package." action={<Button type="button" variant="outline" size="sm" onClick={() => addons.add()}><Plus className="size-4" aria-hidden="true" /> Add option</Button>} />
        <ol className="space-y-4">
          {addons.rows.map((row, index) => (
            <li key={row._key} className="border border-charcoal/20 bg-limestone p-4">
              <div className="mb-3 flex items-center justify-between gap-3"><strong className="text-sm">Add-on {index + 1}</strong><RowControls label={`add-on ${index + 1}`} index={index} count={addons.rows.length} onMove={(direction) => addons.move(index, direction)} onRemove={() => addons.remove(index)} /></div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Input label="Name" required value={row.title} onChange={(event) => addons.update(index, { title: event.target.value })} className="bg-frangipani text-sm" />
                <Input label="Code" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={row.code} onChange={(event) => addons.update(index, { code: event.target.value.toLowerCase().replace(/\s+/g, "-") })} className="bg-frangipani font-mono text-sm" />
                <Input label="Guest price · IDR" type="number" min={0} step={5000} required value={row.priceIdr} onChange={(event) => addons.update(index, { priceIdr: Number(event.target.value) })} className="bg-frangipani text-sm" />
                <Input label="Internal cost · IDR" type="number" min={0} step={5000} value={row.costPriceIdr} onChange={(event) => addons.update(index, { costPriceIdr: event.target.value === "" ? "" : Number(event.target.value) })} className="bg-frangipani text-sm" />
                <Select label="Charged" value={row.pricingMode} onChange={(event) => addons.update(index, { pricingMode: event.target.value })}><option value="PER_BOOKING">Once per booking</option><option value="PER_PERSON">For each traveler</option></Select>
                <label className="space-y-2 sm:col-span-1 xl:col-span-2"><span className="block text-sm font-semibold">Guest description</span><textarea value={row.description ?? ""} onChange={(event) => addons.update(index, { description: event.target.value })} className={`${textareaClass} min-h-12 bg-frangipani`} /></label>
                <label className="flex min-h-12 items-center gap-3 self-end border border-charcoal/20 bg-frangipani px-4"><input type="checkbox" checked={row.active} onChange={(event) => addons.update(index, { active: event.target.checked })} className="size-5 accent-terrace" /><span className="text-sm font-semibold">Available to guests</span></label>
              </div>
            </li>
          ))}
        </ol>
        {!addons.rows.length ? <p className="text-sm text-weathered">This package has no optional add-ons.</p> : null}
      </div>

      <div className={panelClass}>
        <SectionIntro title="Package or ride options" description="Use this only when guests choose between versions such as standard and premium. Exactly one active option must be the default." action={<Button type="button" variant="outline" size="sm" onClick={() => variants.add()}><Plus className="size-4" aria-hidden="true" /> Add package option</Button>} />
        <ol className="space-y-4">
          {variants.rows.map((row, index) => (
            <li key={row._key} className="border border-charcoal/20 bg-limestone p-4">
              <div className="mb-3 flex items-center justify-between gap-3"><strong className="text-sm">Package option {index + 1}</strong><RowControls label={`package option ${index + 1}`} index={index} count={variants.rows.length} onMove={(direction) => variants.move(index, direction)} onRemove={() => variants.remove(index)} /></div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Input label="Name" required value={row.title} onChange={(event) => variants.update(index, { title: event.target.value })} className="bg-frangipani text-sm" />
                <Input label="Code" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={row.code} onChange={(event) => variants.update(index, { code: event.target.value.toLowerCase().replace(/\s+/g, "-") })} className="bg-frangipani font-mono text-sm" />
                <Input label="Price change per guest · IDR" type="number" step={5000} required value={row.priceAdjustmentIdr} onChange={(event) => variants.update(index, { priceAdjustmentIdr: Number(event.target.value) })} className="bg-frangipani text-sm" />
                <Input label="Supplier cost per unit · IDR" type="number" min={0} step={5000} required value={row.supplierUnitCostIdr} onChange={(event) => variants.update(index, { supplierUnitCostIdr: Number(event.target.value) })} className="bg-frangipani text-sm" />
                <Input label="Guests per unit" type="number" min={1} max={20} required value={row.guestsPerUnit} onChange={(event) => variants.update(index, { guestsPerUnit: Number(event.target.value) })} className="bg-frangipani text-sm" />
                <Input label="Remainder guest cost · IDR" type="number" min={0} step={5000} required value={row.remainderCostIdr} onChange={(event) => variants.update(index, { remainderCostIdr: Number(event.target.value) })} className="bg-frangipani text-sm" />
                <label className="space-y-2 sm:col-span-2"><span className="block text-sm font-semibold">Guest description</span><textarea value={row.description ?? ""} onChange={(event) => variants.update(index, { description: event.target.value })} className={`${textareaClass} min-h-12 bg-frangipani`} /></label>
                <div className="flex flex-wrap gap-4 sm:col-span-2 xl:col-span-4">
                  <label className="flex min-h-11 items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={row.active} onChange={(event) => variants.update(index, { active: event.target.checked, isDefault: event.target.checked ? row.isDefault : false })} className="size-5 accent-terrace" /> Available to guests</label>
                  <label className="flex min-h-11 items-center gap-2 text-sm font-semibold"><input type="radio" name="defaultPackageOption" checked={row.isDefault} disabled={!row.active} onChange={() => variants.rows.forEach((_, rowIndex) => variants.update(rowIndex, { isDefault: rowIndex === index }))} className="size-5 accent-terrace" /> Default option</label>
                </div>
              </div>
            </li>
          ))}
        </ol>
        {!variants.rows.length ? <p className="text-sm text-weathered">This package has one version, so no selectable option is needed.</p> : null}
      </div>
    </div>
  );
}
