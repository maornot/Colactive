/**
 * Manual scan runner — for verifying an adapter's selectors against the live
 * site, and for running a real scan from a shell instead of the cron route.
 *
 *   npx tsx scanner/cli.ts mr-gov-il --dry-run   # fetch + parse only, print results
 *   npx tsx scanner/cli.ts mr-gov-il              # fetch, parse, classify, write to Supabase, notify
 */
import { createAdminClient, hasAdminConfig } from "@/lib/supabase/admin";
import { createMrGovIlAdapter } from "./adapters/mr-gov-il";
import { classify, passesGrossFilter } from "./classify";
import { runScan } from "./run";
import type { SourceAdapter } from "./adapters/types";

const ADAPTERS: Record<string, () => SourceAdapter> = {
  "mr-gov-il": createMrGovIlAdapter,
};

async function main() {
  const [name, ...flags] = process.argv.slice(2);
  const adapterFactory = name ? ADAPTERS[name] : undefined;

  if (!adapterFactory) {
    console.error(`Usage: npx tsx scanner/cli.ts <${Object.keys(ADAPTERS).join("|")}> [--dry-run]`);
    process.exit(1);
  }

  const adapter = adapterFactory();

  if (flags.includes("--dry-run")) {
    const raw = await adapter.fetch();
    console.log(`fetched ${raw.length} items from ${adapter.sourceUrl}`);
    for (const item of raw) {
      const relevant = passesGrossFilter(item);
      const { topics, confidence } = relevant ? classify(item) : { topics: [], confidence: 0 };
      console.log(
        JSON.stringify({ title: item.title, docsUrl: item.docsUrl, relevant, topics, confidence }, null, 0)
      );
    }
    return;
  }

  if (!hasAdminConfig) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running a real scan.");
    process.exit(1);
  }

  const result = await runScan(createAdminClient(), [adapter]);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
