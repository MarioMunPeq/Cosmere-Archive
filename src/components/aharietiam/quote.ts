/**
 * The quotes in the archive were authored with their own outer quotation
 * marks. The interface owns the typography, so the source marks are stripped
 * once and replaced with a single pair of proper typographic quotes.
 */
export function formatQuote(raw: string): string {
  let body = raw
    .trim()
    .replace(/^["“”]+/, '')
    .replace(/["“”]+$/, '')
    .trim()

  /* Some records may have been written with single quotes instead. */
  if ((body.startsWith("'") && body.endsWith("'")) || (body.startsWith('‘') && body.endsWith('’'))) {
    body = body.slice(1, -1).trim()
  }

  return `“${body}”`
}
