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
          editUrl: "https://github.com/sourcenetwork/docs.source.network/",
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
      colorMode: {
        // Should we use the prefers-color-scheme media-query,
        // using user system preferences, instead of the hardcoded defaultMode
        respectPrefersColorScheme: false,
      },
      navbar: {
        title: null,
        hideOnScroll: false,
        logo: {
          alt: "Source Developer Hub",
          src: "img/source-light.svg",
          srcDark: "img/source-dark.svg",
        },
        items: [
          {
            href: "https://github.com/sourcenetwork/docs.source.network",
            label: " ",
            position: "right",
            iconName: "GoMarkGithub",
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
            title: "Docs",
            items: [
              {
                label: "Tutorial",
                to: "/intro",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "Stack Overflow",
                href: "https://stackoverflow.com/questions/tagged/docusaurus",
              },
              {
                label: "Discord",
                href: "https://discord.source.network",
              },
              {
                label: "Twitter",
                href: "https://twitter.com/helloSource",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "Blog",
                to: "/blog",
              },
              {
                label: "GitHub",
                href: "https://github.com/sourcenetwork",
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
