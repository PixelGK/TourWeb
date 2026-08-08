import { LoaderCircle } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-gold bg-gold text-charcoal shadow-sun hover:-translate-y-0.5 hover:bg-gold-dark hover:shadow-sun-raised active:translate-y-0 active:shadow-none",
  secondary:
    "border-terrace bg-terrace text-frangipani shadow-sun-dark hover:-translate-y-0.5 hover:bg-terrace-light active:translate-y-0 active:shadow-none",
  outline:
    "border-charcoal/45 bg-transparent text-charcoal hover:border-charcoal hover:bg-charcoal hover:text-frangipani",
  ghost:
    "border-transparent bg-transparent text-charcoal hover:border-charcoal/20 hover:bg-charcoal/6",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 text-sm",
  md: "min-h-11 px-5 text-[0.9375rem]",
  lg: "min-h-12 px-6 text-base",
  icon: "size-11 p-0",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = "primary",
    size = "md",
    loading = false,
    disabled,
    children,
    type = "button",
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex select-none items-center justify-center gap-2 rounded-control border font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-fast focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-focus disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
      {children}
    </button>
  );
});
