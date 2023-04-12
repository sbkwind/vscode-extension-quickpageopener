const vscode = require("vscode");
const { readFile } = require("fs/promises");
const { parse: babelParse } = require("@babel/parser");
const babelTraverse = require("@babel/traverse").default;
const { LRUCache } = require("lru-cache");
const { initFileWatcher, disposeFileWatcher } = require("./fileWatcher");
const { COMMAND_ID } = require("./constants");
const userConfig = require("./userConfig");
const { pathJoin, findEntry } = require("./utils");

const routeReg = /^\/?([a-zA-Z][a-zA-Z0-9]*)\/([a-zA-Z][a-zA-Z0-9]*)\/?$/;

const traverseAst = (ast) => {
	const bundlePages = Object.create(null);
	babelTraverse(ast, {
		ImportDeclaration({ node }) {
			const pageName = node.specifiers[0].local.name;
			const pathSegment = node.source.value;
			bundlePages[pageName] = findEntry(
				pathJoin(userConfig.projectPath, "app", pathSegment)
			);
		},
	});
	return bundlePages;
};

const getBundlePagesInfo = async (filePath) => {
	const code = await readFile(filePath, { encoding: "utf-8" });
	const ast = babelParse(code, { sourceType: "module", attachComment: false });
	const bundlePagesInfo = traverseAst(ast);
	return bundlePagesInfo;
};

function activate(context) {
	const cache = new LRUCache({ max: 5 });

	const fileWatcher = initFileWatcher();

	fileWatcher.onDidDelete(({ path }) => {
		cache.delete(path);
	});

	fileWatcher.onDidChange(({ path }) => {
		cache.delete(path);
	});

	const disposable = vscode.commands.registerCommand(
		COMMAND_ID,
		async function () {
			try {
				const route = await vscode.window.showInputBox({
					prompt: "请输入路由信息，格式为 bundle/page",
					validateInput: (value) => {
						if (!routeReg.test(value)) {
							return new Error("字符串格式错误，期望格式为bundle/page");
						}
					},
				});
				if (route === undefined) {
					return;
				}
				const [, targetBundle, targetPage] = route.match(routeReg);
				const routeFilePath = pathJoin(
					userConfig.projectPath,
					"app/navigator",
					targetBundle,
					"pages.js"
				);
				if (!cache.has(routeFilePath)) {
					const bundlePagesInfo = await getBundlePagesInfo(routeFilePath);
					cache.set(routeFilePath, bundlePagesInfo);
				}
				vscode.window.showTextDocument(
					vscode.Uri.file(cache.get(routeFilePath)[targetPage])
				);
			} catch (error) {
				vscode.window.showErrorMessage(error.message);
			}
		}
	);

	context.subscriptions.push(disposable);
}

function deactivate() {
	disposeFileWatcher();
}

module.exports = { activate, deactivate };
