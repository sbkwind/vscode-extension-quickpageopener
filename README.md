# quick-page-opener README

## 是什么

一个快速打开文件的 vscode 插件。

## 为什么

这个插件的灵感来源于公司的 React-Native 项目的一个开发痛点。在进行开发时，在 App 中进入某个 RN 页面后，需要从控制台的 log 中获取页面的路由，格式为 bundle/page，bundle 是业务包名，page 是页面名。之后在路由文件夹中找到 bundle 对应的配置文件，找到 page 对应的文件路径，最后打开目标文件，流程繁琐复杂，因此开发了这个插件来简化上述流程。

## 怎么用

本插件提供了一个命令：`quickpageopener.openpage`用来快速打开文件。在 vscode 窗口中输入该命令，根据提示输入路由字符串，即可打开目标文件。

也可以使用键盘快捷键：

    mac: Cmd+Shift+i
    win: Ctrl+Shift+i
