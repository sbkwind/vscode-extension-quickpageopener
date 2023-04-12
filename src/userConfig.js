const vscode = require("vscode");
const slash = require("slash");
const { CONFIG_PROPS } = require("./constants");

const userConfig = {
	projectPath: slash(
		vscode.workspace.getConfiguration().get(CONFIG_PROPS.projectPath) || "/"
	),
};

vscode.workspace.onDidChangeConfiguration((event) => {
	if (event.affectsConfiguration(CONFIG_PROPS.projectPath)) {
		userConfig.projectPath = slash(
			vscode.workspace.getConfiguration().get(CONFIG_PROPS.projectPath) || "/"
		);
	}
});

module.exports = userConfig;
