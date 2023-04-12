const vscode = require("vscode");
const userConfig = require("./userConfig");

let fileWatcher = null;

function initFileWatcher() {
	fileWatcher = vscode.workspace.createFileSystemWatcher(
		new vscode.RelativePattern(
			vscode.Uri.file(userConfig.projectPath),
			"app/navigator/*/pages.js"
		),
		true,
		false,
		false
	);
	return fileWatcher;
}

function disposeFileWatcher() {
	fileWatcher.dispose();
}

module.exports = {
	initFileWatcher,
	disposeFileWatcher,
};
