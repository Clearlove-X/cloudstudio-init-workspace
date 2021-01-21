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
const cp = require("child_process");
const path = require("path");
const childProcess = require("child_process");
const logger_1 = require("./logger");
const utils_1 = require("./utils");
class InitWorkspaceByGit {
    constructor() {
        this.homePath = process.env.HOME === undefined ? "~/" : process.env.HOME;
        this.sshPath = path.join(this.homePath, ".ssh");
        this.sshPrivatePath = path.join(this.sshPath, "id_rsa");
        this.sshPublicPath = path.join(this.sshPath, "id_rsa.pub");
        this.cloneURL = process.env.IDE_VERSION_CONTROL_URL === undefined ? "" : process.env.IDE_VERSION_CONTROL_URL;
        this.isRemoteAgent = process.env.REMOTE_AGENT === "realRemote";
        this.remotePriKey = "~/.ssh/coding_rsa";
    }
    initWorkspace(rootPath) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((isDone) => __awaiter(this, void 0, void 0, function* () {
                // step1: 创建 ssh 相关文件，授权
                this.checkOrCreateSshFile();
                const result = yield this.exportSshKey();
                logger_1.logger.appendLine(`ssh key is: ${result}`);
                logger_1.logger.appendLine("clonePath: " + rootPath);
                process.chdir(rootPath);
                if (this.isRemoteAgent) {
                    logger_1.logger.appendLine(`remoteAgent is true: ${this.isRemoteAgent}`);
                    isDone(true);
                    //do nothing
                    //childProcess.exec(`GIT_SSH_COMMAND='ssh -i ${this.remotePriKey} -o StrictHostKeyChecking=no' git clone ${this.cloneURL}`, { cwd: rootPath });
                }
                else {
                    logger_1.logger.appendLine(`remoteAgent is false: ${this.isRemoteAgent}`);
                    logger_1.logger.appendLine(`cloneUrl is: ${this.cloneURL}`);
                    const gitDir = path.join(utils_1.getWorkspaceRootPath(), ".git");
                    if (this.cloneURL !== "" && !fs.existsSync(gitDir)) {
                        vscode.window.withProgress({
                            location: vscode.ProgressLocation.Notification,
                            title: `正在克隆 ${this.cloneURL} 项目......`,
                        }, 
                        // @ts-ignore
                        (progress, token) => {
                            return new Promise(resolve => {
                                logger_1.logger.show();
                                const cloneCp = cp.spawn("GIT_SSH_COMMAND='ssh -o StrictHostKeyChecking=no' git", ["clone", this.cloneURL, ".", "--progress"], { shell: true, cwd: utils_1.getWorkspaceRootPath() });
                                cloneCp.stderr.on("data", (data) => {
                                    logger_1.logger.appendLine(data.toString());
                                    vscode.window.showErrorMessage(data.toString());
                                });
                                cloneCp.on("close", (code, signal) => {
                                    resolve();
                                    isDone(true);
                                });
                            });
                        });
                    }
                    else {
                        isDone(true);
                    }
                }
            }));
        });
    }
    checkOrCreateSshFile() {
        const privateKey = process.env.IDE_USER_SSH_PRIVATE_KEY === undefined ? "" : process.env.IDE_USER_SSH_PRIVATE_KEY;
        const publicKey = process.env.IDE_USER_SSH_PUBLIC_KEY === undefined ? "" : process.env.IDE_USER_SSH_PUBLIC_KEY;
        const sshPrivateKey = Buffer.from(privateKey, "base64").toString("ascii");
        const sshPublicKey = Buffer.from(publicKey, "base64").toString("ascii");
        fs.exists(this.sshPath, (exists) => {
            if (exists) {
                logger_1.logger.appendLine(`${this.sshPath} existed.`);
                return;
            }
        });
        // 这部分是必需的，不然目录和文件权限会很奇怪
        const sshMode = 0o700 & ~process.umask();
        const sshPrivateMode = 0o600 & ~process.umask();
        if (!fs.existsSync(this.sshPath)) {
            fs.mkdir(this.sshPath, sshMode, (err) => {
                if (err) {
                    return console.error(err);
                }
                fs.writeFile(this.sshPrivatePath, sshPrivateKey, { mode: sshPrivateMode }, () => { });
                fs.writeFile(this.sshPublicPath, sshPublicKey, { mode: 0o644 }, () => { });
            });
        }
    }
    exportSshKey() {
        return __awaiter(this, void 0, void 0, function* () {
            const domain = this.extractDomain();
            logger_1.logger.appendLine('git url: ' + this.cloneURL + ` doamin: ${domain}`);
            const knowHostPath = path.join(this.sshPath, 'known_hosts');
            return yield new Promise((resolve) => {
                const cli = childProcess.exec(`ssh-keyscan ${domain} >>  ${knowHostPath} `);
                cli.stdout.on("data", (data) => {
                    resolve(data);
                });
                cli.stderr.on("data", (data) => {
                    resolve(data);
                });
            });
        });
    }
    extractDomain() {
        const url = this.cloneURL;
        if (url.startsWith('git')) {
            return url.split('git@').join('').split(':')[0];
        }
        else if (url.startsWith('https://')) {
            return url.split('/').filter(Boolean)[1];
        }
        else {
            logger_1.logger.appendLine(`仓库地址格式不支持: ${url}`);
        }
        return '';
    }
}
exports.default = InitWorkspaceByGit;
//# sourceMappingURL=initWorkspaceByGit.js.map