import sanitizeHtml from "sanitize-html";
import { decodeHTML } from "entities";
export const RICH_PREFIX = "<!--qgang-rich:v1-->";
export function safeHref(value: string) {
  const url = value.trim();
  if (/^\/(?!\/)/.test(url) && !/[\\\u0000-\u0020]/.test(url)) return url;
  try {
    const parsed = new URL(url);
    return ["https:", "http:", "mailto:"].includes(parsed.protocol)
      ? parsed.href
      : "";
  } catch {
    return "";
  }
}
export function cleanHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "h2",
      "h3",
      "h4",
      "blockquote",
      "ul",
      "ol",
      "li",
      "a",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "hr",
      "pre",
      "code",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      p: ["style"],
      h2: ["style"],
      h3: ["style"],
      h4: ["style"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
    },
    allowedStyles: { "*": { "text-align": [/^(left|right|center|justify)$/] } },
    allowedSchemes: ["https", "http", "mailto"],
    allowProtocolRelative: false,
    transformTags: {
      a: (_tag, attrs) => ({
        tagName: "a",
        attribs: {
          href: safeHref(attrs.href || ""),
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
    },
  });
}
export function richHtml(value: string) {
  if (value.startsWith(RICH_PREFIX))
    return cleanHtml(value.slice(RICH_PREFIX.length));
  return value
    .split("\n")
    .map(
      (line) =>
        "<p>" +
        line
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;") +
        "</p>",
    )
    .join("");
}
export const MAX_RICH_BYTES = 250000;
export function richPlain(value: string) {
  if (!value.startsWith(RICH_PREFIX)) return value;
  const text = sanitizeHtml(
    value
      .slice(RICH_PREFIX.length)
      .replace(/<br\s*\/?\s*>/gi, "\n")
      .replace(/<\/(p|h[234]|li|tr|blockquote)>/gi, "\n"),
    { allowedTags: [], allowedAttributes: {} },
  );
  return decodeHTML(text).trim();
}
/** Oversized input is left intact so validation rejects it, never silently truncates it. */
export function normalizeRich(value: string) {
  if (value.length > MAX_RICH_BYTES) return value;
  return value.startsWith(RICH_PREFIX)
    ? RICH_PREFIX + cleanHtml(value.slice(RICH_PREFIX.length))
    : value.trim();
}
export function validRich(value: string, max = 50000, min = 0) {
  if (value.length > MAX_RICH_BYTES) return false;
  const length = richPlain(value).trim().length;
  return length >= min && length <= max;
}
