const vscode = require('vscode');
const path = require('path');
const { CONFIG_PROPS } = require('./constants');

const userConfig = {
  projectPath: path.normalize(vscode.workspace.getConfiguration().get(CONFIG_PROPS.projectPath) || '/'),
};

vscode.workspace.onDidChangeConfiguration((event) => {
  if (event.affectsConfiguration(CONFIG_PROPS.projectPath)) {
    userConfig.projectPath = path.normalize(vscode.workspace.getConfiguration().get(CONFIG_PROPS.projectPath) || '/');
  }
});

module.exports = userConfig;
