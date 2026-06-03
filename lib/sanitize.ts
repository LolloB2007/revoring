import sanitizeHtmlLib from "sanitize-html";

/**
 * Sanitise rich-text HTML coming out of the TipTap editor or pasted into the
 * admin pages editor. Pure JS — no jsdom dependency — so it bundles cleanly
 * on every runtime (Vercel Node, Edge, local dev).
 *
 * Allowed tags cover basic formatting + images (whose src we host) and links
 * (forced to noopener / noreferrer / target=_blank).
 */
const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "u", "s", "blockquote", "code", "pre",
  "ul", "ol", "li", "a", "h1", "h2", "h3", "h4",
  "img", "figure", "figcaption",
];

export function sanitizeHtml(dirty: string): string {
  return sanitizeHtmlLib(dirty, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "title", "rel", "target", "class"],
      img: ["src", "alt", "title", "width", "height", "class"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https", "data"] },
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
    },
    disallowedTagsMode: "discard",
  });
}
