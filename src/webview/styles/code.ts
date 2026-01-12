export const codeStyles = `
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
  padding: 14px 18px;
}

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
}

.code-content code {
  display: block;
  font-family: var(--vscode-editor-font-family, 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace);
  font-size: var(--vscode-editor-font-size, 13px);
  line-height: var(--vscode-editor-line-height, 1.4);
  white-space: pre;
  color: var(--vscode-editor-foreground);
  tab-size: 4;
  background: inherit;
}
`;
