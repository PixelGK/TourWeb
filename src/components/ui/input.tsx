import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  hint?: ReactNode;
  error?: string;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, containerClassName, label, hint, error, id, required, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = `${inputId}-description`;

  return (
    <div className={cn("space-y-2", containerClassName)}>
      <label htmlFor={inputId} className="block text-sm font-semibold text-charcoal">
        {label}
        {required ? <span className="ml-1 text-error" aria-hidden="true">*</span> : null}
      </label>
      <input
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={hint || error ? descriptionId : undefined}
        className={cn(
          "min-h-12 w-full rounded-field border border-charcoal/35 bg-frangipani px-3.5 py-2.5 text-base text-charcoal outline-none transition-[border-color,box-shadow] duration-fast placeholder:text-weathered/75 focus:border-terrace focus:ring-3 focus:ring-gold/30 disabled:cursor-not-allowed disabled:bg-limestone disabled:text-weathered",
          error && "border-error focus:border-error focus:ring-error/20",
          className,
        )}
        {...props}
      />
      {error || hint ? (
        <p id={descriptionId} className={cn("text-sm leading-5", error ? "text-error" : "text-weathered")}>
          {error ?? hint}
        </p>
      ) : null}
    </div>
  );
});
