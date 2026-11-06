// Live check that every source and tool URL in the guide still resolves. Needs network, so it runs
// on a schedule (.github/workflows/links.yml), not on pull requests.
// Run: node --experimental-strip-types scripts/check-source-links.mjs
import { checkAll, citedUrls } from "../src/factory/links.ts";

const results = await checkAll(citedUrls());
const bad = results.filter((r) => !r.ok);
console.log(`Checked ${results.length} URLs, ${bad.length} did not resolve.`);
for (const r of bad) console.log(`- ${r.kind} ${r.id}: ${r.url} (${r.status ?? r.error})`);
process.exit(bad.length ? 1 : 0);
