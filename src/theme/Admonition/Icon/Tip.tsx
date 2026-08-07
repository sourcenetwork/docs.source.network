import type { ComponentProps, ReactNode } from 'react';

// Lucide "lightbulb", replacing the theme's default fill-based icon. The
// admonition-icon--stroke class tells _admonitions.scss to undo the `fill`
// that Admonition's module CSS puts on every icon svg.
export default function AdmonitionIconTip(
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
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}
