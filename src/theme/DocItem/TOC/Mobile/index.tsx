import type { ReactNode } from 'react';

// The "On this page" collapsible shown above the title on narrow viewports is
// deliberately not rendered. Returning null rather than hiding it with CSS
// keeps TOCCollapsible and its collapse machinery out of the tree entirely.
//
// The desktop TOC (DocItem/TOC/Desktop) is unaffected.
export default function DocItemTOCMobile(): ReactNode {
  return null;
}
