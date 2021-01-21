"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
exports.getWorkspaceRootPath = () => {
    const workspace = vscode.workspace.workspaceFolders;
    return workspace && workspace.length > 0 ? workspace[0].uri.path : "";
};
exports.sleep = (time) => {
    return new Promise(res => {
        setTimeout(() => {
            res();
        }, time);
    });
};
// 触发预览插件自动检测 yml 文件
exports.launchPreviewDerectionYml = (retry = 0) => __awaiter(this, void 0, void 0, function* () {
    const exec = (count) => __awaiter(this, void 0, void 0, function* () {
        if (count < 0)
            return;
        const allCommands = yield vscode.commands.getCommands(true);
        const previewCommand = "preview.derectionYml";
        if (allCommands.some(e => e === previewCommand)) {
            vscode.commands.executeCommand(previewCommand);
        }
        else {
            yield exports.sleep(1000);
            exec(count - 1);
        }
    });
    exec(retry);
});
exports.removeDir = (dir) => {
    let files = fs.readdirSync(dir);
    for (var i = 0; i < files.length; i++) {
        let newPath = path.join(dir, files[i]);
        let stat = fs.statSync(newPath);
        if (stat.isDirectory()) {
            //如果是文件夹就递归下去
            exports.removeDir(newPath);
        }
        else {
            //删除文件
            fs.unlinkSync(newPath);
        }
    }
    fs.rmdirSync(dir); //如果文件夹是空的，就将自己删除掉
};
//# sourceMappingURL=utils.js.map