import React from 'react';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import DocItem from '@theme-original/DocItem';

export function shouldNoIndex(url) {
  const {siteConfig} = useDocusaurusContext();

  const patterns = siteConfig.customFields?.noIndexUrls ?? [];

  const noIndex = patterns.some(pattern => {
    const regex = new RegExp(pattern);
    return regex.test(url);
  });

  return noIndex;
}

export default function DocItemWrapper(props) {
  return (
    <>
      {shouldNoIndex(props.content?.metadata?.permalink) && (
        <Head>
          <meta name="robots" content="noindex" />
        </Head>
      )}

      <DocItem {...props} />
    </>
  );
}
