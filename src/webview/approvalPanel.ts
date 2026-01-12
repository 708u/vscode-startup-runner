import * as path from "node:path";
import * as vscode from "vscode";
import { WEBVIEW_ID } from "../constants";
import type { ApprovalDecision, PendingExecution } from "../types";
import { detectLanguage, highlightCode } from "./highlight";
import { getAllStyles } from "./styles";
import { renderChoices, renderCodeSection, renderHeader } from "./templates";

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
  const lineCount = pending.content.split("\n").length;

  const headerHtml = renderHeader({
    fileName,
    filePath: pending.filePath,
    shortHash,
    lineCount,
    isChanged,
  });

  const codeSectionHtml = renderCodeSection({
    fileName,
    highlightedContent,
  });

  const choicesHtml = renderChoices();

  return `<!DOCTYPE html>
<html>
<head>
  <style>${getAllStyles()}</style>
</head>
<body>
  <div class="card">
    ${headerHtml}
    ${codeSectionHtml}
    ${choicesHtml}
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
