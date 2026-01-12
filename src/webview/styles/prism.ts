export const prismStyles = `
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

.code-content .token.shebang {
  color: var(--vscode-editorLineNumber-foreground, #6a9955);
}
`;
