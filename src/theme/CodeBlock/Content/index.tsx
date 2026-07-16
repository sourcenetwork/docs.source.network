import {
  CodeBlockMetadata,
  useCodeBlockContext,
} from "@docusaurus/theme-common/internal";
import type { WrapperProps } from "@docusaurus/types";
import Content from "@theme-original/CodeBlock/Content";
import type ContentType from "@theme/CodeBlock/Content";
import clsx from "clsx";
import { useContext, useId, useState, type ReactNode } from "react";
import { CodeBlockCollapseContext } from "../collapseContext";
import styles from "./styles.module.css";

type Props = WrapperProps<typeof ContentType>;

const MAX_LINES = 8; // keep in sync with max-height in styles.module.css
const LINE_TOLERANCE = 4;

function getLineCount(code: string) {
  return code.split("\n").length;
}

// If the code block is less than 8 lines, we should not collapse it
// If the code block has a title of "Result", we should collapse it by default
function shouldCollapse(metadata: CodeBlockMetadata) {
  if (getLineCount(metadata.code) < MAX_LINES + LINE_TOLERANCE) return false;
  return metadata.title === "Result";
}

export default function ContentWrapper(props: Props): ReactNode {
  const contentId = useId();

  const { metadata } = useCodeBlockContext();
  const { collapsible, collapsed } = useContext(CodeBlockCollapseContext);
  const [expanded, setExpanded] = useState(collapsed === false);

  const lineCount = getLineCount(metadata.code);
  const canCollapse = collapsible ?? shouldCollapse(metadata);

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
