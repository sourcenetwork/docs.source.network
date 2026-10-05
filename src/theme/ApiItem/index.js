import React from 'react';
import Head from '@docusaurus/Head';

import ApiItem from '@theme-original/ApiItem';

import { shouldNoIndex } from '../DocItem';

export default function ApiItemWrapper(props) {
  return (
    <>
      {shouldNoIndex(props.content?.metadata?.permalink) && (
        <Head>
          <meta name="robots" content="noindex" />
        </Head>
      )}

      <ApiItem {...props} />
    </>
  );
}
