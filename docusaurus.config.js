// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("./src/code-theme/code-theme-light");
const darkCodeTheme = require("prism-react-renderer/themes/oceanicNext");

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
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl:
            "https://github.com/sourcenetwork/docs.source.network/edit/master/",
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
        // Should we use the prefers-color-scheme media-query,
        // using user system preferences, instead of the hardcoded defaultMode
        respectPrefersColorScheme: false,
      },
      navbar: {
        title: null,
        hideOnScroll: false,
        logo: {
          alt: "Source Network Documentation",
          src: "img/source-docs-full-light.svg",
          srcDark: "img/source-docs-full-dark.svg",
        },
        items: [
          {
            type: "docSidebar",
            position: "left",
            sidebarId: "mainSidebar",
            label: "Docs",
            className: "header-docs-link",
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
          src: "img/source-full-light.svg",
          srcDark: "img/source-full-dark.svg",
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
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
  plugins: ["docusaurus-plugin-sass"],
  customFields: {
    docsData: {},
  },
};

module.exports = config;
