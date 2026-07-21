import type { WrapperProps } from "@docusaurus/types";
import CodeBlock from "@theme-original/CodeBlock";
import type CodeBlockType from "@theme/CodeBlock";
import clsx from "clsx";
import type { ReactNode } from "react";
import { CodeBlockFlagsContext, type CodeBlockFlags } from "./flagsContext";
import styles from "./styles.module.css";

type Props = WrapperProps<typeof CodeBlockType>;

// e.g. ```json title="Result" collapse expanded
//   collapse    → force the collapse UI on
//   noCollapse  → force collapsibility off
//   expanded    → start expanded (when collapsible)
//   valid       → frame the block as a valid example
//   invalid     → frame the block as a invalid example
//   result      → mark the block as a result
function parseMetastringFlags(metastring = ""): CodeBlockFlags {
  // Strip key="value" / key='value' pairs (e.g. title="How to collapse")
  // so flags only match as bare words on the metastring
  const bareWords = metastring.replace(/\w+=("[^"]*"|'[^']*')/g, "");
  const has = (flag: string) => new RegExp(`\\b${flag}\\b`).test(bareWords);
  // First present flag wins; undefined if none are
  const pick = (...cases: [flag: string, value: boolean][]) =>
    cases.find(([flag]) => has(flag))?.[1];

  // invalid wins if both flags are present on the same fence
  const invalid = has("invalid");

  return {
    collapsible: pick(["noCollapse", false], ["collapse", true]),
    collapsed: pick(["expanded", false]),
    valid: has("valid") && !invalid,
    invalid,
    result: has("result"),
  };
}

export default function CodeBlockWrapper(props: Props): ReactNode {
  const flags = parseMetastringFlags(props.metastring);

  const validity = flags.invalid
    ? "invalid"
    : flags.valid
      ? "valid"
      : undefined;

  // Flag classes ride along on the className prop, which the theme forwards
  // to the .theme-code-block container div — no wrapper element needed.
  const className = clsx(
    props.className,
    // Hashed module class (carries the built-in styling) plus a stable
    // global class as a public styling hook
    validity && [styles[validity], `codeblock-state-${validity}`],
    flags.result && "codeblock-result",
  );

  return (
    <CodeBlockFlagsContext.Provider value={flags}>
      <CodeBlock {...props} className={className} />
    </CodeBlockFlagsContext.Provider>
  );
}
