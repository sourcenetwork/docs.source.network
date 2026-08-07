import { useDoc } from "@docusaurus/plugin-content-docs/client";
import { useThemeConfig } from "@docusaurus/theme-common";
import TOCItems from "@theme/TOCItems";
import clsx from "clsx";
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import ListTreeIcon from "../../Layout/ListTreeIcon";
import styles from "./styles.module.scss";

const PANEL_ID = "doc-toc-mobile";

export default function DocItemTOCMobile(): ReactNode {
  const { toc, frontMatter } = useDoc();
  const { tableOfContents } = useThemeConfig();
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleToggle() {
    setEverOpened(true);
    setOpen((wasOpen) => !wasOpen);
  }

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handlePointerDown(event: globalThis.MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function handlePanelClick(event: MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("a")) {
      setOpen(false);
    }
  }

  return (
    <div className={styles.tocMobile} ref={containerRef}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls={PANEL_ID}
        aria-label="On this page"
        onClick={handleToggle}
      >
        <ListTreeIcon className={styles.icon} aria-hidden="true" />
      </button>

      {everOpened && (
        <div
          id={PANEL_ID}
          className={clsx(
            "thin-scrollbar",
            styles.panel,
            open && styles.panelOpen,
          )}
          onClick={handlePanelClick}
        >
          <div className={styles.heading}>On this page</div>
          <TOCItems
            toc={toc}
            minHeadingLevel={
              frontMatter.toc_min_heading_level ??
              tableOfContents.minHeadingLevel
            }
            maxHeadingLevel={
              frontMatter.toc_max_heading_level ??
              tableOfContents.maxHeadingLevel
            }
            className={styles.list}
            linkClassName={styles.link}
            linkActiveClassName={styles.linkActive}
          />
        </div>
      )}
    </div>
  );
}
