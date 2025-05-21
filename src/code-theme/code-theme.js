const theme = {
  plain: {
    color: "var(--code-foreground)",
    backgroundColor: "var(--code-background)", // assuming background is handled by container
  },
  styles: [
    {
      types: ["comment"],
      style: {
        color: "var(--code-token-comment)",
        fontStyle: "italic",
      },
    },
    {
      types: ["keyword", "builtin", "changed"],
      style: {
        color: "var(--code-token-keyword)",
      },
    },
    {
      types: ["constant", "property", "class-name"],
      style: {
        color: "var(--code-token-constant)",
      },
    },
    {
      types: ["string", "inserted", "attr-value"],
      style: {
        color: "var(--code-token-string)",
      },
    },
    {
      types: ["string-expression"],
      style: {
        color: "var(--code-token-string-expression)",
      },
    },
    {
      types: ["number"],
      style: {
        color: "var(--code-token-number)",
      },
    },
    {
      types: ["punctuation", "operator"],
      style: {
        color: "var(--code-token-punctuation)",
      },
    },
    {
      types: ["function"],
      style: {
        color: "var(--code-token-function)",
      },
    },
    {
      types: ["variable", "parameter"],
      style: {
        color: "var(--code-token-parameter)",
      },
    },
    {
      types: ["attr-name", "maybe-class-name"],
      style: {
        color: "var(--code-token-property)",
      },
    },
    {
      types: ["url", "link"],
      style: {
        color: "var(--code-token-link)",
        textDecoration: "underline",
      },
    },
    {
      types: ["tag"],
      style: {
        color: "var(--code-token-keyword)", // reuse keyword color for tags
      },
    },
    {
      types: ["deleted"],
      style: {
        color: "red",
      },
    },
    {
      types: ["important", "bold"],
      style: {
        fontWeight: "bold",
      },
    },
    {
      types: ["italic"],
      style: {
        fontStyle: "italic",
      },
    },
    {
      types: ["highlight"],
      style: {
        backgroundColor: "var(--code-highlight-color)",
      },
    },
  ],
};

module.exports = theme;
