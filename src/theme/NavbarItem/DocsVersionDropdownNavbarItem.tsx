import { useActivePlugin } from '@docusaurus/plugin-content-docs/client';
import type { WrapperProps } from '@docusaurus/types';
import DocsVersionDropdownNavbarItem from '@theme-original/NavbarItem/DocsVersionDropdownNavbarItem';
import type DocsVersionDropdownNavbarItemType from '@theme/NavbarItem/DocsVersionDropdownNavbarItem';
import type { ReactNode } from 'react';

type Props = WrapperProps<typeof DocsVersionDropdownNavbarItemType>;

const PLUGIN_IDS = ['defradb', 'sourcehub', 'orbis', 'lensvm'];

// Every product's dropdown is rendered stacked in one grid cell, with only the
// active one visible. Hidden items still take part in layout, so the cell is
// sized to the longest version label of the four — the navbar doesn't shift
// when moving between products.
//
// justify-items: end keeps the trigger against the right edge of that reserved
// width, so it stays put relative to the items after it rather than leaving a
// gap that changes size per product.
export default function DocsVersionDropdownNavbarItemWrapper(
  props: Props,
): ReactNode {
  const activePlugin = useActivePlugin({ failfast: false });

  return (
    <div
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: '1fr',
        justifyItems: 'end',
      }}>
      {PLUGIN_IDS.map((pluginId) => {
        const isActive = activePlugin?.pluginId === pluginId;
        return (
          <div
            key={pluginId}
            style={{
              gridColumn: 1,
              gridRow: 1,
              visibility: isActive ? 'visible' : 'hidden',
              pointerEvents: isActive ? 'auto' : 'none',
            }}>
            <DocsVersionDropdownNavbarItem {...props} docsPluginId={pluginId} />
          </div>
        );
      })}
    </div>
  );
}
