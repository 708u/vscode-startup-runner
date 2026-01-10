import * as crypto from "node:crypto";
import type { ContentHash } from "../types";

export function getHash(content: string): ContentHash {
  return crypto.createHash("sha256").update(content).digest("hex");
}
