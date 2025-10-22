import React from 'react';
import DocsVersionDropdownNavbarItem from '@theme-original/NavbarItem/DocsVersionDropdownNavbarItem';
import {useActivePlugin} from '@docusaurus/plugin-content-docs/client';

export default function DocsVersionDropdownNavbarItemWrapper(props) {
  const activePlugin = useActivePlugin({failfast: false});

  // Render all dropdowns stacked on top of each other
  // Use opacity and pointer-events to show/hide without layout shift
  const pluginIds = ['defradb', 'sourcehub', 'orbis', 'lensvm'];

  return (
    <div style={{
      position: 'relative',
      display: 'grid',
      gridTemplateColumns: '1fr',
      gridTemplateRows: '1fr',
    }}>
      {/* Invisible spacers to reserve space - all plugins rendered to find max width */}
      {pluginIds.map((pluginId) => (
        <div
          key={`spacer-${pluginId}`}
          style={{
            gridColumn: 1,
            gridRow: 1,
            visibility: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <DocsVersionDropdownNavbarItem {...props} docsPluginId={pluginId} />
        </div>
      ))}
      {/* Visible dropdowns */}
      {pluginIds.map((pluginId) => {
        const isActive = activePlugin?.pluginId === pluginId;
        return (
          <div
            key={pluginId}
            style={{
              gridColumn: 1,
              gridRow: 1,
              opacity: isActive ? 1 : 0,
              pointerEvents: isActive ? 'auto' : 'none',
              visibility: isActive ? 'visible' : 'hidden',
            }}
          >
            <DocsVersionDropdownNavbarItem {...props} docsPluginId={pluginId} />
          </div>
        );
      })}
    </div>
  );
}
