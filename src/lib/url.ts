/** Normalise a user-entered website URL: trims and prepends https:// when the
 *  scheme is missing. Returns null for empty input. Accepts "islandbeyfly.com"
 *  or "https://islandbeyfly.com" alike. */
export function normalizeWebsite(input: string | null | undefined): string | null {
  const v = (input ?? "").trim();
  if (!v) return null;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

/** Strip scheme + trailing slash for a compact display label. */
export function prettyWebsite(url: string): string {
  return url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}
