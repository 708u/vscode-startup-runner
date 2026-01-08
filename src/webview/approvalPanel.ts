import * as vscode from "vscode";
import * as path from "path";
import { WEBVIEW_ID } from "../constants";
import type { ApprovalDecision, PendingExecution } from "../types";
import { escapeHtml } from "../utils/html";

function generateApprovalHtml(pending: PendingExecution): string {
  const fileName = path.basename(pending.filePath);

  return `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: var(--vscode-font-family);
      padding: 20px;
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
    }
    h2 { margin-top: 0; }
    .path {
      margin-bottom: 16px;
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
    }
    pre {
      background: var(--vscode-textBlockQuote-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 4px;
      padding: 16px;
      overflow: auto;
      max-height: 60vh;
    }
    .buttons {
      margin-top: 20px;
      display: flex;
      gap: 10px;
    }
    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    .allow {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }
    .once {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }
    .deny {
      background: var(--vscode-errorForeground);
      color: white;
    }
  </style>
</head>
<body>
  <h2>Execute "${escapeHtml(fileName)}"?</h2>
  <div class="path">${escapeHtml(pending.filePath)}</div>
  <pre><code>${escapeHtml(pending.content)}</code></pre>
  <div class="buttons">
    <button class="allow" onclick="respond('allow')">Allow (Remember)</button>
    <button class="once" onclick="respond('once')">Once</button>
    <button class="deny" onclick="respond('deny')">Deny</button>
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
