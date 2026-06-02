import createDOMPurify from "isomorphic-dompurify";

const purify = createDOMPurify;

/**
 * Sanitise rich-text HTML produced by the TipTap editor. Allowed tags cover
 * basic formatting + images (whose URLs we control via R2) and external links
 * (forced to noopener noreferrer).
 */
const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "u", "s", "blockquote", "code", "pre",
  "ul", "ol", "li", "a", "h1", "h2", "h3", "h4", "img", "figure", "figcaption",
];
const ALLOWED_ATTR = ["href", "src", "alt", "title", "rel", "target", "class"];

export function sanitizeHtml(dirty: string): string {
  const clean = purify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "input"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
  });
  // Force link safety
  return clean.replace(
    /<a\s+([^>]*?)href="(https?:\/\/[^"]+)"([^>]*)>/gi,
    (_m, pre, href, post) => `<a ${pre}href="${href}" rel="noopener noreferrer" target="_blank"${post}>`,
  );
}
