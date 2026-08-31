import * as cheerio from "cheerio";
import type { RawItem, SourceAdapter } from "./types";

/**
 * מינהל הרכש הממשלתי (mr.gov.il) — the SAP-Commerce ("ilgstorefront") portal
 * that carries tenders for every government ministry except the Ministry of
 * Defense. This is the highest-value source named in the handoff doc, so it
 * is the first adapter built.
 *
 * IMPORTANT: this environment has no outbound access to mr.gov.il (the
 * sandbox's network policy blocks it), so the selectors below could not be
 * verified against the live DOM. They target the markup pattern typical of
 * this storefront platform (a result list of `.SearchResult`-style cards
 * with a title link and a metadata row), but MUST be checked — and likely
 * adjusted — against the real page before this adapter is trusted in
 * production. `npm run scan:mr-gov-il -- --dry-run` prints what it parses
 * without writing to the database, which is the fastest way to verify it.
 */
export function createMrGovIlAdapter(): SourceAdapter {
  const sourceUrl = "https://mr.gov.il/ilgstorefront/he/search/?s=TENDER";

  return {
    bodyName: "מינהל הרכש הממשלתי",
    sourceUrl,
    async fetch(): Promise<RawItem[]> {
      const res = await fetch(sourceUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; ColactiveBot/1.0; +https://collactive.co.il)",
          "Accept-Language": "he-IL,he;q=0.9",
        },
      });
      if (!res.ok) {
        throw new Error(`mr.gov.il responded with HTTP ${res.status}`);
      }
      const html = await res.text();
      return parseResults(html, sourceUrl);
    },
  };
}

export function parseResults(html: string, baseUrl: string): RawItem[] {
  const $ = cheerio.load(html);
  const items: RawItem[] = [];

  $(".SearchResult, .product-item, [data-product-code]").each((_, el) => {
    const card = $(el);
    const titleLink = card.find("a.name, a.product-title, a").first();
    const title = titleLink.text().trim();
    if (!title) return;

    const href = titleLink.attr("href");
    if (!href) return;
    const docsUrl = new URL(href, baseUrl).toString();

    const externalRef = card.find(".tender-number, .procedure-number").first().text().trim() || undefined;
    const summary = card.find(".description, .summary").first().text().trim() || undefined;

    items.push({
      title,
      docsUrl,
      externalRef,
      summary,
    });
  });

  return items;
}
