// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const variableCodeTheme = require("./src/code-theme/code-theme");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Source Developer Portal",
  tagline: "The Home of Source Developers",
  url: "https://docs.source.network",
  baseUrl: "/",
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "source-developer", // Usually your GitHub org/user name.
  projectName: "source-developer", // Usually your repo name.
  presets: [
    [
      "docusaurus-preset-openapi",
      /** @type {import('docusaurus-preset-openapi').Options} */
      ({
        api: {
          path: "openapi.yml",
          routeBasePath: "/sourcehub/api",
        },
        docs: {
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl:
            "https://github.com/sourcenetwork/docs.source.network/edit/master/",

          // Reorder changelog sidebar
          async sidebarItemsGenerator({
            defaultSidebarItemsGenerator,
            ...args
          }) {
            const sidebarItems = await defaultSidebarItemsGenerator(args);
            return reverseSidebarChangelog(sidebarItems);
          },
        },
        theme: {
          customCss: require.resolve("./src/css/custom.scss"),
        },
      }),
    ],
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      docs: {
        sidebar: {
          autoCollapseCategories: true,
        },
      },
      colorMode: {
        respectPrefersColorScheme: false,
        defaultMode: "dark",
      },
      navbar: {
        title: null,
        hideOnScroll: false,
        logo: {
          alt: "Source Network Documentation",
          src: "img/source-docs-logo_v2.svg",
          srcDark: "img/source-docs-logo-w_v2.svg",
        },
        items: [
          {
            type: "docSidebar",
            position: "left",
            sidebarId: "defraSidebar",
            label: "DefraDB",
            className: "header-docs-link-defra",
          },
          {
            type: "docSidebar",
            position: "left",
            sidebarId: "sourcehubSidebar",
            label: "SourceHub",
            className: "header-docs-link-sourcehub",
          },
          {
            type: "docSidebar",
            position: "left",
            sidebarId: "orbisSidebar",
            label: "Orbis",
            className: "header-docs-link-orbis",
          },
          {
            type: "docSidebar",
            position: "left",
            sidebarId: "lensvmSidebar",
            label: "LensVM",
            className: "header-docs-link-lensvm",
          },
          {
            href: "https://github.com/sourcenetwork/docs.source.network",
            "aria-label": "GitHub repository",
            className: "header-github-link",
            position: "right",
          },
        ],
      },
      footer: {
        logo: {
          alt: "Facebook Open Source Logo",
          src: "img/source-logo_v2.svg",
          srcDark: "img/source-logo-w_v2.svg",
          href: "https://source.network",
        },
        links: [
          {
            title: "Developers",
            items: [
              {
                label: "Getting Started",
                to: "/",
              },
              {
                label: "GitHub",
                href: "https://github.com/sourcenetwork",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "Discord",
                href: "https://discord.source.network",
              },
              {
                label: "Twitter",
                href: "https://twitter.com/sourcenetwrk",
              },
              {
                label: "Telegram",
                href: "https://t.me/source_network",
              },
            ],
          },
          {
            title: "About",
            items: [
              {
                label: "About Us",
                href: "https://source.network/about",
              },
              {
                label: "Privacy Policy",
                href: "https://source.network/privacy",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Source, Inc & Democratized Data Foundation. Built with Docusaurus.`,
      },
      prism: {
        theme: variableCodeTheme,
      },
    }),
  plugins: [
    [
      "docusaurus-plugin-sass",
      {
        sassOptions: {
          includePaths: ["./src/css"],
        },
      },
    ],
  ],
  customFields: {
    docsData: {},
  },
};

module.exports = config;

// Reverse the sidebar items ordering (including nested category items)
function reverseSidebarChangelog(items) {
  // Reverse items in categories
  const result = items.map((item) => {
    if (item.type === "category" && item.label == "Release Notes") {
      return { ...item, items: item.items.reverse() };
    }
    return item;
  });
  return result;
}
