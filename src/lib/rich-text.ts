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
      "code", "figure", "figcaption", "img", "iframe", "aside", "div",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      figure: ["data-width"], img: ["src", "alt", "loading"], iframe: ["src", "title", "loading", "allowfullscreen", "referrerpolicy"], aside: ["data-tone"], div: ["data-divider"],
      p: ["style"],
      h2: ["style"],
      h3: ["style"],
      h4: ["style"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
    },
    exclusiveFilter: frame => ["img", "iframe"].includes(frame.tag) && !frame.attribs.src,
    allowedStyles: { "*": { "text-align": [/^(left|right|center|justify)$/] } },
    allowedSchemes: ["https", "http", "mailto"],
    allowProtocolRelative: false,
    transformTags: {
      img: (_tag, attrs) => ({tagName:"img", attribs:{src:mediaUrl(attrs.src||""),alt:attrs.alt||"",loading:"lazy"}}),
      iframe: (_tag, attrs) => ({tagName:"iframe",attribs:{src:videoEmbed(attrs.src||""),title:attrs.title||"Video",loading:"lazy",allowfullscreen:"",referrerpolicy:"strict-origin-when-cross-origin"}}),
      aside: (_tag, attrs) => ({tagName:"aside",attribs:{"data-tone":["info","warning","important"].includes(attrs["data-tone"])?attrs["data-tone"]:"info"}}),
      div: (_tag, attrs) => ({tagName:"div",attribs:{...(attrs["data-divider"]?{"data-divider":"true"}:{})}}),
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
      .replace(/<\/(p|h[234]|li|tr|blockquote|figcaption|aside|div)>/gi, "\n"),
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

/** Only HTTPS media; never data URLs, inline SVG, or arbitrary embeds. */
export function mediaUrl(value: string) {
  try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password ? u.href : ''; } catch { return ''; }
}
export function videoEmbed(value: string) {
  try {
    const u = new URL(value); if(u.protocol !== 'https:') return '';
    const host=u.hostname.toLowerCase();
    let id='';
    if(host==='youtu.be') id=u.pathname.slice(1);
    if(['youtube.com','www.youtube.com','m.youtube.com'].includes(host)) id=u.searchParams.get('v') || u.pathname.match(/^\/(?:embed|shorts)\/([^/]+)$/)?.[1] || '';
    if(host==='www.youtube-nocookie.com') id=u.pathname.match(/^\/embed\/([^/]+)$/)?.[1] || '';
    return /^[\w-]{11}$/.test(id) ? 'https://www.youtube-nocookie.com/embed/'+id : '';
  } catch { return ''; }
}

/** Ordered PDF blocks from already sanitized HTML; video is a link on paper. */
export function documentBlocks(value:string):Array<{kind:"text"|"image"|"video";text:string;src?:string}>{
  if(!value.startsWith(RICH_PREFIX)) return [{kind:"text",text:value}];
  const html=richHtml(value), result:Array<{kind:"text"|"image"|"video";text:string;src?:string}>=[];
  const pattern=/<figure\b[^>]*>[\s\S]*?<\/figure>|<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi;
  let cursor=0;
  const attr=(tag:string,name:string)=>decodeHTML(tag.match(new RegExp(name+'="([^"]*)"'))?.[1]||"");
  for(const match of html.matchAll(pattern)){
    if(match.index!>cursor)result.push({kind:"text",text:richPlain(RICH_PREFIX+html.slice(cursor,match.index))});
    const markup=match[0],image=markup.startsWith("<figure"),tag=markup.match(image?/<img\b[^>]*>/:/<iframe\b[^>]*>/)?.[0]||"";
    result.push({kind:image?"image":"video",src:attr(tag,"src"),text:image?richPlain(RICH_PREFIX+(markup.match(/<figcaption>([\s\S]*?)<\/figcaption>/)?.[1]||""))||attr(tag,"alt"):attr(tag,"title")});
    cursor=match.index!+markup.length;
  }
  if(cursor<html.length)result.push({kind:"text",text:richPlain(RICH_PREFIX+html.slice(cursor))});return result;
}
