/**
 * After `next build` (standalone), copy the local GCS service account JSON into
 * `.next/standalone/credentials/` so Cloud Run / Docker images that only ship the
 * standalone bundle still find the key at runtime (when the file exists in the
 * build context — it is gitignored and must be present for private builds).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const candidates = [
  path.join(root, "src/lib/amplified-vine-462115-g9-2cc994038afc.json"),
  path.join(root, "credentials/gcs-sa.json"),
];

const destDir = path.join(root, ".next/standalone/credentials");
const destFile = path.join(destDir, "gcs-sa.json");

function main() {
  const src = candidates.find((p) => fs.existsSync(p));
  if (!src) {
    console.log(
      "[copy-gcs-credentials] No local key file found; skipping (use Secret Manager or Cloud Run SA + bucket IAM in prod).",
    );
    return;
  }
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, destFile);
  console.log(`[copy-gcs-credentials] Copied ${path.relative(root, src)} → ${path.relative(root, destFile)}`);
}

main();
