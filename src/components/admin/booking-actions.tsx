"use client";

import { Ban, RefreshCw } from "lucide-react";
import { useActionState } from "react";

import { initialAdminActionState, updateBookingAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

export function BookingActions({ id, status, preview }: { id: string; status: string; preview: boolean }) {
  const [state, action, pending] = useActionState(updateBookingAction, initialAdminActionState);
  return (
    <div className="space-y-2 text-right">
      <div className="flex justify-end gap-2">
        <form action={action}><input type="hidden" name="id" value={id} /><input type="hidden" name="action" value="recheck" /><Button type="submit" size="sm" variant="ghost" disabled={preview || status === "CANCELLED"} loading={pending}><RefreshCw className="size-3.5" aria-hidden="true" /> Recheck</Button></form>
        {status === "PENDING" ? <form action={action}><input type="hidden" name="id" value={id} /><input type="hidden" name="action" value="cancel" /><Button type="submit" size="sm" variant="ghost" disabled={preview || pending} className="text-error"><Ban className="size-3.5" aria-hidden="true" /> Cancel</Button></form> : null}
      </div>
      {state.message ? <p className={`text-xs ${state.ok ? "text-success" : "text-error"}`} role="status">{state.message}</p> : null}
    </div>
  );
}
