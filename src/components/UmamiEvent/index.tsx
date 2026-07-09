// src/components/UmamiEvent/index.tsx
import React, { useEffect, useRef } from 'react';
import { useLocation } from '@docusaurus/router';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

export interface UmamiEventProps {
  /** Umami event name (required). Passed in at the call site. */
  eventName: string;
  /** Extra key/value data to attach to the event. */
  eventData?: Record<string, string | number | boolean>;
  /**
   * Fraction of the sentinel that must be visible to count as "reached".
   * 0 = as soon as any pixel is visible. Default 0.
   */
  threshold?: number;
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
export default function UmamiEvent({
  eventName,
  eventData,
  threshold = 0,
}: UmamiEventProps): JSX.Element {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const firedRef = useRef(false);
  const location = useLocation();

  useEffect(() => {
    if (!ExecutionEnvironment.canUseDOM) return;
    if (typeof IntersectionObserver === 'undefined') return;

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
              path: location.pathname,
              title: document.title,
              ...eventData,
            });
            // Stop watching once fired — we only want it once per view.
            observer.disconnect();
          }
        }
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div
      ref={sentinelRef}
      aria-hidden="true"
      style={{ height: 1, width: '100%' }}
    />
  );
}