import React, { type ReactNode } from "react";
import CodeBlock from "@theme-original/CodeBlock";
import type CodeBlockType from "@theme/CodeBlock";
import type { WrapperProps } from "@docusaurus/types";
import { CodeBlockCollapseContext } from "./collapseContext";

type Props = WrapperProps<typeof CodeBlockType>;

// e.g. ```json title="Result" collapse expanded
//   collapse    → force the collapse UI on
//   noCollapse  → force it off
//   expanded    → start expanded (when collapsible)
function hasFlag(metastring: string | undefined, flag: string): boolean {
  if (!metastring) return false;
  // Strip key="value" / key='value' pairs (e.g. title="How to collapse")
  // so flags only match as bare words on the fence
  const bareWords = metastring.replace(/\w+=("[^"]*"|'[^']*')/g, "");
  return new RegExp(`\\b${flag}\\b`).test(bareWords);
}

export default function CodeBlockWrapper(props: Props): ReactNode {
  const { metastring } = props;
  const collapsible = hasFlag(metastring, "noCollapse")
    ? false
    : hasFlag(metastring, "collapse")
      ? true
      : undefined;
  const collapsed = hasFlag(metastring, "expanded") ? false : undefined;
  return (
    <CodeBlockCollapseContext.Provider value={{ collapsible, collapsed }}>
      <CodeBlock {...props} />
    </CodeBlockCollapseContext.Provider>
  );
}
