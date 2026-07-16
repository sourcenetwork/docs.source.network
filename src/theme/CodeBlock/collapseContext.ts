import { createContext } from "react";

export type Validity = "valid" | "invalid";

export type CodeBlockCollapse = {
  collapsible?: boolean;
  collapsed?: boolean;
  validity?: Validity;
};

// Augment the context with custom metadata from the CodeBlock
export const CodeBlockCollapseContext = createContext<CodeBlockCollapse>({});
