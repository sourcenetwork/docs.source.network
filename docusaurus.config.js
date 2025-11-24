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
        docs: false, // Disable the default docs plugin
        proxy: false, // Disable the proxy plugin to avoid webpack-dev-server config errors
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
            docsPluginId: "defradb",
            sidebarId: "defraSidebar",
            label: "DefraDB",
            className: "header-docs-link-defra",
          },
          {
            type: "docSidebar",
            position: "left",
            docsPluginId: "sourcehub",
            sidebarId: "sourcehubSidebar",
            label: "SourceHub",
            className: "header-docs-link-sourcehub",
          },
          {
            type: "docSidebar",
            position: "left",
            docsPluginId: "orbis",
            sidebarId: "orbisSidebar",
            label: "Orbis",
            className: "header-docs-link-orbis",
          },
          {
            type: "docSidebar",
            position: "left",
            docsPluginId: "lensvm",
            sidebarId: "lensvmSidebar",
            label: "LensVM",
            className: "header-docs-link-lensvm",
          },
          {
            type: "docsVersionDropdown",
            position: "right",
            dropdownItemsAfter: [],
            dropdownActiveClassDisabled: true,
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
                href: "https://source.network/discord",
              },
              {
                label: "Twitter",
                href: "https://x.com/edgeofsource",
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
      algolia: {
        appId: "N3M9YBYYQY",
        apiKey: "909584ed5214e2d24ae2a85a5cd8664a",
        indexName: "source-docs",
      },
    }),
  clientModules: [
    require.resolve('./src/components/posthog.js'),
  ],
  plugins: [
    [
      "docusaurus-plugin-sass",
      {
        sassOptions: {
          includePaths: ["./src/css"],
        },
      },
    ],
    // Custom webpack configuration for browser-only packages
    function customWebpackPlugin(context, options) {
      return {
        name: 'custom-webpack-config',
        configureWebpack(config, isServer, utils) {
          return {
            resolve: {
              fallback: isServer ? {} : {
                // Browser fallbacks for Node.js modules
                crypto: require.resolve('crypto-browserify'),
                stream: require.resolve('stream-browserify'),
                buffer: require.resolve('buffer/'),
                process: require.resolve('process/browser'),
                vm: false,
                fs: false,
                path: false,
              },
              alias: {
                // Ensure process is available
                process: 'process/browser',
              },
            },
            plugins: isServer ? [] : [
              new (require('webpack')).ProvidePlugin({
                process: 'process/browser',
                Buffer: ['buffer', 'Buffer'],
              }),
            ],
            module: {
              rules: [
                {
                  test: /\.m?js$/,
                  resolve: {
                    fullySpecified: false, // Disable the behavior for .mjs files
                  },
                },
              ],
            },
            // Mark problematic packages as external during SSR
            externals: isServer ? [
              '@sourcenetwork/acp-js',
              '@sourcenetwork/hublet',
              'multiformats',
              'uint8arrays',
              '@noble/hashes',
              '@noble/curves',
            ] : {},
          };
        },
      };
    },
    // DefraDB instance
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "defradb",
        path: "docs/defradb",
        routeBasePath: "defradb",
        sidebarPath: require.resolve("./sidebars.js"),
        editUrl:
          "https://github.com/sourcenetwork/docs.source.network/edit/master/",
        lastVersion: "0.19.0",
        versions: {
          "0.19.0": {
            banner: "none",
          },
          current: {
            label: "Next",
            path: "next",
            banner: "unreleased",
          },
        },
        // Reorder changelog sidebar
        async sidebarItemsGenerator({
          defaultSidebarItemsGenerator,
          ...args
        }) {
          const sidebarItems = await defaultSidebarItemsGenerator(args);
          return reverseSidebarChangelog(sidebarItems);
        },
      },
    ],
    // SourceHub instance
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "sourcehub",
        path: "docs/sourcehub",
        routeBasePath: "sourcehub",
        sidebarPath: require.resolve("./sidebars.js"),
        editUrl:
          "https://github.com/sourcenetwork/docs.source.network/edit/master/",
        lastVersion: "0.3.2",
        versions: {
          "0.3.2": {
            banner: "none",
          },
          current: {
            label: "Next",
            path: "next",
            banner: "unreleased",
          },
        },
        // Reorder changelog sidebar
        async sidebarItemsGenerator({
          defaultSidebarItemsGenerator,
          ...args
        }) {
          const sidebarItems = await defaultSidebarItemsGenerator(args);
          return reverseSidebarChangelog(sidebarItems);
        },
      },
    ],
    // Orbis instance
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "orbis",
        path: "docs/orbis",
        routeBasePath: "orbis",
        sidebarPath: require.resolve("./sidebars.js"),
        editUrl:
          "https://github.com/sourcenetwork/docs.source.network/edit/master/",
        lastVersion: "0.2.3",
        versions: {
          "0.2.3": {
            banner: "none",
          },
          current: {
            label: "Next",
            path: "next",
            banner: "unreleased",
          },
        },
        // Reorder changelog sidebar
        async sidebarItemsGenerator({
          defaultSidebarItemsGenerator,
          ...args
        }) {
          const sidebarItems = await defaultSidebarItemsGenerator(args);
          return reverseSidebarChangelog(sidebarItems);
        },
      },
    ],
    // LensVM instance
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "lensvm",
        path: "docs/lensvm",
        routeBasePath: "lensvm",
        sidebarPath: require.resolve("./sidebars.js"),
        editUrl:
          "https://github.com/sourcenetwork/docs.source.network/edit/master/",
        lastVersion: "0.9.3",
        versions: {
          "0.9.3": {
            banner: "none",
          },
          current: {
            label: "Next",
            path: "next",
            banner: "unreleased",
          },
        },
        // Reorder changelog sidebar
        async sidebarItemsGenerator({
          defaultSidebarItemsGenerator,
          ...args
        }) {
          const sidebarItems = await defaultSidebarItemsGenerator(args);
          return reverseSidebarChangelog(sidebarItems);
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