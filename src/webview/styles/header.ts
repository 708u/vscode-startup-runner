export const headerStyles = `
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
  background: rgba(217, 119, 6, 0.2);
  color: #d97706;
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
`;
