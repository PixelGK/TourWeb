import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { TourEditorForm } from "@/components/admin/tour-editor-form";
import { requireAdminPageSession } from "@/lib/admin-auth";
import { getAdminTourEditor } from "@/lib/admin-data";

export default async function NewAdminTourPage() {
  const [session, tour] = await Promise.all([requireAdminPageSession(), getAdminTourEditor()]);
  return (
    <div className="space-y-8">
      <AdminPageHeader eyebrow="Tour desk · New listing" title="Build a tour" description="Shape the public listing and its operational rules in one structured record." />
      <TourEditorForm tour={tour} preview={session.preview} />
    </div>
  );
}
