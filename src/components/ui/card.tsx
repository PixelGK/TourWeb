import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  interactive?: boolean;
}

export function Card({ className, interactive = false, ...props }: CardProps) {
  return (
    <article
      className={cn(
        "border border-charcoal/20 bg-frangipani",
        interactive &&
          "transition-[border-color,box-shadow,transform] duration-base hover:-translate-y-1 hover:border-charcoal/50 hover:shadow-sun-raised",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-2 border-b border-charcoal/15 p-5", className)} {...props} />;
}

export function CardEyebrow({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-xs font-bold uppercase tracking-[0.12em] text-terrace", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-serif text-2xl leading-tight text-charcoal", className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm leading-6 text-weathered", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-t border-charcoal/15 px-5 py-4",
        className,
      )}
      {...props}
    />
  );
}
