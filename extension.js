const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log('Congratulations, your extension "quick-page-opener" is now active!');

  let disposable = vscode.commands.registerCommand('openpage', function () {
    vscode.window.showInformationMessage('Hello World from quick-page-opener!');
  });

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
