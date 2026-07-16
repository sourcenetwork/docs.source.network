import { createContext } from "react";

export type CodeBlockCollapse = {
  collapsible?: boolean;
  collapsed?: boolean;
};

// Augment the context with custom metadata from the CodeBlock
export const CodeBlockCollapseContext = createContext<CodeBlockCollapse>({});
