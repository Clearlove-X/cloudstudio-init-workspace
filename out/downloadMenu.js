"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
class DownloadMenu {
    constructor(context) {
        this.context = context;
    }
    registeredDownloadCommand() {
        this.context.subscriptions.push(vscode.commands.registerCommand('init-workspace.download', this.handleDownload));
    }
    handleDownload(a) {
        const domain = process.env['X_IDE_API_ORIGIN'] || '';
        const spaceKey = process.env['X_IDE_SPACE_KEY'] || '';
        const path = a.path;
        if (fs.existsSync(path)) {
            fs.stat(path, (err, stat) => {
                const openUrl = (p) => {
                    vscode.env.openExternal(vscode.Uri.parse(p));
                };
                const parseDomain = () => domain.replace('api', 'tty');
                if (stat.isFile()) {
                    // 下载文件
                    openUrl(`${parseDomain()}/${spaceKey}/download-remote-resource?path=${path}`);
                }
                else if (stat.isDirectory()) {
                    // 下载文件夹
                    openUrl(`${parseDomain()}/${spaceKey}/tar?path=${path}`);
                }
            });
        }
    }
}
exports.DownloadMenu = DownloadMenu;
//# sourceMappingURL=downloadMenu.js.map