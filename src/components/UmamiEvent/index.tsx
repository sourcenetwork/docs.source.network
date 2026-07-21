// src/components/UmamiEvent/index.tsx
import React, { useEffect, useRef } from "react";
import { useLocation } from "@docusaurus/router";
import { useActivePluginAndVersion } from "@docusaurus/plugin-content-docs/client";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, data?: Record<string, unknown>) => void;
    };
  }
}

export interface UmamiEventProps {
  /** Umami event name (required). Passed in at the call site. */
  eventName: string;
  /** Extra key/value data to attach to the event. */
  eventData?: Record<string, string | number | boolean>;
}

/**
 * Drop this at the bottom of any markdown/MDX page:
 *
 *   <UmamiEvent eventName="scroll-to-bottom" />
 *
 * It renders a 1px, invisible sentinel. When that sentinel scrolls into
 * the viewport, it means the reader reached the bottom of the page, and
 * we fire a single umami.track() call (once per page view).
 */
export default function UmamiEvent({ eventName, eventData }: UmamiEventProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const firedRef = useRef(false);
  const location = useLocation();

  const active = useActivePluginAndVersion({ failfast: false });
  const product = active?.activePlugin?.pluginId;
  const version = active?.activeVersion?.label.replace(/\s*\(.*\)\s*$/, "");

  useEffect(() => {
    if (!ExecutionEnvironment.canUseDOM) return;
    if (typeof IntersectionObserver === "undefined") return;

    // Reset the "already fired" flag on every client-side navigation,
    // since Docusaurus is an SPA and this component instance may persist
    // across route changes if reused in a layout.
    firedRef.current = false;

    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !firedRef.current) {
            firedRef.current = true;
            window.umami?.track(eventName, {
              product,
              version,
              ...eventData,
            });
            // Stop watching once fired — we only want it once per view.
            observer.disconnect();
          }
        }
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div
      ref={sentinelRef}
      aria-hidden="true"
      style={{ height: 1, width: "100%" }}
    />
  );
}
