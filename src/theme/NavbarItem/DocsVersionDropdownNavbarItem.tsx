import {
  useActivePlugin,
  useVersions,
} from '@docusaurus/plugin-content-docs/client';
import type { WrapperProps } from '@docusaurus/types';
import DocsVersionDropdownNavbarItem from '@theme-original/NavbarItem/DocsVersionDropdownNavbarItem';
import type DocsVersionDropdownNavbarItemType from '@theme/NavbarItem/DocsVersionDropdownNavbarItem';
import clsx from 'clsx';
import type { MouseEvent, ReactNode } from 'react';

type Props = WrapperProps<typeof DocsVersionDropdownNavbarItemType>;

const PLUGIN_IDS = ['defradb', 'orbis', 'lensvm'];

function ProductVersionDropdown({
  props,
  pluginId,
  isActive,
}: {
  props: Props;
  pluginId: string;
  isActive: boolean;
}): ReactNode {
  const versions = useVersions(pluginId);
  const itemCount =
    versions.length +
    props.dropdownItemsBefore.length +
    props.dropdownItemsAfter.length;

  const item = (
    <DocsVersionDropdownNavbarItem
      {...props}
      docsPluginId={pluginId}
      {...(itemCount <= 1 && {
        className: clsx(props.className, 'version-picker--inert'),
        onClick: (event: MouseEvent<HTMLAnchorElement>) =>
          event.preventDefault(),
      })}
    />
  );

  if (props.mobile) {
    return item;
  }

  return (
    <div
      style={{
        gridColumn: 1,
        gridRow: 1,
        visibility: isActive ? 'visible' : 'hidden',
        pointerEvents: isActive ? 'auto' : 'none',
      }}>
      {item}
    </div>
  );
}

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

  if (props.mobile) {
    return activePlugin ? (
      <ProductVersionDropdown
        props={props}
        pluginId={activePlugin.pluginId}
        isActive
      />
    ) : null;
  }

  return (
    <div
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: '1fr',
        justifyItems: 'end',
      }}>
      {PLUGIN_IDS.map((pluginId) => (
        <ProductVersionDropdown
          key={pluginId}
          props={props}
          pluginId={pluginId}
          isActive={activePlugin?.pluginId === pluginId}
        />
      ))}
    </div>
  );
}
