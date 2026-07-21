// This file makes all wished react components available to all pages,
// without having to explicitly import them in each.

//import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import UmamiEvent from '@site/src/components/UmamiEvent';
export default {
  // Reusing and expanding the default mapping
  ...MDXComponents,
  UmamiEvent,
  Tabs,
  TabItem
};