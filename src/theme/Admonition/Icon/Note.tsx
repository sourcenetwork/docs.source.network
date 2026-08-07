import type { ComponentProps, ReactNode } from 'react';

// Lucide "info", the same glyph as Info.tsx. See Tip.tsx for why the stroke
// class is needed.
export default function AdmonitionIconNote(
  props: ComponentProps<'svg'>,
): ReactNode {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      className="admonition-icon--stroke">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
