const DIRECTIVE_NAME = "demo";
const SOURCE_LANGUAGE = "md";
const SUMMARY = "Show markdown";

interface Node {
  type: string;
  name?: string;
  data?: { directiveLabel?: boolean };
  position?: { start?: { offset?: number }; end?: { offset?: number } };
  children?: Node[];
  [key: string]: unknown;
}

interface File {
  value?: unknown;
}

function isDemo(node: Node): boolean {
  return node.type === "containerDirective" && node.name === DIRECTIVE_NAME;
}

function withoutLabel(children: Node[]): Node[] {
  return children.filter((child) => !child.data?.directiveLabel);
}

function expand(node: Node, source: string): Node[] {
  const children = withoutLabel(node.children ?? []);
  const first = children[0];
  const last = children[children.length - 1];
  if (!first || !last) {
    return [];
  }

  const start = first.position?.start?.offset;
  const end = last.position?.end?.offset;

  if (typeof start !== "number" || typeof end !== "number") {
    return children;
  }

  const sourceBlock: Node = {
    type: "code",
    lang: SOURCE_LANGUAGE,
    meta: null,
    value: source.slice(start, end).trim(),
  };

  const toggle: Node = {
    type: "mdxJsxFlowElement",
    name: "details",
    attributes: [
      { type: "mdxJsxAttribute", name: "className", value: "demo-source" },
    ],
    children: [
      {
        type: "mdxJsxFlowElement",
        name: "summary",
        attributes: [],
        children: [{ type: "text", value: SUMMARY }],
      },
      sourceBlock,
    ],
  };

  return [...children, toggle];
}

function transform(parent: Node, source: string): void {
  if (!Array.isArray(parent.children)) {
    return;
  }

  const result: Node[] = [];
  for (const child of parent.children) {
    const expanded = isDemo(child) ? expand(child, source) : [child];
    for (const node of expanded) {
      transform(node, source);
      result.push(node);
    }
  }
  parent.children = result;
}

export default function remarkDemo() {
  return (tree: Node, file: File): void => {
    const source = String(file.value ?? "");
    if (source) {
      transform(tree, source);
    }
  };
}
