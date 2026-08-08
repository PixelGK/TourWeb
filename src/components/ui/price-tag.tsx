import { cn } from "@/lib/utils";

export interface PriceTagProps {
  idr: number;
  usdApprox?: number;
  prefix?: string;
  suffix?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-4xl",
};

const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function PriceTag({
  idr,
  usdApprox,
  prefix = "From",
  suffix = "per person",
  size = "md",
  className,
}: PriceTagProps) {
  return (
    <div className={cn("leading-none text-charcoal", className)}>
      <span className="block text-xs font-semibold uppercase tracking-[0.1em] text-weathered">{prefix}</span>
      <span className={cn("mt-1 block font-serif font-semibold tabular-nums", sizes[size])}>
        {idrFormatter.format(idr)}
      </span>
      <span className="mt-1 block text-xs text-weathered">
        {usdApprox !== undefined ? `≈ ${usdFormatter.format(usdApprox)} · ` : ""}
        {suffix}
      </span>
    </div>
  );
}
