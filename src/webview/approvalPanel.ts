import * as path from "node:path";
import Prism from "prismjs";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-markdown";
import * as vscode from "vscode";
import { WEBVIEW_ID } from "../constants";
import type { ApprovalDecision, PendingExecution } from "../types";
import { escapeHtml } from "../utils/html";

type SupportedLanguage = "bash" | "markdown" | "text";

function detectLanguage(filePath: string): SupportedLanguage {
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

function highlightCode(content: string, language: SupportedLanguage): string {
  if (language === "text" || !Prism.languages[language]) {
    return escapeHtml(content);
  }
  return Prism.highlight(content, Prism.languages[language], language);
}

interface ApprovalOptions {
  isChanged: boolean;
}

function generateApprovalHtml(
  pending: PendingExecution,
  options: ApprovalOptions,
): string {
  const fileName = path.basename(pending.filePath);
  const shortHash = pending.hash.substring(0, 8);
  const { isChanged } = options;
  const language = detectLanguage(pending.filePath);
  const highlightedContent = highlightCode(pending.content, language);

  return `<!DOCTYPE html>
<html>
<head>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: var(--vscode-font-family);
      padding: 24px;
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      min-height: 100vh;
    }

    /* Card Container */
    .card {
      background: var(--vscode-editorWidget-background);
      border: 1px solid var(--vscode-widget-border, var(--vscode-panel-border));
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      max-width: 900px;
      margin: 0 auto;
    }

    /* Header Section */
    .header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 20px 24px;
      background: var(--vscode-editorWidget-background);
      border-bottom: 1px solid var(--vscode-widget-border, var(--vscode-panel-border));
    }

    .status-icon {
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .status-icon svg {
      width: 28px;
      height: 28px;
    }

    .status-icon.new {
      background: var(--vscode-inputValidation-warningBackground, rgba(255, 204, 0, 0.1));
    }

    .status-icon.new svg {
      color: var(--vscode-editorWarning-foreground, #cca700);
    }

    .status-icon.changed {
      background: var(--vscode-inputValidation-warningBackground, rgba(255, 204, 0, 0.1));
    }

    .status-icon.changed svg {
      color: var(--vscode-editorWarning-foreground, #cca700);
    }

    .change-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .change-badge.changed {
      background: rgba(204, 167, 0, 0.2);
      color: #cca700;
    }

    .change-badge.new {
      background: rgba(25, 118, 210, 0.2);
      color: #1976d2;
    }

    .header-content {
      flex: 1;
      min-width: 0;
    }

    .title {
      font-size: 18px;
      font-weight: 600;
      color: var(--vscode-foreground);
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .file-name {
      color: var(--vscode-textLink-foreground);
      word-break: break-all;
    }

    .subtitle {
      font-size: 13px;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 8px;
    }

    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 12px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--vscode-descriptionForeground);
      background: var(--vscode-badge-background, rgba(255, 255, 255, 0.05));
      padding: 4px 10px;
      border-radius: 4px;
    }

    .meta-item svg {
      width: 14px;
      height: 14px;
      opacity: 0.7;
    }

    .hash {
      font-family: var(--vscode-editor-font-family, monospace);
      color: var(--vscode-textPreformat-foreground);
    }

    /* Code Section */
    .code-section {
      padding: 0;
      margin: 16px;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--vscode-editorWidget-border, var(--vscode-panel-border));
      background: var(--vscode-editorWidget-background);
    }

    .code-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      background: var(--vscode-editorWidget-background);
      border-bottom: 1px solid var(--vscode-widget-border, var(--vscode-panel-border));
    }

    .code-header-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 600;
      color: var(--vscode-foreground);
    }

    .code-header-title svg {
      width: 16px;
      height: 16px;
      color: var(--vscode-terminal-ansiGreen, #89d185);
    }

    .code-container {
      max-height: 45vh;
      min-height: 120px;
      overflow: auto;
      background: #282c34;
      padding: 20px 24px;
    }

    /* Custom scrollbar */
    .code-container::-webkit-scrollbar {
      width: 14px;
      height: 14px;
    }

    .code-container::-webkit-scrollbar-track {
      background: var(--vscode-scrollbarSlider-background);
    }

    .code-container::-webkit-scrollbar-thumb {
      background: var(--vscode-scrollbarSlider-hoverBackground);
      border-radius: 7px;
      border: 3px solid transparent;
    }

    .code-container::-webkit-scrollbar-thumb:hover {
      background: var(--vscode-scrollbarSlider-activeBackground);
    }

    .code-content {
      overflow-x: auto;
      background: #282c34;
    }

    .code-content code {
      display: block;
      font-family: var(--vscode-editor-font-family, 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace);
      font-size: 14px;
      line-height: 1.6;
      white-space: pre;
      color: var(--vscode-editor-foreground);
      tab-size: 4;
    }

    /* Prism.js 共通トークンクラス */
    .code-content .token.comment,
    .code-content .token.prolog {
      color: var(--vscode-editorLineNumber-foreground, #6a9955);
      font-style: italic;
    }

    .code-content .token.string,
    .code-content .token.char,
    .code-content .token.url {
      color: var(--vscode-terminal-ansiYellow, #ce9178);
    }

    .code-content .token.keyword,
    .code-content .token.builtin {
      color: var(--vscode-terminal-ansiBlue, #569cd6);
      font-weight: 500;
    }

    .code-content .token.variable,
    .code-content .token.function {
      color: var(--vscode-terminal-ansiCyan, #9cdcfe);
    }

    .code-content .token.operator,
    .code-content .token.punctuation {
      color: var(--vscode-foreground);
    }

    /* Markdown専用トークン */
    .code-content .token.title,
    .code-content .token.important {
      color: var(--vscode-terminal-ansiBlue, #569cd6);
      font-weight: 700;
    }

    .code-content .token.bold {
      font-weight: 700;
    }

    .code-content .token.italic {
      font-style: italic;
    }

    .code-content .token.strike {
      text-decoration: line-through;
    }

    .code-content .token.list {
      color: var(--vscode-terminal-ansiYellow, #ce9178);
    }

    .code-content .token.code {
      color: var(--vscode-terminal-ansiGreen, #89d185);
      background: rgba(255, 255, 255, 0.05);
      padding: 0.1em 0.3em;
      border-radius: 3px;
    }

    /* Bash専用トークン */
    .code-content .token.shebang {
      color: var(--vscode-terminal-ansiMagenta, #c586c0);
      font-weight: 600;
    }

    /* Choice Cards Section */
    .choices {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 16px 24px 24px;
    }

    .choice-card {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 14px 16px;
      border: 1px solid var(--vscode-widget-border, var(--vscode-panel-border));
      border-radius: 8px;
      background: var(--vscode-editorWidget-background);
      cursor: pointer;
      transition: all 0.15s ease;
      outline: none;
      text-align: left;
      width: 100%;
      font-family: var(--vscode-font-family);
    }

    .choice-card:hover {
      background: var(--vscode-list-hoverBackground);
      border-color: var(--vscode-focusBorder);
    }

    .choice-card:focus-visible {
      outline: 2px solid var(--vscode-focusBorder);
      outline-offset: 2px;
    }

    .choice-card:active {
      transform: scale(0.995);
    }

    .choice-card.primary {
      border-color: #1976d2;
      background: #1976d2;
    }

    .choice-card.primary:hover {
      background: #1565c0;
      border-color: #1565c0;
    }

    .choice-card.primary .choice-title,
    .choice-card.primary .choice-desc,
    .choice-card.primary .choice-icon svg {
      color: #fff;
    }

    .choice-card.warning {
      border-color: var(--vscode-editorWarning-foreground, #cca700);
      border-width: 2px;
    }

    .choice-card.warning:hover {
      background: var(--vscode-inputValidation-warningBackground, rgba(255, 204, 0, 0.1));
    }

    .choice-card.danger {
      border-color: var(--vscode-errorForeground);
    }

    .choice-card.danger:hover {
      background: var(--vscode-inputValidation-errorBackground, rgba(255, 0, 0, 0.08));
    }

    .choice-icon {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.08);
    }

    .choice-icon svg {
      width: 22px;
      height: 22px;
      color: var(--vscode-foreground);
    }

    .choice-card.primary .choice-icon {
      background: rgba(255, 255, 255, 0.25);
    }

    .choice-card.primary .choice-icon svg {
      color: #fff;
    }

    .choice-card.secondary .choice-icon {
      background: rgba(128, 128, 128, 0.2);
    }

    .choice-card.secondary .choice-icon svg {
      color: var(--vscode-descriptionForeground);
    }

    .choice-card.warning .choice-icon {
      background: rgba(204, 167, 0, 0.25);
    }

    .choice-card.warning .choice-icon svg {
      color: var(--vscode-editorWarning-foreground, #cca700);
    }

    .choice-card.danger .choice-icon {
      background: rgba(255, 85, 85, 0.2);
    }

    .choice-card.danger .choice-icon svg {
      color: var(--vscode-errorForeground);
    }

    .choice-content {
      flex: 1;
      min-width: 0;
    }

    .choice-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--vscode-foreground);
      margin-bottom: 2px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .choice-desc {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      line-height: 1.4;
    }

    .danger-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: var(--vscode-editorWarning-foreground, #cca700);
      color: #000;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="status-icon ${isChanged ? "changed" : "new"}">
        ${
          isChanged
            ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>`
            : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>`
        }
      </div>
      <div class="header-content">
        <h1 class="title">
          ${
            isChanged ? "File Changed: " : "Execute "
          }<span class="file-name">${escapeHtml(fileName)}</span>${
            isChanged ? "" : "?"
          }
        </h1>
        <p class="subtitle">${escapeHtml(pending.filePath)}</p>
        <div class="meta">
          <span class="change-badge ${isChanged ? "changed" : "new"}">
            ${isChanged ? "Modified" : "New"}
          </span>
          <span class="meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Hash: <span class="hash">${escapeHtml(shortHash)}</span>
          </span>
          <span class="meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            ${pending.content.split("\n").length} lines
          </span>
        </div>
      </div>
    </div>

    <div class="code-section">
      <div class="code-header">
        <span class="code-header-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="4,17 10,11 4,5"/>
            <line x1="12" y1="19" x2="20" y2="19"/>
          </svg>
          Script Content
        </span>
      </div>
      <div class="code-container">
        <div class="code-content">
          <code>${highlightedContent}</code>
        </div>
      </div>
    </div>

    <div class="choices">
      <button class="choice-card primary" onclick="respond('allow')">
        <div class="choice-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22,4 12,14.01 9,11.01"/>
          </svg>
        </div>
        <div class="choice-content">
          <div class="choice-title">Allow Content</div>
          <div class="choice-desc">Approve this exact content. You'll be asked again if the file changes.</div>
        </div>
      </button>

      <button class="choice-card secondary" onclick="respond('once')">
        <div class="choice-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
        </div>
        <div class="choice-content">
          <div class="choice-title">Run Once</div>
          <div class="choice-desc">Execute now without saving approval. You'll be asked again next time.</div>
        </div>
      </button>

      <button class="choice-card warning" onclick="respond('allowByPath')">
        <div class="choice-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div class="choice-content">
          <div class="choice-title">Allow by Path <span class="danger-badge">Dangerous</span></div>
          <div class="choice-desc">Auto-execute even if content changes. Only for trusted dynamic scripts.</div>
        </div>
      </button>

      <button class="choice-card danger" onclick="respond('deny')">
        <div class="choice-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <div class="choice-content">
          <div class="choice-title">Deny</div>
          <div class="choice-desc">Cancel execution and close this dialog.</div>
        </div>
      </button>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    function respond(action) {
      vscode.postMessage({ action });
    }
  </script>
</body>
</html>`;
}

export function requestApproval(
  pending: PendingExecution,
  options: ApprovalOptions = { isChanged: false },
): Promise<ApprovalDecision> {
  const fileName = path.basename(pending.filePath);
  const { isChanged } = options;

  return new Promise((resolve) => {
    let resolved = false;

    const panel = vscode.window.createWebviewPanel(
      WEBVIEW_ID,
      isChanged ? `Changed: ${fileName}` : `Review: ${fileName}`,
      vscode.ViewColumn.One,
      { enableScripts: true },
    );

    panel.webview.html = generateApprovalHtml(pending, options);

    panel.webview.onDidReceiveMessage((message) => {
      if (!resolved) {
        resolved = true;
        resolve(message.action);
        panel.dispose();
      }
    });

    panel.onDidDispose(() => {
      if (!resolved) {
        resolved = true;
        resolve("deny");
      }
    });
  });
}
