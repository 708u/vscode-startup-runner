import * as vscode from "vscode";
import * as path from "path";
import { WEBVIEW_ID } from "../constants";
import type { ApprovalDecision, PendingExecution } from "../types";
import { escapeHtml } from "../utils/html";

function generateLineNumbers(content: string): string {
  const lines = content.split("\n");
  return lines.map((_, i) => `<span>${i + 1}</span>`).join("\n");
}

function generateApprovalHtml(pending: PendingExecution): string {
  const fileName = path.basename(pending.filePath);
  const lineNumbers = generateLineNumbers(pending.content);
  const shortHash = pending.hash.substring(0, 8);

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

    .warning-icon {
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      background: var(--vscode-inputValidation-warningBackground, rgba(255, 204, 0, 0.1));
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .warning-icon svg {
      width: 28px;
      height: 28px;
      color: var(--vscode-editorWarning-foreground, #cca700);
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
    }

    .code-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 24px;
      background: var(--vscode-editorGroupHeader-tabsBackground);
      border-bottom: 1px solid var(--vscode-widget-border, var(--vscode-panel-border));
    }

    .code-header-title {
      font-size: 12px;
      font-weight: 500;
      color: var(--vscode-descriptionForeground);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .code-container {
      display: flex;
      max-height: 50vh;
      overflow: auto;
      background: var(--vscode-editor-background);
    }

    .line-numbers {
      flex-shrink: 0;
      padding: 16px 0;
      background: var(--vscode-editorLineNumber-background, transparent);
      text-align: right;
      user-select: none;
      border-right: 1px solid var(--vscode-widget-border, var(--vscode-panel-border));
    }

    .line-numbers span {
      display: block;
      padding: 0 12px;
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: var(--vscode-editor-font-size, 13px);
      line-height: 1.5;
      color: var(--vscode-editorLineNumber-foreground);
    }

    .code-content {
      flex: 1;
      padding: 16px;
      overflow-x: auto;
    }

    .code-content code {
      display: block;
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: var(--vscode-editor-font-size, 13px);
      line-height: 1.5;
      white-space: pre;
      color: var(--vscode-editor-foreground);
    }

    /* Actions Section */
    .actions {
      display: flex;
      gap: 12px;
      padding: 20px 24px;
      background: var(--vscode-editorWidget-background);
      border-top: 1px solid var(--vscode-widget-border, var(--vscode-panel-border));
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-family: var(--vscode-font-family);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      outline: none;
    }

    .btn:focus-visible {
      outline: 2px solid var(--vscode-focusBorder);
      outline-offset: 2px;
    }

    .btn svg {
      width: 16px;
      height: 16px;
    }

    .btn-primary {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }

    .btn-primary:hover {
      background: var(--vscode-button-hoverBackground);
    }

    .btn-primary:active {
      transform: scale(0.98);
    }

    .btn-secondary {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }

    .btn-secondary:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }

    .btn-secondary:active {
      transform: scale(0.98);
    }

    .btn-danger {
      background: transparent;
      color: var(--vscode-errorForeground);
      border: 1px solid var(--vscode-errorForeground);
    }

    .btn-danger:hover {
      background: var(--vscode-inputValidation-errorBackground, rgba(255, 0, 0, 0.1));
    }

    .btn-danger:active {
      transform: scale(0.98);
    }

    .spacer {
      flex: 1;
    }

    /* Info Footer */
    .info-footer {
      padding: 16px 24px;
      background: var(--vscode-editorWidget-background);
      border-top: 1px solid var(--vscode-widget-border, var(--vscode-panel-border));
    }

    .info-text {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      line-height: 1.5;
    }

    .info-text strong {
      color: var(--vscode-foreground);
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="warning-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
      <div class="header-content">
        <h1 class="title">
          Execute <span class="file-name">${escapeHtml(fileName)}</span>?
        </h1>
        <p class="subtitle">${escapeHtml(pending.filePath)}</p>
        <div class="meta">
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
        <span class="code-header-title">Script Content</span>
      </div>
      <div class="code-container">
        <div class="line-numbers">${lineNumbers}</div>
        <div class="code-content">
          <code>${escapeHtml(pending.content)}</code>
        </div>
      </div>
    </div>

    <div class="info-footer">
      <p class="info-text">
        <strong>Allow (Remember)</strong> saves approval for this file content.
        <strong>Once</strong> runs this time only.
        <strong>Deny</strong> cancels execution.
      </p>
    </div>

    <div class="actions">
      <button class="btn btn-primary" onclick="respond('allow')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22,4 12,14.01 9,11.01"/>
        </svg>
        Allow (Remember)
      </button>
      <button class="btn btn-secondary" onclick="respond('once')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
        Once
      </button>
      <span class="spacer"></span>
      <button class="btn btn-danger" onclick="respond('deny')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        Deny
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
): Promise<ApprovalDecision> {
  const fileName = path.basename(pending.filePath);

  return new Promise((resolve) => {
    let resolved = false;

    const panel = vscode.window.createWebviewPanel(
      WEBVIEW_ID,
      `Review: ${fileName}`,
      vscode.ViewColumn.One,
      { enableScripts: true },
    );

    panel.webview.html = generateApprovalHtml(pending);

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
