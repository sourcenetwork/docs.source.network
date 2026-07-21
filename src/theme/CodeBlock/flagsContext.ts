import { createContext } from "react";

export type CodeBlockFlags = {
  collapsible?: boolean;
  collapsed?: boolean;
  valid?: boolean;
  invalid?: boolean;
  result?: boolean;
};

// Custom metastring-flag bridged from the root CodeBlock wrapper
export const CodeBlockFlagsContext = createContext<CodeBlockFlags>({});
