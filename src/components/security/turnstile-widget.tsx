"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

import { TURNSTILE_ACTION } from "@/lib/turnstile-core";

interface TurnstileApi {
  render(container: HTMLElement, options: Record<string, unknown>): string;
  remove(widgetId: string): void;
  reset(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

interface TurnstileWidgetProps {
  siteKey: string;
  resetSignal: number;
  onTokenChange(token: string): void;
}

export function TurnstileWidget({ siteKey, resetSignal, onTokenChange }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenChangeRef = useRef(onTokenChange);
  const [scriptReady, setScriptReady] = useState(false);
  const [status, setStatus] = useState<"checking" | "ready" | "error">("checking");

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  }, [onTokenChange]);

  useEffect(() => {
    if (!scriptReady || !siteKey || !containerRef.current || !window.turnstile) return;

    const widgetId = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      action: TURNSTILE_ACTION,
      appearance: "interaction-only",
      execution: "render",
      size: "flexible",
      theme: "light",
      callback: (token: string) => {
        setStatus("ready");
        onTokenChangeRef.current(token);
      },
      "expired-callback": () => {
        setStatus("checking");
        onTokenChangeRef.current("");
      },
      "error-callback": () => {
        setStatus("error");
        onTokenChangeRef.current("");
      },
      "unsupported-callback": () => {
        setStatus("error");
        onTokenChangeRef.current("");
      },
      "refresh-expired": "auto",
      retry: "auto",
    });
    widgetIdRef.current = widgetId;

    return () => {
      if (widgetIdRef.current && window.turnstile) window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
      onTokenChangeRef.current("");
    };
  }, [scriptReady, siteKey]);

  useEffect(() => {
    if (!resetSignal || !widgetIdRef.current || !window.turnstile) return;
    setStatus("checking");
    onTokenChangeRef.current("");
    window.turnstile.reset(widgetIdRef.current);
  }, [resetSignal]);

  function retryCheck() {
    if (!widgetIdRef.current || !window.turnstile) return;
    setStatus("checking");
    onTokenChangeRef.current("");
    window.turnstile.reset(widgetIdRef.current);
  }

  if (!siteKey) {
    return <p role="alert" className="text-sm font-semibold text-error">Secure verification is temporarily unavailable. Please try again shortly.</p>;
  }

  return (
    <div className="border border-charcoal/20 bg-frangipani p-4">
      <Script
        id="cloudflare-turnstile"
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
        onError={() => setStatus("error")}
      />
      <p className="text-sm font-semibold text-charcoal">Security check</p>
      <p aria-live="polite" className="mt-1 text-xs leading-5 text-weathered">
        {status === "ready" ? "Ready to send securely." : status === "error" ? "The security check could not load. Check your connection or browser privacy settings, then retry." : "Checking this request…"}
      </p>
      {status === "error" ? (
        <button type="button" onClick={retryCheck} className="mt-2 min-h-11 text-sm font-semibold text-terrace underline decoration-gold decoration-2 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold">
          Retry security check
        </button>
      ) : null}
      <div ref={containerRef} className="mt-3 min-h-0" />
    </div>
  );
}
