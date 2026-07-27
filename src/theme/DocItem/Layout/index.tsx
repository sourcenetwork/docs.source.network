import { useDoc } from "@docusaurus/plugin-content-docs/client";
import { useThemeConfig, useWindowSize } from "@docusaurus/theme-common";
import { useFilteredAndTreeifiedTOC } from "@docusaurus/theme-common/internal";
import DocBreadcrumbs from "@theme/DocBreadcrumbs";
import DocItemContent from "@theme/DocItem/Content";
import DocItemFooter from "@theme/DocItem/Footer";
import type { Props } from "@theme/DocItem/Layout";
import DocItemPaginator from "@theme/DocItem/Paginator";
import DocItemTOCDesktop from "@theme/DocItem/TOC/Desktop";
import DocItemTOCMobile from "@theme/DocItem/TOC/Mobile";
import DocVersionBadge from "@theme/DocVersionBadge";
import DocVersionBanner from "@theme/DocVersionBanner";
import EditThisPage from "@theme/EditThisPage";
import clsx from "clsx";
import { type ReactNode } from "react";
import ListTreeIcon from "./ListTreeIcon";
import styles from "./styles.module.scss";

/**
 * Decide if the toc should be rendered, on mobile or desktop viewports
 */
function useDocTOC() {
  const { frontMatter, toc } = useDoc();
  const windowSize = useWindowSize();
  const themeConfig = useThemeConfig();

  // Get the rendered TOC tree to determine visibility
  const tocTree = useFilteredAndTreeifiedTOC({
    toc,
    minHeadingLevel:
      frontMatter.toc_min_heading_level ??
      themeConfig.tableOfContents.minHeadingLevel,
    maxHeadingLevel:
      frontMatter.toc_max_heading_level ??
      themeConfig.tableOfContents.maxHeadingLevel,
  });

  const hidden = frontMatter.hide_table_of_contents;
  const canRender = !hidden && tocTree.length > 0;
  const mobile = canRender ? <DocItemTOCMobile /> : undefined;
  const desktop =
    canRender && (windowSize === "desktop" || windowSize === "ssr") ? (
      <DocItemTOCDesktop />
    ) : undefined;
  return {
    hidden,
    mobile,
    desktop,
  };
}

export default function DocItemLayout({ children }: Props): ReactNode {
  const { metadata } = useDoc();
  const docTOC = useDocTOC();

  return (
    <div className={styles.docItemContainer}>
      <DocVersionBanner />
      <DocBreadcrumbs />
      <div className={"row"}>
        <div className={clsx("col", styles.docBody)}>
          <article>
            <DocVersionBadge className={styles.versionBadge} />
            {docTOC.mobile}
            <DocItemContent>{children}</DocItemContent>
            <DocItemFooter />
          </article>
          <DocItemPaginator />
        </div>

        <div className={clsx("col col--4", styles.sidebar)}>
          {docTOC.desktop && (
            <div className={styles.sidebarItems}>
              <ListTreeIcon
                className={styles.tocIcon}
                aria-label="Table of contents"
              />
              {docTOC.desktop}
              {metadata?.editUrl && (
                <div className={styles.edit}>
                  <EditThisPage editUrl={metadata?.editUrl} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
