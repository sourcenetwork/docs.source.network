import React from 'react';
import { DefraDBProvider } from '@site/src/components/MiniPlayground';

// This component wraps the entire Docusaurus app with the DefraDBProvider
// Place this file at: src/theme/Root.tsx

export default function Root({ children }: { children: React.ReactNode }) {
  return <DefraDBProvider>{children}</DefraDBProvider>;
}