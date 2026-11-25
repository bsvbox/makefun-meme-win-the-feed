// Entry program for make.fun "Post the Meme, Win the Feed".
// It reads POST.json from the repository root, checks that it names a
// public X status URL, and copies it into the grader output directory.
// It deletes nothing and writes the same bytes on every run.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? join(repoRoot, "output");

const raw = readFileSync(join(repoRoot, "POST.json"), "utf8");
const parsed: unknown = JSON.parse(raw);
if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
  throw new Error("POST.json must be a JSON object");
}
const url = (parsed as Record<string, unknown>).url;
if (typeof url !== "string") {
  throw new Error("POST.json must have a string url field");
}

const standard = url.match(
  /^https?:\/\/(?:www\.|mobile\.)?(?:x\.com|twitter\.com)\/([A-Za-z0-9_]+)\/status\/(\d+)(?:[?#].*)?$/,
);
const webForm = url.match(
  /^https?:\/\/(?:www\.|mobile\.)?(?:x\.com|twitter\.com)\/i\/web\/status\/(\d+)(?:[?#].*)?$/,
);
let cleanUrl: string;
if (standard) {
  cleanUrl = `https://x.com/${standard[1]}/status/${standard[2]}`;
} else if (webForm) {
  cleanUrl = `https://x.com/bsvbox/status/${webForm[1]}`;
} else {
  throw new Error("POST.json url is not an X status URL");
}

// The placeholder id below is the dummy URL the repository ships with
// before the live post exists. Refuse it loudly so a submission can
// never go out with a fake post address.
const statusId = cleanUrl.split("/status/")[1];
if (statusId === "1000000000000000000") {
  throw new Error("POST.json still has the placeholder URL");
}

mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "POST.json");
writeFileSync(outPath, JSON.stringify({ url: cleanUrl }, null, 2) + "\n");
console.log(`copied POST.json -> ${outPath}`);
