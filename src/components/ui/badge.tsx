import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type BadgeTone = "category" | "trust" | "neutral" | "clay" | "warning" | "success" | "error";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const tones: Record<BadgeTone, string> = {
  category: "border-terrace/35 bg-terrace/8 text-terrace",
  trust: "border-terrace bg-terrace text-frangipani",
  neutral: "border-charcoal/20 bg-frangipani text-charcoal",
  clay: "border-clay/30 bg-clay/10 text-clay",
  warning: "border-warning/35 bg-warning/10 text-warning",
  success: "border-success/35 bg-success/10 text-success",
  error: "border-error/35 bg-error/10 text-error",
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center gap-1.5 rounded-control border px-2.5 py-1 text-xs font-semibold tracking-[0.01em]",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
