import React, { useEffect, useRef, type ReactNode } from 'react';
import clsx from 'clsx';
import TOCItems from '@theme/TOCItems';
import type { Props } from '@theme/TOC';

import styles from './styles.module.css';

// Using a custom className
// This prevents TOCInline/TOCCollapsible getting highlighted by mistake
const LINK_CLASS_NAME = 'table-of-contents__link toc-highlight';
const LINK_ACTIVE_CLASS_NAME = 'table-of-contents__link--active';

// Docusaurus applies the active class imperatively (classList.add/remove on
// scroll, see useTOCHighlight) rather than through React state, so we can't
// just read it from props/state. A MutationObserver watching for class
// changes lets us react to it and slide the indicator to match the active
// link's actual on-screen position - which also sidesteps having to
// calculate each link's own indentation offset, since nesting depth doesn't
// matter when we just measure the real element.
function usePillIndicator() {
  const containerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !indicatorRef.current) {
      return undefined;
    }
    const container = containerRef.current;
    const indicator = indicatorRef.current;

    function updateIndicator() {
      const activeLink = container.querySelector<HTMLAnchorElement>(
        `.${LINK_ACTIVE_CLASS_NAME}`,
      );
      if (!activeLink) {
        indicator.style.opacity = '0';
        return;
      }
      const containerRect = container.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      indicator.style.opacity = '1';
      indicator.style.top = `${linkRect.top - containerRect.top}px`;
      indicator.style.height = `${linkRect.height}px`;
    }

    updateIndicator();

    const observer = new MutationObserver(updateIndicator);
    observer.observe(container, {
      attributes: true,
      attributeFilter: ['class'],
      subtree: true,
    });
    window.addEventListener('resize', updateIndicator);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateIndicator);
    };
  }, []);

  return { containerRef, indicatorRef };
}

export default function TOC({ className, ...props }: Props): ReactNode {
  const { containerRef, indicatorRef } = usePillIndicator();

  return (
    <div
      ref={containerRef}
      className={clsx(styles.tableOfContents, 'thin-scrollbar', className)}
    >
      <div ref={indicatorRef} className={styles.tocIndicator} />
      <TOCItems
        {...props}
        linkClassName={LINK_CLASS_NAME}
        linkActiveClassName={LINK_ACTIVE_CLASS_NAME}
      />
    </div>
  );
}
