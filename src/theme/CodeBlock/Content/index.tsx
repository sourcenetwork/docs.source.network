import { useCodeBlockContext } from "@docusaurus/theme-common/internal";
import type { WrapperProps } from "@docusaurus/types";
import Content from "@theme-original/CodeBlock/Content";
import type ContentType from "@theme/CodeBlock/Content";
import clsx from "clsx";
import { useContext, useId, useState, type ReactNode } from "react";
import { CodeBlockFlagsContext } from "../flagsContext";
import styles from "./styles.module.css";

type Props = WrapperProps<typeof ContentType>;

const MAX_LINES = 8; // keep in sync with max-height in styles.module.css
const LINE_TOLERANCE = 4;

function getLineCount(code: string) {
  return code.split("\n").length;
}

// Blocks flagged `result` collapse by default once they exceed the threshold;
// shorter blocks aren't worth collapsing
function shouldCollapse(lineCount: number, isResult: boolean | undefined) {
  return Boolean(isResult) && lineCount >= MAX_LINES + LINE_TOLERANCE;
}

export default function ContentWrapper(props: Props): ReactNode {
  const contentId = useId();

  const { metadata } = useCodeBlockContext();
  const { collapsible, collapsed, result } = useContext(CodeBlockFlagsContext);
  const [expanded, setExpanded] = useState(collapsed === false);

  const lineCount = getLineCount(metadata.code);
  const canCollapse = collapsible ?? shouldCollapse(lineCount, result);

  if (!canCollapse) return <Content {...props} />;

  return (
    <div
      id={contentId}
      className={clsx(styles.collapsibleBlock, !expanded && styles.collapsed)}
    >
      <Content {...props} />

      <button
        type="button"
        className={styles.toggleButton}
        aria-expanded={expanded}
        aria-controls={contentId}
        onClick={() => setExpanded((value) => !value)}
      >
        {expanded ? "Collapse" : `Expand (${lineCount} lines)`}
      </button>
    </div>
  );
}
