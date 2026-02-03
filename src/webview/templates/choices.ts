import { icons } from "../icons";

interface ChoicesOptions {
  globPattern?: string;
}

export function renderChoices(options: ChoicesOptions = {}): string {
  const { globPattern } = options;

  const globButton = globPattern
    ? `
      <button class="choice-card caution" onclick="respond('allowByGlob')">
        <div class="choice-icon">
          ${icons.asterisk}
        </div>
        <div class="choice-content">
          <div class="choice-title">Allow by Glob <span class="danger-badge">Dangerous</span></div>
          <div class="choice-desc">Auto-execute all files matching "${globPattern}" even if content changes.</div>
        </div>
      </button>
`
    : "";

  return `
    <div class="choices">
      <button class="choice-card primary" onclick="respond('allow')">
        <div class="choice-icon">
          ${icons.checkCircle}
        </div>
        <div class="choice-content">
          <div class="choice-title">Allow Content</div>
          <div class="choice-desc">Approve this exact content. You'll be asked again if the file changes.</div>
        </div>
      </button>

      <button class="choice-card secondary" onclick="respond('once')">
        <div class="choice-icon">
          ${icons.clock}
        </div>
        <div class="choice-content">
          <div class="choice-title">Run Once</div>
          <div class="choice-desc">Execute now without saving approval. You'll be asked again next time.</div>
        </div>
      </button>
${globButton}
      <button class="choice-card warning" onclick="respond('allowByPath')">
        <div class="choice-icon">
          ${icons.warning}
        </div>
        <div class="choice-content">
          <div class="choice-title">Allow by Path <span class="danger-badge">Dangerous</span></div>
          <div class="choice-desc">Auto-execute even if content changes. Only for trusted dynamic scripts.</div>
        </div>
      </button>

      <button class="choice-card danger" onclick="respond('deny')">
        <div class="choice-icon">
          ${icons.xCircle}
        </div>
        <div class="choice-content">
          <div class="choice-title">Deny</div>
          <div class="choice-desc">Cancel execution and close this dialog.</div>
        </div>
      </button>
    </div>`;
}
