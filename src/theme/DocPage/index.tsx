import React from 'react';
import clsx from 'clsx';
import {
  HtmlClassNameProvider,
  ThemeClassNames,
  PageMetadata,
} from '@docusaurus/theme-common';
import {
  getDocsVersionSearchTag,
  DocsSidebarProvider,
  DocsVersionProvider,
  useDocRootMetadata,
} from '@docusaurus/plugin-content-docs/client';
import DocPageLayout from '@theme/DocPage/Layout';
import NotFound from '@theme/NotFound';
import SearchMetadata from '@theme/SearchMetadata';
function DocPageMetadata(props) {
  const {versionMetadata} = props;
  return (
    <>
      <SearchMetadata
        version={versionMetadata.version}
        tag={getDocsVersionSearchTag(
          versionMetadata.pluginId,
          versionMetadata.version,
        )}
      />
      <PageMetadata>
        {versionMetadata.noIndex && (
          <meta name="robots" content="noindex, nofollow" />
        )}
      </PageMetadata>
    </>
  );
}
export default function DocPage(props) {
  const {versionMetadata} = props;
  const currentDocRouteMetadata = useDocRootMetadata(props);
  if (!currentDocRouteMetadata) {
    return <NotFound />;
  }
  const {docElement, sidebarName, sidebarItems} = currentDocRouteMetadata;
  return (
    <>
      <DocPageMetadata {...props} />
      <HtmlClassNameProvider
        className={clsx(
          // TODO: it should be removed from here
          ThemeClassNames.wrapper.docsPages,
          ThemeClassNames.page.docsDocPage,
          props.versionMetadata.className,
        )}>
        <DocsVersionProvider version={versionMetadata}>
          <DocsSidebarProvider name={sidebarName} items={sidebarItems}>
            <DocPageLayout>{docElement}</DocPageLayout>
          </DocsSidebarProvider>
        </DocsVersionProvider>
      </HtmlClassNameProvider>
    </>
  );
}
