// @ts-check

const isProd = process.env.PLAUSIBLE_ENABLED === "true";

/**
 * Builds the script filename from a base name and sorted modifiers.
 * e.g. ("script", ["local"]) => "script.local.js"
 *
 * @param {string} base
 * @param {string[]} modifiers
 * @returns {string}
 */
function buildScriptName(base, modifiers) {
  return [...[base], ...modifiers.sort()].join(".") + ".js";
}

/** @type {(context: unknown, options: { domain: string; plausibleDomain?: string; scriptName?: string; trackLocalhost?: boolean; trackOutboundLinks?: boolean; enabled?: boolean }) => import('@docusaurus/types').Plugin} */
function plausiblePlugin(_context, options) {
  const enabled = options.enabled ?? isProd;
  const host = options.plausibleDomain || "plausible.io";
  const baseName = options.scriptName || "script";
  const modifiers = [];

  if (options.trackLocalhost) modifiers.push("local");
  if (options.trackOutboundLinks) modifiers.push("outbound-links");

  const scriptFile = buildScriptName(baseName, modifiers);

  return {
    name: "plausible-analytics",
    injectHtmlTags() {
      if (!enabled) return {};
      return {
        headTags: [
          {
            tagName: "link",
            attributes: {
              rel: "preconnect",
              href: `https://${host}`,
            },
          },
          {
            tagName: "script",
            attributes: {
              defer: true,
              "data-domain": options.domain,
              src: `https://${host}/js/${scriptFile}`,
            },
          },
        ],
      };
    },
  };
}

module.exports = plausiblePlugin;
