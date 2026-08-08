import { MessageCircle } from "lucide-react";
import type { AnchorHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export interface WhatsAppButtonProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  phone?: string;
  message?: string;
  compact?: boolean;
}

export function WhatsAppButton({
  phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  message = "Hi BaliXperience, I’d like help planning a Bali tour.",
  compact = false,
  className,
  children,
  ...props
}: WhatsAppButtonProps) {
  const normalizedPhone = phone?.replace(/[^0-9]/g, "");
  const sharedClassName = cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-control border border-terrace bg-terrace px-4 font-semibold text-frangipani shadow-sun-dark transition-[background-color,box-shadow,transform] duration-fast focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-focus",
    normalizedPhone
      ? "hover:-translate-y-0.5 hover:bg-terrace-light hover:shadow-sun-raised active:translate-y-0 active:shadow-none"
      : "cursor-not-allowed opacity-55",
    compact ? "size-11 px-0" : "",
    className,
  );

  if (!normalizedPhone) {
    return (
      <span className={sharedClassName} role="link" aria-disabled="true" title="WhatsApp number not configured">
        <MessageCircle aria-hidden="true" className="size-5" />
        {!compact ? children ?? "Chat on WhatsApp" : <span className="sr-only">Chat on WhatsApp</span>}
      </span>
    );
  }

  const href = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={sharedClassName}
      {...props}
    >
      <MessageCircle aria-hidden="true" className="size-5" />
      {!compact ? children ?? "Chat on WhatsApp" : <span className="sr-only">Chat on WhatsApp</span>}
    </a>
  );
}
