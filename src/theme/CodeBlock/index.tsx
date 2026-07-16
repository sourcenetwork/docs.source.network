import type { ReactNode } from "react";
import CodeBlock from "@theme-original/CodeBlock";
import type CodeBlockType from "@theme/CodeBlock";
import type { WrapperProps } from "@docusaurus/types";
import clsx from "clsx";
import {
  CodeBlockFlagsContext,
  type CodeBlockFlags,
  type Validity,
} from "./flagsContext";
import styles from "./styles.module.css";

type Props = WrapperProps<typeof CodeBlockType>;

// e.g. ```json title="Result" collapse expanded
//   collapse    → force the collapse UI on
//   noCollapse  → force collapsibility off
//   expanded    → start expanded (when collapsible)
//   valid       → frame the block as a valid example
//   invalid     → frame the block as a invalid example
//   result      → mark the block as a result
function parseFenceFlags(metastring = ""): CodeBlockFlags {
  // Strip key="value" / key='value' pairs (e.g. title="How to collapse")
  // so flags only match as bare words on the fence
  const bareWords = metastring.replace(/\w+=("[^"]*"|'[^']*')/g, "");
  const has = (flag: string) => new RegExp(`\\b${flag}\\b`).test(bareWords);
  // First present flag wins; undefined if none are
  const pick = <T,>(...cases: [flag: string, value: T][]) =>
    cases.find(([flag]) => has(flag))?.[1];

  return {
    collapsible: pick(["noCollapse", false], ["collapse", true]),
    collapsed: pick(["expanded", false]),
    validity: pick<Validity>(["invalid", "invalid"], ["valid", "valid"]),
    result: has("result"),
  };
}

export default function CodeBlockWrapper(props: Props): ReactNode {
  const flags = parseFenceFlags(props.metastring);

  // Flag classes ride along on the className prop, which the theme forwards
  // to the .theme-code-block container div — no wrapper element needed.
  const className = clsx(
    props.className,
    // Hashed module class (carries the built-in styling) plus a stable
    // global class as a public styling hook
    flags.validity && [
      styles[flags.validity],
      `codeblock-state-${flags.validity}`,
    ],
    flags.result && "codeblock-result",
  );

  return (
    <CodeBlockFlagsContext.Provider value={flags}>
      <CodeBlock {...props} className={className} />
    </CodeBlockFlagsContext.Provider>
  );
}
