import { cn } from "@/lib/utils";

export interface PriceTagProps {
  idr: number;
  usdApprox?: number;
  discount?: { label: string; percentOff: number };
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
  discount,
  prefix = "From",
  suffix = "per person",
  size = "md",
  className,
}: PriceTagProps) {
  const discountedIdr = discount ? Math.floor(idr * (100 - discount.percentOff) / 100) : idr;
  const discountedUsd = discount && usdApprox !== undefined ? usdApprox * (100 - discount.percentOff) / 100 : usdApprox;

  return (
    <div className={cn("leading-none text-charcoal", className)}>
      <span className="block text-xs font-semibold uppercase tracking-[0.1em] text-weathered">
        {discount ? `${discount.label} · ${discount.percentOff}% off` : prefix}
      </span>
      {discount ? <span className="mt-1 block text-xs tabular-nums text-weathered line-through decoration-clay">{idrFormatter.format(idr)}</span> : null}
      <span className={cn("mt-1 block font-serif font-semibold tabular-nums", sizes[size])}>
        {idrFormatter.format(discountedIdr)}
      </span>
      <span className="mt-1 block text-xs text-weathered">
        {discountedUsd !== undefined ? `≈ ${usdFormatter.format(discountedUsd)} · ` : ""}
        {suffix}
      </span>
    </div>
  );
}
