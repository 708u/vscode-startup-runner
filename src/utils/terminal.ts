import * as path from "node:path";
import { TERMINAL_NAME } from "../constants";

export function buildTerminalName(
  taskName: string,
  filePath: string,
  hash: string,
): string {
  const shortHash = hash.slice(0, 7);
  const fileName = path.basename(filePath);
  return `${TERMINAL_NAME}: ${taskName}/${fileName} (${shortHash})`;
}
