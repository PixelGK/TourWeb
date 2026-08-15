export interface AdminActionState {
  ok: boolean;
  message: string;
  recordId?: string;
}

export const initialAdminActionState: AdminActionState = { ok: false, message: "" };
