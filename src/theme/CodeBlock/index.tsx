import React, { type ReactNode } from "react";
import CodeBlock from "@theme-original/CodeBlock";
import type CodeBlockType from "@theme/CodeBlock";
import type { WrapperProps } from "@docusaurus/types";
import { CodeBlockCollapseContext, type Validity } from "./collapseContext";
import styles from "./styles.module.css";

type Props = WrapperProps<typeof CodeBlockType>;

function hasFlag(metastring: string | undefined, flag: string): boolean {
  if (!metastring) return false;
  // Strip key="value" / key='value' pairs (e.g. title="How to collapse")
  // so flags only match as bare words on the fence
  const bareWords = metastring.replace(/\w+=("[^"]*"|'[^']*')/g, "");
  return new RegExp(`\\b${flag}\\b`).test(bareWords);
}

// e.g. ```json title="Result" collapse expanded
//   collapse    → force the collapse UI on
//   noCollapse  → force it off
//   expanded    → start expanded (when collapsible)
//   valid       → frame the block as a correct example
//   invalid     → frame the block as an incorrect example
function parseFenceFlags(metastring: string | undefined) {
  const has = (flag: string) => hasFlag(metastring, flag);

  let collapsible: boolean | undefined;
  if (has("noCollapse")) collapsible = false;
  else if (has("collapse")) collapsible = true;

  let collapsed: boolean | undefined;
  if (has("expanded")) collapsed = false;

  let validity: Validity | undefined;
  if (has("invalid")) validity = "invalid";
  else if (has("valid")) validity = "valid";

  return { collapsible, collapsed, validity };
}

export default function CodeBlockWrapper(props: Props): ReactNode {
  const flags = parseFenceFlags(props.metastring);

  const block = (
    <CodeBlockCollapseContext.Provider value={flags}>
      <CodeBlock {...props} />
    </CodeBlockCollapseContext.Provider>
  );

  return flags.validity ? (
    <div className={styles[flags.validity]}>{block}</div>
  ) : (
    block
  );
}
