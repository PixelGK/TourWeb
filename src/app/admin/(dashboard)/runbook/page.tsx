import { CalendarCheck, CheckCheck, CircleDollarSign, ClipboardList, MailCheck, RefreshCcw, ShieldCheck } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";

const workflow = [
  { title: "Read the request", detail: "Check the requested package, date, guest count, hotel area, contact details, notes, add-ons, and the quoted IDR total.", icon: ClipboardList },
  { title: "Check the day", detail: "Confirm a driver, vehicle capacity, supplier admission, meal arrangement, and any pickup surcharge before accepting the request.", icon: CalendarCheck },
  { title: "Verify the total", detail: "Compare the selling price with the package, add-on, ticket, and pickup costs. If anything changed, update the guest before confirmation.", icon: CircleDollarSign },
  { title: "Confirm or decline", detail: "Confirm only when the driver and every included admission are available. If not, decline promptly and offer a realistic alternative.", icon: CheckCheck },
  { title: "Send the written plan", detail: "Make sure the confirmation includes pickup area and time, route order, vehicle, inclusions, exclusions, final IDR total, and cancellation terms.", icon: MailCheck },
  { title: "Handle changes clearly", detail: "Record date, pickup, guest-count, or route changes in the booking. Send the revised details so the latest written plan is unambiguous.", icon: RefreshCcw },
  { title: "Close the record", detail: "For a cancellation, restore capacity and follow the stated refund terms. After a completed day, record actual costs and review the estimated margin.", icon: ShieldCheck },
] as const;

export default function AdminRunbookPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader eyebrow="08 · Operator playbook" title="From request to pickup" description="A short operating sequence for checking and confirming every BaliXperience booking request." />
      <div className="grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
        <ol className="border border-charcoal/25 bg-frangipani">
          {workflow.map((step, index) => { const Icon = step.icon; return (
            <li key={step.title} className="grid grid-cols-[2.5rem_1fr] gap-4 border-b border-charcoal/15 p-5 last:border-b-0 sm:grid-cols-[3rem_2.5rem_1fr] sm:items-start">
              <span className="font-serif text-2xl text-gold-dark">{String(index + 1).padStart(2, "0")}</span>
              <Icon className="mt-1 hidden size-5 text-clay sm:block" aria-hidden="true" />
              <div><h2 className="font-serif text-xl">{step.title}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-weathered">{step.detail}</p></div>
            </li>
          ); })}
        </ol>
        <aside className="space-y-6">
          <section className="border-t-4 border-gold bg-charcoal p-6 text-frangipani">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-gold">Confirmation rule</p>
            <h2 className="mt-3 font-serif text-3xl">Checked first. Written second.</h2>
            <p className="mt-4 text-sm leading-6 text-frangipani/70">A submitted request is not a confirmed booking. Confirm only after the driver and any included supplier admission have been checked.</p>
          </section>
          <section className="border border-charcoal/25 bg-frangipani p-5">
            <h2 className="font-serif text-2xl">Never leave these in chat only</h2>
            <ul className="mt-4 space-y-3 text-sm leading-5 text-weathered">
              {["Pickup area, meeting place and time", "Driver and vehicle arrangement", "Route order and realistic timing", "Admissions, meals and optional costs", "Final price in IDR", "Cancellation deadline"].map((item) => <li key={item} className="flex gap-2"><span className="mt-1.5 size-1.5 shrink-0 bg-gold" aria-hidden="true" />{item}</li>)}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
