'use strict'

import { app, protocol, BrowserWindow, ipcMain, shell } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import path from 'path'

// ✅ 新增引入
import fs from 'fs'
import os from 'os'
import { get as httpGet } from 'http';
import { get as httpsGet } from 'https';
import { parse as parseUrl } from 'url';

const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

let mainWindow  // 用于发送进度
let menuWindow  // 用于右键浮动菜单

async function createWindow () {
  const win = new BrowserWindow({
    width: 450,
    height: 600,
    resizable: true,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    }
  })

  mainWindow = win // 保存引用用于后续发送事件

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    win.loadURL('app://./index.html')
  }

  // 窗口控制
  ipcMain.on('window-minimize', () => win.minimize())
  ipcMain.on('window-toggle-maximize', () => {
    if (win.isMaximized()) win.unmaximize()
    else win.maximize()
    win.webContents.send(
      win.isMaximized() ? 'window-is-maximized' : 'window-is-restored'
    )
  })
  ipcMain.on('window-close', () => win.close())
  ipcMain.on('window-resize', (event, { width, height }) => {
    if (win && !win.isDestroyed()) {
      win.setSize(parseInt(width, 10), parseInt(height, 10), true)
    }
  })

  // ✅ 添加文件下载监听器
  ipcMain.on('download-file', (event, { url, filename }) => {
    const parsedUrl = parseUrl(url);
    const protocol = parsedUrl.protocol;

    const get = protocol === 'http:' ? httpGet : httpsGet;
    // 创建下载目录
    const downloadDir = path.join(os.homedir(), 'Downloads', 'Hezi');
    // 创建文件
    const destPath = path.join(downloadDir, filename);
    // 如果文件夹不存在，则创建
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }

    const file = fs.createWriteStream(destPath);
    let receivedBytes = 0;

    get(url, (response) => {
      const totalBytes = parseInt(response.headers['content-length'], 10);

      response.pipe(file);

      response.on('data', (chunk) => {
        receivedBytes += chunk.length;
        const percent = Math.round((receivedBytes / totalBytes) * 100);
        mainWindow.webContents.send('download-progress', {
          filename,
          percent
        });
      });
      file.on('finish', () => {
        file.close();
        mainWindow.webContents.send('download-done', {
          filename,
          filePath: destPath
        });
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => { });
      console.error('下载失败:', err);
      mainWindow.webContents.send('download-error', err.message);
    });
  });
  // 根据文件路径打开文件地址
  ipcMain.on('show-in-folder', (event, filePath) => {
    if (filePath && fs.existsSync(filePath)) {
      shell.showItemInFolder(filePath);
    } else {
      event.sender.send('download-error', '文件不存在，无法打开文件夹');
    }
  });
  // 根据文件名称打开文件地址
  ipcMain.on('show-in-folder-by-name', (event, filename) => {
    const filePath = path.join(os.homedir(), 'Downloads', 'Hezi', filename);
    if (!filename) {
      return event.sender.send('download-error', '未提供文件名');
    }
    if (!fs.existsSync(filePath)) {
      return event.sender.send('download-error', '文件不存在：' + filePath);
    }
    shell.showItemInFolder(filePath);
  });
  ipcMain.on('show-in-local-folder', (event, filePath) => {
    console.log('[尝试打开路径]', filePath);

    if (!filePath) {
      console.warn('❌ 文件路径为空');
      return event.sender.send('download-error', '未提供文件路径');
    }

    if (!fs.existsSync(filePath)) {
      console.warn('❌ 文件不存在：', filePath);
      // return event.sender.send('download-error', '文件不存在，无法打开文件夹');
    }

    shell.showItemInFolder(filePath);
  });
}

// —— 新增：右键浮动菜单 —— //

// 渲染进程调用： window.electronAPI.showFloatingMenu({ x, y, items })
ipcMain.on('show-floating-menu', (event, { x, y, items }) => {
  // 先关掉已有菜单
  if (menuWindow && !menuWindow.isDestroyed()) {
    menuWindow.close()
    menuWindow = null
  }

  // 菜单尺寸：上下 padding 5 + 每项 30 高度
  const itemHeight = 30
  const padding = 5
  const width = 150
  const height = itemHeight * items.length + padding * 2 + 2

  // 创建子窗口
  menuWindow = new BrowserWindow({
    width, height, x, y,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: true,
    // macOS 专用
    ...(process.platform === 'darwin' && {
      vibrancy: 'popover',
      titleBarStyle: 'customButtonsOnHover',
    }),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // 加载静态菜单页面
  menuWindow.loadFile(path.join(__dirname, '../public/menu.html'))

  menuWindow.once('ready-to-show', () => {
    // 发送菜单项给子窗口
    menuWindow.webContents.send('set-menu-items', items)
    // macOS 下更精准地定位
    if (process.platform === 'darwin') {
      menuWindow.setBounds({ x, y, width, height })
    }
    menuWindow.show()
  })

  // 失焦自动关闭
  menuWindow.on('blur', () => {
    if (menuWindow && !menuWindow.isDestroyed()) {
      menuWindow.close()
      menuWindow = null
    }
  })
})

// 子窗口点击后发回 'menu-command'，转发给主窗口
ipcMain.on('menu-command', (event, command) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('menu-command', command)
  }
  if (menuWindow && !menuWindow.isDestroyed()) {
    menuWindow.close()
    menuWindow = null
  }
})

// —— 应用生命周期 —— //
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    try { await installExtension(VUEJS_DEVTOOLS) }
    catch (e) { console.error('DevTools 安装失败:', e) }
  }
  createWindow()
})

// Windows 下优雅退出
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') app.quit()
    })
  } else {
    process.on('SIGTERM', () => app.quit())
  }
}
