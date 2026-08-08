import { Badge } from "@/components/ui/badge";

export function AdminStatus({ status }: { status: string }) {
  const tone = status === "PAID" || status === "OPEN" ? "success" : status === "PENDING" ? "warning" : status === "CANCELLED" || status === "FAILED" || status === "EXPIRED" || status === "CLOSED" ? "error" : "neutral";
  return <Badge tone={tone} className="rounded-none uppercase tracking-[0.08em]">{status.replaceAll("_", " ")}</Badge>;
}
