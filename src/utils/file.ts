import * as fs from "fs";

export function tryReadFile(filePath: string): string | null {
  try {
    const content = fs.readFileSync(filePath, "utf-8").trim();
    return content || null;
  } catch {
    return null;
  }
}
