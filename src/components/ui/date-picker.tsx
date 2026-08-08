import { forwardRef, type InputHTMLAttributes } from "react";

import { Input } from "@/components/ui/input";

export interface DatePickerProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
  props,
  ref,
) {
  return <Input ref={ref} type="date" {...props} />;
});
