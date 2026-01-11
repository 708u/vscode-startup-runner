import { escapeHtml } from "../../utils/html";
import { icons } from "../icons";

export interface HeaderProps {
  fileName: string;
  filePath: string;
  shortHash: string;
  lineCount: number;
  isChanged: boolean;
}

export function renderHeader(props: HeaderProps): string {
  const { fileName, filePath, shortHash, lineCount, isChanged } = props;

  return `
    <div class="header">
      <div class="status-icon ${isChanged ? "changed" : "new"}">
        ${isChanged ? icons.fileChanged : icons.fileNew}
      </div>
      <div class="header-content">
        <h1 class="title">
          ${isChanged ? "File Changed: " : "Execute "}<span class="file-name">${escapeHtml(fileName)}</span>${isChanged ? "" : "?"}
        </h1>
        <p class="subtitle">${escapeHtml(filePath)}</p>
        <div class="meta">
          <span class="change-badge ${isChanged ? "changed" : "new"}">
            ${isChanged ? "Modified" : "New"}
          </span>
          <span class="meta-item">
            ${icons.lock}
            Hash: <span class="hash">${escapeHtml(shortHash)}</span>
          </span>
          <span class="meta-item">
            ${icons.fileLines}
            ${lineCount} lines
          </span>
        </div>
      </div>
    </div>`;
}
