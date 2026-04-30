const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

let mainWindow;

// 关闭安全警告，适配本地功能
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

function createWindow() {
  // 创建主窗口，适配平板/电脑屏幕
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      allowRunningInsecureContent: false
    },
    show: false,
    autoHideMenuBar: true
  });

  // 加载构建后的前端页面，适配你的docs输出目录
  mainWindow.loadFile(path.join(__dirname, '../docs/index.html'));

  // 页面加载完成后显示窗口，避免白屏闪烁
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // 外部链接用系统默认浏览器打开，不占用应用窗口
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// 应用就绪后创建窗口
app.whenReady().then(() => {
  createWindow();

  // MacOS适配，关闭所有窗口后重新创建
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 所有窗口关闭后退出应用（MacOS除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
