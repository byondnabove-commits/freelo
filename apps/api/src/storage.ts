import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Object storage (04-s2 §8). Keys look like `org/<orgId>/logo/<uuid>.png`.
// shortcut: local-disk driver only (.data/uploads at the repo root); add the S3/R2 driver
// behind this same interface before the first deployment.
const root = resolve(fileURLToPath(new URL("../../../.data/uploads", import.meta.url)));

function pathFor(key: string): string {
  const full = resolve(join(root, key));
  // Keys are built by the server, but never let one escape the storage root.
  if (!full.startsWith(root)) throw new Error("Invalid storage key");
  return full;
}

export const storage = {
  async put(key: string, bytes: Uint8Array): Promise<void> {
    const path = pathFor(key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, bytes);
  },
  get(key: string): Promise<Buffer> {
    return readFile(pathFor(key));
  },
  async delete(key: string): Promise<void> {
    await rm(pathFor(key), { force: true });
  },
};

/** Real image type from the first bytes, ignoring the file name and the browser's claim. */
export function sniffImageType(bytes: Uint8Array): "image/png" | "image/jpeg" | "image/webp" | null {
  const b = bytes;
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (
    b.length >= 12 &&
    String.fromCharCode(b[0]!, b[1]!, b[2]!, b[3]!) === "RIFF" &&
    String.fromCharCode(b[8]!, b[9]!, b[10]!, b[11]!) === "WEBP"
  )
    return "image/webp";
  return null;
}
