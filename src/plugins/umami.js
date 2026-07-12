// @ts-check

/** @type {(context: unknown, options: { websiteID: string; analyticsDomain: string; scriptName?: string; dataDomains?: string; trackOutboundLinks?: boolean; doNotTrack?: boolean; excludeSearch?: boolean; excludeHash?: boolean; performance?: boolean; enabled?: boolean }) => import('@docusaurus/types').Plugin} */
function umamiPlugin(_context, options) {
  const {
    enabled,
    scriptName = "script.js",
    websiteID,
    dataDomains,
    trackOutboundLinks,
    doNotTrack,
    excludeSearch,
    excludeHash,
    performance,
  } = options;

  const analyticsDomain = options.analyticsDomain ?? "";
  const dom = analyticsDomain.replace(/\/$/, "");
  const hasProtocol = dom.startsWith("http://") || dom.startsWith("https://");
  const isLocal = dom.startsWith("localhost") || dom.startsWith("127.0.0.1");
  const scriptSrc = dom
    ? hasProtocol
      ? `${dom}/${scriptName}`
      : `${isLocal ? "http" : "https"}://${dom}/${scriptName}`
    : "";

  return {
    name: "umami-analytics",
    injectHtmlTags() {
      if (!enabled || !websiteID || !dom) return {};

      const headTags = [
        {
          tagName: "script",
          attributes: {
            defer: true,
            src: scriptSrc,
            "data-website-id": websiteID,
            ...(dataDomains && { "data-domains": dataDomains }),
            ...(doNotTrack && { "data-do-not-track": "true" }),
            ...(excludeSearch && { "data-exclude-search": "true" }),
            ...(excludeHash && { "data-exclude-hash": "true" }),
            ...(performance && { "data-performance": "true" }),
          },
        },
      ];

      const postBodyTags = trackOutboundLinks
        ? [
            {
              tagName: "script",
              innerHTML: `(function(){document.addEventListener('click',function(e){var a=e.target.closest('a');if(a&&a.host&&a.host!==window.location.host&&window.umami){window.umami.track('outbound-link-click',{url:a.href});}});})();`,
            },
          ]
        : [];

      return { headTags, postBodyTags };
    },
  };
}

module.exports = umamiPlugin;
