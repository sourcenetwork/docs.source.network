/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useState, useCallback } from "react";
import { MDXProvider } from "@mdx-js/react";
import renderRoutes from "@docusaurus/renderRoutes";
import Layout from "@theme/Layout";
import DocSidebar from "@theme/DocSidebar";
import MDXComponents from "@theme/MDXComponents";
import NotFound from "@theme/NotFound";
import IconArrow from "@theme/IconArrow";
import BackToTopButton from "@theme/BackToTopButton";
import { matchPath } from "@docusaurus/router";
import { translate } from "@docusaurus/Translate";
import clsx from "clsx";
import styles from "./styles.module.scss";
import {
  isSamePath,
  ThemeClassNames,
  docVersionSearchTag,
} from "@docusaurus/theme-common";
import Head from "@docusaurus/Head";
import Breadcrumbs from "../Breadcrumbs";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

function getPageCrumbs(currentRoute: any, links: any[] = [], path: any[] = []) {
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    if (link.type === "link" && link?.href === currentRoute.path) {
      path.push({ label: link.label, type: link.type, href: link.href });
      break;
    }
    if (link.type === "category" && link?.items?.length) {
      path.push({ label: link.label, type: link.type });
      return getPageCrumbs(currentRoute, link.items, path);
    }
  }
  return path;
}

function getCurrentDocsData(context: any, versionMetadata: any) {
  const docs = context?.globalData["docusaurus-plugin-content-docs"];
  const { docsData = {} } = context?.siteConfig?.customFields;
  const currentDoc = docs[versionMetadata?.pluginId].versions.find(
    (version: any) => version.name === versionMetadata?.version
  );
  const currentDocData = docsData[versionMetadata?.pluginId];

  if (!currentDocData) return;

  return {
    path: currentDoc.path,
    title: currentDocData?.title,
  };
}

function DocPageContent({ currentDocRoute, versionMetadata, children }) {
  const { pluginId, version } = versionMetadata;
  const sidebarName = currentDocRoute.sidebar;
  const sidebar = sidebarName
    ? versionMetadata.docsSidebars[sidebarName]
    : undefined;

  const [hiddenSidebarContainer, setHiddenSidebarContainer] = useState(false);
  const [hiddenSidebar, setHiddenSidebar] = useState(false);
  const toggleSidebar = useCallback(() => {
    if (hiddenSidebar) {
      setHiddenSidebar(false);
    }
    setHiddenSidebarContainer((value) => !value);
  }, [hiddenSidebar]);

  const context: any = useDocusaurusContext();
  const docData = getCurrentDocsData(context, versionMetadata);
  const crumbs = getPageCrumbs(currentDocRoute, sidebar, []);

  return (
    <Layout
      wrapperClassName={ThemeClassNames.wrapper.docsPages}
      pageClassName={ThemeClassNames.page.docsDocPage}
      searchMetadatas={{
        version,
        tag: docVersionSearchTag(pluginId, version),
      }}
    >
      <div className={styles.docPage}>
        <BackToTopButton />

        {sidebar && (
          <aside
            className={clsx(styles.docSidebarContainer, {
              [styles.docSidebarContainerHidden]: hiddenSidebarContainer,
            })}
            onTransitionEnd={(e) => {
              if (
                !e.currentTarget.classList.contains(styles.docSidebarContainer)
              ) {
                return;
              }

              if (hiddenSidebarContainer) {
                setHiddenSidebar(true);
              }
            }}
          >
            <DocSidebar
              key={
                // Reset sidebar state on sidebar changes
                // See https://github.com/facebook/docusaurus/issues/3414
                sidebarName
              }
              sidebar={sidebar}
              path={currentDocRoute.path}
              onCollapse={toggleSidebar}
              isHidden={hiddenSidebar}
            />

            {hiddenSidebar && (
              <div
                className={styles.collapsedDocSidebar}
                title={translate({
                  id: "theme.docs.sidebar.expandButtonTitle",
                  message: "Expand sidebar",
                  description:
                    "The ARIA label and title attribute for expand button of doc sidebar",
                })}
                aria-label={translate({
                  id: "theme.docs.sidebar.expandButtonAriaLabel",
                  message: "Expand sidebar",
                  description:
                    "The ARIA label and title attribute for expand button of doc sidebar",
                })}
                tabIndex={0}
                role="button"
                onKeyDown={toggleSidebar}
                onClick={toggleSidebar}
              >
                <IconArrow className={styles.expandSidebarButtonIcon} />
              </div>
            )}
          </aside>
        )}
        <main
          className={clsx(styles.docMainContainer, {
            [styles.docMainContainerEnhanced]:
              hiddenSidebarContainer || !sidebar,
          })}
        >
          <div
            className={clsx(
              "container padding-top--md padding-bottom--lg",
              styles.docItemWrapper,
              {
                [styles.docItemWrapperEnhanced]: hiddenSidebarContainer,
              }
            )}
          >
            {/* <pre>{JSON.stringify(currentDoc, null, 2)}</pre>
            <pre>{JSON.stringify(customFields?.docsData, null, 2)}</pre> */}
            <Breadcrumbs links={crumbs} docData={docData} />
            <MDXProvider components={MDXComponents}>{children}</MDXProvider>
          </div>
        </main>
      </div>
    </Layout>
  );
}

function DocPage(props) {
  const {
    route: { routes: docRoutes },
    versionMetadata,
    location,
  } = props;
  const currentDocRoute = docRoutes.find((docRoute) =>
    matchPath(location.pathname, docRoute)
  );

  if (!currentDocRoute) {
    return <NotFound {...props} />;
  }

  return (
    <>
      <Head>
        {/* TODO we should add a core addRoute({htmlClassName}) generic plugin option */}
        <html className={versionMetadata.className} />
      </Head>
      {/* <pre>{JSON.stringify(props, null, 2)}</pre> */}
      <DocPageContent
        currentDocRoute={currentDocRoute}
        versionMetadata={versionMetadata}
      >
        {renderRoutes(docRoutes, {
          versionMetadata,
        })}
      </DocPageContent>
    </>
  );
}

export default DocPage;
