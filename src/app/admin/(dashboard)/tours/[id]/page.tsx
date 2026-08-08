import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { TourEditorForm } from "@/components/admin/tour-editor-form";
import { requireAdminPageSession } from "@/lib/admin-auth";
import { getAdminTourEditor, getAdminTours } from "@/lib/admin-data";

export default async function EditAdminTourPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, tours] = await Promise.all([requireAdminPageSession(), getAdminTours()]);
  if (!tours.some((tour) => tour.id === id)) notFound();
  const tour = await getAdminTourEditor(id);
  return (
    <div className="space-y-8">
      <AdminPageHeader eyebrow="Tour desk · Edit listing" title={tour.title} description="Changes here shape both the guest-facing detail page and the rules used at checkout." />
      <TourEditorForm tour={tour} preview={session.preview} />
    </div>
  );
}
