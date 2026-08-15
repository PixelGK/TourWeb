"use client";

import { Ban, Check, RefreshCw } from "lucide-react";
import { useActionState } from "react";

import { initialAdminActionState, updateBookingAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

export function BookingActions({ id, status, confirmed, preview }: { id: string; status: string; confirmed?: boolean; preview: boolean }) {
  const [state, action, pending] = useActionState(updateBookingAction, initialAdminActionState);
  return (
    <div className="space-y-2 text-right">
      <div className="flex justify-end gap-2">
        {["PENDING", "PAID"].includes(status) ? <form action={action}><input type="hidden" name="id" value={id} /><input type="hidden" name="action" value="recheck" /><Button type="submit" size="sm" variant="ghost" disabled={preview || status === "CANCELLED"} loading={pending}><RefreshCw className="size-3.5" aria-hidden="true" /> Recheck</Button></form> : null}
        {(["REQUESTED", "PAID"].includes(status) && !confirmed) ? <form action={action}><input type="hidden" name="id" value={id} /><input type="hidden" name="action" value="confirm" /><Button type="submit" size="sm" variant="ghost" disabled={preview || pending} className="text-success"><Check className="size-3.5" aria-hidden="true" /> Confirm</Button></form> : null}
        {["REQUESTED", "PENDING", "CONFIRMED"].includes(status) ? <form action={action}><input type="hidden" name="id" value={id} /><input type="hidden" name="action" value="cancel" /><Button type="submit" size="sm" variant="ghost" disabled={preview || pending} className="text-error"><Ban className="size-3.5" aria-hidden="true" /> Cancel</Button></form> : null}
      </div>
      {state.message ? <p className={`text-xs ${state.ok ? "text-success" : "text-error"}`} role="status">{state.message}</p> : null}
    </div>
  );
}
