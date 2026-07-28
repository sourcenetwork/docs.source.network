import { processAdmonitionProps } from '@docusaurus/theme-common';
import Admonition from '@theme-original/Admonition';
import type { Props } from '@theme/Admonition';
import clsx from 'clsx';
import type { ReactNode } from 'react';

// Admonitions render icon-only by default — see _admonitions.scss, which drops
// the "NOTE" / "TIP" type labels. A title the author actually wrote should
// still show, so flag those for the stylesheet.
//
// Default titles come from each type's own defaultProps further down the tree
// and never reach this wrapper, so any title visible here is an authored one.
// processAdmonitionProps resolves both syntaxes: `:::tip[Key Points]` arrives
// as a prop, while the legacy `:::tip Key Points` arrives as an
// <mdxAdmonitionTitle> child instead.
export default function AdmonitionWrapper(props: Props): ReactNode {
  const { title } = processAdmonitionProps(props);

  return (
    <Admonition
      {...props}
      className={clsx(props.className, title ? 'admonition--titled' : undefined)}
    />
  );
}
