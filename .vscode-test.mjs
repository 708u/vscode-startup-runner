import { defineConfig } from '@vscode/test-cli';
import * as os from 'node:os';
import * as path from 'node:path';

export default defineConfig({
	files: 'out/**/*.test.js',
	workspaceFolder: '.',
	launchArgs: [
		'--user-data-dir',
		path.join(os.tmpdir(), 'vscode-startup-runner-test'),
	],
});
