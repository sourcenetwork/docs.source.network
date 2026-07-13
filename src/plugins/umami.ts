import type { HtmlTagObject, LoadContext, Plugin } from "@docusaurus/types";

export interface UmamiPluginOptions {
  enabled?: boolean;
  websiteID?: string;
  analyticsDomain?: string;
  scriptName?: string;
  recorder?: boolean;
  recorderScriptName?: string;
  dataDomains?: string;
  trackOutboundLinks?: boolean;
  doNotTrack?: boolean;
  excludeSearch?: boolean;
  excludeHash?: boolean;
  performance?: boolean;
}

export default function umamiPlugin(
  _context: LoadContext,
  options: UmamiPluginOptions
): Plugin {
  const {
    enabled,
    scriptName = "script.js",
    recorderScriptName = "recorder.js",
    websiteID,
    dataDomains,
    trackOutboundLinks,
    doNotTrack,
    excludeSearch,
    excludeHash,
    performance,
    recorder,
  } = options;

  const dom = (options.analyticsDomain ?? "").replace(/\/$/, "");

  if (!enabled || !websiteID || !dom) {
    return { name: "umami-analytics" };
  }

  // analyticsDomain may be a bare domain (assumed https) or a full URL
  // (e.g. http://localhost:3000 for local testing)
  const hasProtocol = dom.startsWith("http://") || dom.startsWith("https://");
  const baseUrl = hasProtocol ? dom : `https://${dom}`;
  const scriptSrc = `${baseUrl}/${scriptName}`;
  const recorderSrc = `${baseUrl}/${recorderScriptName}`;

  return {
    name: "umami-analytics",
    injectHtmlTags() {
      const headTags: HtmlTagObject[] = [
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

      if (recorder) {
        headTags.push({
          tagName: "script",
          attributes: {
            defer: true,
            src: recorderSrc,
            "data-website-id": websiteID,
          },
        });
      }

      const postBodyTags: HtmlTagObject[] = trackOutboundLinks
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
