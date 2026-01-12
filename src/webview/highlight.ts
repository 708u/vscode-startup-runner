import * as path from "node:path";
import Prism from "prismjs";
import "prismjs/components/prism-bash";
import { escapeHtml } from "../utils/html";

export type SupportedLanguage = "bash" | "markdown" | "text";

export function detectLanguage(filePath: string): SupportedLanguage {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".sh":
    case ".bash":
    case ".zsh":
      return "bash";
    case ".md":
    case ".markdown":
      return "markdown";
    default:
      return "text";
  }
}

export function highlightCode(
  content: string,
  language: SupportedLanguage,
): string {
  if (language === "text" || !Prism.languages[language]) {
    return escapeHtml(content);
  }
  return Prism.highlight(content, Prism.languages[language], language);
}
