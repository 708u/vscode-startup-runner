export const choicesStyles = `
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
  border-color: #16a34a;
  background: #16a34a;
}

.choice-card.primary:hover {
  background: #15803d;
  border-color: #15803d;
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

.choice-card.caution {
  border-color: #e65c00;
  border-width: 2px;
  background: rgba(230, 92, 0, 0.08);
}

.choice-card.caution:hover {
  background: rgba(230, 92, 0, 0.15);
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

.choice-card.caution .choice-icon {
  background: rgba(230, 92, 0, 0.25);
}

.choice-card.caution .choice-icon svg {
  color: #e65c00;
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
`;
