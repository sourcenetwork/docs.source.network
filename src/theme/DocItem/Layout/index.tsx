import { useThemeConfig, useWindowSize } from "@docusaurus/theme-common";
import { useDoc } from "@docusaurus/plugin-content-docs/client";
import { useFilteredAndTreeifiedTOC } from "@docusaurus/theme-common/internal";
import DocBreadcrumbs from "@theme/DocBreadcrumbs";
import DocItemContent from "@theme/DocItem/Content";
import DocItemFooter from "@theme/DocItem/Footer";
import DocItemPaginator from "@theme/DocItem/Paginator";
import DocItemTOCDesktop from "@theme/DocItem/TOC/Desktop";
import DocItemTOCMobile from "@theme/DocItem/TOC/Mobile";
import DocVersionBadge from "@theme/DocVersionBadge";
import DocVersionBanner from "@theme/DocVersionBanner";
import EditThisPage from "@theme/EditThisPage";
import clsx from "clsx";
import React from "react";
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
    minHeadingLevel: frontMatter.toc_min_heading_level ?? themeConfig.tableOfContents.minHeadingLevel,
    maxHeadingLevel: frontMatter.toc_max_heading_level ?? themeConfig.tableOfContents.maxHeadingLevel,
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

export default function DocItemLayout({ children }) {
  const { metadata } = useDoc();
  const docTOC = useDocTOC();

  return (
    <div className={styles.docItemContainer}>
      <DocVersionBanner />
      <DocBreadcrumbs />
      <div className={"row"}>
        <div className={clsx("col", styles.docBody)}>
          <article>
            <DocVersionBadge />
            {docTOC.mobile}
            <DocItemContent>{children}</DocItemContent>
            <DocItemFooter />
          </article>
          <DocItemPaginator />
        </div>

        <div className={clsx('col col--3', styles.sidebar)}>
          {docTOC.desktop &&
            <div className={styles.sidebarItems}>
              <div>{metadata.title}</div>
              {docTOC.desktop}
              {metadata?.editUrl && (
                <div className={styles.edit}>
                  <EditThisPage editUrl={metadata?.editUrl} />
                </div>
              )}
            </div>
          }
        </div>
      </div>
    </div>
  );
}
