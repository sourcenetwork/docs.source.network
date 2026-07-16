import { createContext } from "react";

export type Validity = "valid" | "invalid";

export type CodeBlockFlags = {
  collapsible?: boolean;
  collapsed?: boolean;
  validity?: Validity;
  result?: boolean;
};

// Custom fence-flag metadata bridged from the root CodeBlock wrapper
export const CodeBlockFlagsContext = createContext<CodeBlockFlags>({});
