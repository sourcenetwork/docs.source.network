import React from 'react';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import DocItem from '@theme-original/DocItem';

export default function DocItemWrapper(props) {
  const {siteConfig} = useDocusaurusContext();
  const permalink = props.content?.metadata?.permalink;

  const patterns = siteConfig.customFields?.noIndexUrls ?? [];

  const noIndex = patterns.some(
    pattern => permalink.startsWith(pattern)
  );

  return (
    <>
      {noIndex && (
        <Head>
          <meta name="robots" content="noindex" />
        </Head>
      )}

      <DocItem {...props} />
    </>
  );
}
