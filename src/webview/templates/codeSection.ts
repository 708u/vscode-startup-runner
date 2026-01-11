import { escapeHtml } from "../../utils/html";
import { icons } from "../icons";

export interface CodeSectionProps {
  fileName: string;
  highlightedContent: string;
}

export function renderCodeSection(props: CodeSectionProps): string {
  const { fileName, highlightedContent } = props;

  return `
    <div class="code-section">
      <div class="code-header">
        <span class="code-header-title">
          ${icons.terminal}
          ${escapeHtml(fileName)}
        </span>
      </div>
      <div class="code-container">
        <div class="code-content">
          <code>${highlightedContent}</code>
        </div>
      </div>
    </div>`;
}
