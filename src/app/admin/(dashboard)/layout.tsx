import Link from "next/link";

import { AdminLogout } from "@/components/admin/admin-logout";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdminPageSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminPageSession();
  return (
    <div className="min-h-screen bg-limestone">
      <aside className="bg-charcoal text-frangipani lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-18 items-center justify-between border-b border-frangipani/15 px-5 lg:min-h-24">
          <Link href="/admin" className="inline-flex items-baseline font-bold uppercase tracking-[-0.035em]"><span className="text-lg">Bali</span><span className="mx-0.5 text-xl font-light text-gold">/</span><span className="text-lg">Xperience</span></Link>
          <span className="border border-frangipani/20 px-2 py-1 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-frangipani/60">Admin</span>
        </div>
        <AdminNav />
        <div className="hidden flex-1 flex-col justify-end border-t border-frangipani/15 p-5 lg:flex">
          {session.preview ? <p className="mb-4 border-l-2 border-gold pl-3 text-xs leading-5 text-frangipani/55">Read-only local preview. Supabase mutations are off.</p> : null}
          <p className="truncate text-sm font-semibold">{session.email}</p>
          <AdminLogout />
        </div>
      </aside>
      <div className="lg:pl-64">
        <div className="hidden min-h-11 items-center justify-between border-b border-charcoal/15 px-6 text-xs font-semibold text-weathered lg:flex xl:px-10">
          <span>Bali local operations · {new Intl.DateTimeFormat("en", { dateStyle: "full", timeZone: "Asia/Makassar" }).format(new Date())}</span>
          <Link href="/" target="_blank" className="text-terrace hover:underline">View public site ↗</Link>
        </div>
        <main className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10 xl:px-10">{children}</main>
      </div>
    </div>
  );
}
