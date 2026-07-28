// This file makes all wished react components available to all pages,
// without having to explicitly import them in each.

import MDXComponents from '@theme-original/MDXComponents';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import UmamiEvent from '@site/src/components/UmamiEvent';
import type { ComponentProps } from 'react';

// Infima ships `table { display: block; overflow: auto }`, which gives tables
// horizontal scrolling at the cost of never filling their column. We want
// full-width tables, so _tables.scss switches them back to `display: table`
// and this wrapper takes over the scrolling on narrow screens.
function MDXTable(props: ComponentProps<'table'>) {
  return (
    <div className="markdown-table-wrapper">
      <table {...props} />
    </div>
  );
}

export default {
  // Reusing and expanding the default mapping
  ...MDXComponents,
  table: MDXTable,
  UmamiEvent,
  Tabs,
  TabItem
};
