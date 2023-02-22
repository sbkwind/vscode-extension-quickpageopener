const vscode = require('vscode');
const path = require('path');
const { readFile, access } = require('fs/promises');
const { parse: babelParse } = require('@babel/parser');
const babelTraverse = require('@babel/traverse').default;
const LRUCache = require('./LRUCache');
const { COMMAND_ID } = require('./constants');
const userConfig = require('./userConfig');

/** @type {vscode.fileWatcher} */
let fileWatcher = null;

/**
 * @param  {String} value
 */
const validateInput = (value) => {
  const reg = /^\/?[a-zA-Z][a-zA-Z0-9]*\/[a-zA-Z][a-zA-Z0-9]*\/?$/;
  if (!reg.test(value)) {
    return new Error('字符串格式错误，期望格式为bundle/page');
  }
};

/**
 * @param {String} bundle
 * @returns {String}
 */
const resolveRouteFilePath = (bundle) => {
  return path.join(userConfig.projectPath, 'app/navigator', bundle, 'pages.js');
};

/**
 * @param {Object} ast
 * @returns {Object}
 */
const traverseAst = (ast) => {
  const bundlePages = Object.create(null);
  babelTraverse(ast, {
    ImportDeclaration({ node }) {
      const pageName = node.specifiers[0].local.name;
      const pathSegment = node.source.value;
      const pageInfo = Object.create(null);
      pageInfo.isResolved = false;
      pageInfo.path = resolvePageFilePath(pathSegment);
      bundlePages[pageName] = pageInfo;
    },
  });
  return bundlePages;
};

/**
 * @param {String} page
 * @returns {String}
 */
const resolvePageFilePath = (page) => {
  return path.join(userConfig.projectPath, 'app', page);
};

/**
 * @param  {String} filePath
 * @returns  {Object}
 */
const resolveBundlePagesInfo = async (filePath) => {
  const code = await readFile(filePath, { encoding: 'utf-8' });
  const ast = babelParse(code, { sourceType: 'module', attachComment: false });
  const bundlePagesInfo = traverseAst(ast);
  return bundlePagesInfo;
};

/**
 * @param {String} pagePath
 * @returns {String}
 */
const resolveFinalPageFilePath = async (pagePath) => {
  if (!!path.extname(pagePath)) {
    return pagePath;
  }
  let finalPath = `${pagePath}.js`;
  try {
    await access(finalPath);
  } catch {
    finalPath = `${pagePath}/index.js`;
  }

  return finalPath;
};

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const cache = new LRUCache();

  fileWatcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(vscode.Uri.file(userConfig.projectPath), 'app/navigator/*/pages.js'),
    true,
    false,
    false
  );

  fileWatcher.onDidDelete(({ path }) => {
    cache.remove(path);
  });

  fileWatcher.onDidChange(({ path }) => {
    cache.remove(path);
  });

  const disposable = vscode.commands.registerCommand(COMMAND_ID, async function () {
    try {
      const route = await vscode.window.showInputBox({
        prompt: '请输入路由信息，格式为 bundle/page',
        validateInput,
      });
      if (route === undefined) {
        return;
      }
      const [targetBundle, targetPage] = route.split('/').filter(Boolean);
      const routeFilePath = resolveRouteFilePath(targetBundle);
      if (!cache.has(routeFilePath)) {
        const bundlePagesInfo = await resolveBundlePagesInfo(routeFilePath);
        cache.set(routeFilePath, bundlePagesInfo);
      }
      if (!cache.get(routeFilePath)[targetPage].isResolved) {
        const bundlePagesInfo = cache.get(routeFilePath);
        const finalPath = await resolveFinalPageFilePath(bundlePagesInfo[targetPage].path);
        cache.set(routeFilePath, {
          ...bundlePagesInfo,
          ...{
            [targetPage]: {
              isResolved: true,
              path: finalPath,
            },
          },
        });
      }
      vscode.window.showTextDocument(vscode.Uri.file(cache.get(routeFilePath)[targetPage].path));
    } catch (error) {
      vscode.window.showErrorMessage(error.message);
    }
  });

  context.subscriptions.push(disposable);
}

function deactivate() {
  fileWatcher.dispose();
}

module.exports = { activate, deactivate };
