import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	files: 'out/**/*.test.js',
	mocha: {
		timeout: 60000,
	},
	launchArgs: ['--user-data-dir=/tmp/vscode-test-data'],
	workspaceFolder: '.',
});
