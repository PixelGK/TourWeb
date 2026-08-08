import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: ReactNode;
  error?: string;
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, containerClassName, label, hint, error, id, required, children, ...props },
  ref,
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const descriptionId = `${selectId}-description`;

  return (
    <div className={cn("space-y-2", containerClassName)}>
      <label htmlFor={selectId} className="block text-sm font-semibold text-charcoal">
        {label}
        {required ? <span className="ml-1 text-error" aria-hidden="true">*</span> : null}
      </label>
      <select
        ref={ref}
        id={selectId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={hint || error ? descriptionId : undefined}
        className={cn(
          "min-h-12 w-full rounded-field border border-charcoal/35 bg-frangipani px-3.5 py-2.5 text-base text-charcoal outline-none transition-[border-color,box-shadow] duration-fast focus:border-terrace focus:ring-3 focus:ring-gold/30 disabled:cursor-not-allowed disabled:bg-limestone disabled:text-weathered",
          error && "border-error focus:border-error focus:ring-error/20",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error || hint ? (
        <p id={descriptionId} className={cn("text-sm leading-5", error ? "text-error" : "text-weathered")}>
          {error ?? hint}
        </p>
      ) : null}
    </div>
  );
});
