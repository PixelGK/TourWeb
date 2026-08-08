import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getAdminSession, isAdminPreviewEnabled } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "Owner sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");
  return (
    <main className="grid min-h-screen bg-limestone lg:grid-cols-[1.15fr_0.85fr]">
      <section className="relative hidden overflow-hidden bg-charcoal p-12 text-frangipani lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-y-0 right-0 w-1/2 border-l border-frangipani/10 bg-[linear-gradient(135deg,transparent_48%,rgb(201_138_62_/_0.2)_49%,transparent_51%)] bg-[length:42px_42px]" />
        <Link href="/" className="relative inline-flex items-baseline font-bold uppercase tracking-[-0.035em]"><span className="text-xl">Bali</span><span className="mx-0.5 text-2xl font-light text-gold">/</span><span className="text-xl">Xperience</span></Link>
        <div className="relative max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Operator dashboard</p>
          <h1 className="mt-5 font-serif text-6xl leading-[0.95]">Tours and bookings,<br />in one place.</h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-frangipani/65">Manage tours, guest details, availability, and booking status.</p>
        </div>
        <p className="relative text-xs text-frangipani/45">Private admin · Bali time · IDR settlement</p>
      </section>
      <section className="flex items-center justify-center px-4 py-14 sm:px-8">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-12 inline-flex items-baseline font-bold uppercase tracking-[-0.035em] lg:hidden"><span className="text-xl">Bali</span><span className="mx-0.5 text-2xl font-light text-gold">/</span><span className="text-xl">Xperience</span></Link>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-clay">Private admin</p>
          <h2 className="mt-2 font-serif text-4xl">Owner sign in</h2>
          <p className="mb-7 mt-3 text-weathered">Use your admin email and password.</p>
          <AdminLoginForm previewEnabled={isAdminPreviewEnabled()} />
        </div>
      </section>
    </main>
  );
}
