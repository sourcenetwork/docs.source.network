import React from 'react';
import DocsVersionDropdownNavbarItem from '@theme-original/NavbarItem/DocsVersionDropdownNavbarItem';
import {useActivePlugin} from '@docusaurus/plugin-content-docs/client';

export default function DocsVersionDropdownNavbarItemWrapper(props) {
  const activePlugin = useActivePlugin({failfast: false});

  // Render all dropdowns stacked on top of each other
  // Use opacity and pointer-events to show/hide without layout shift
  const pluginIds = ['defradb', 'sourcehub', 'orbis', 'lensvm'];

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      {pluginIds.map((pluginId, index) => {
        const isActive = activePlugin?.pluginId === pluginId;
        return (
          <div
            key={pluginId}
            style={{
              position: index === 0 ? 'relative' : 'absolute',
              top: 0,
              left: 0,
              opacity: isActive ? 1 : 0,
              pointerEvents: isActive ? 'auto' : 'none',
              transition: 'opacity 0s',
            }}
          >
            <DocsVersionDropdownNavbarItem {...props} docsPluginId={pluginId} />
          </div>
        );
      })}
    </div>
  );
}
