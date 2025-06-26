'use strict'

import { app, protocol, BrowserWindow, ipcMain, shell } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import path from 'path'

if (process.env.NODE_ENV !== 'production') {
  global.__static = path.join(__dirname, '..', 'public')
}
import fs from 'fs'
import os from 'os'


const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

let mainWindow  // 用于发送进度
let menuWindow  // 用于右键浮动菜单

// —— 持久化存储 —— //
const storeFile = path.join(app.getPath('userData'), 'store.json');
let store = {};
try {
  store = JSON.parse(fs.readFileSync(storeFile, 'utf8'));
} catch (e) {
  store = {};
}
const saveStore = () => {
  try {
    fs.writeFileSync(storeFile, JSON.stringify(store));
  } catch (err) {
    console.error('Failed to save store:', err);
  }
};
ipcMain.on('store-get', (event, key) => {
  event.returnValue = store[key];
});
ipcMain.on('store-set', (event, { key, value }) => {
  store[key] = value;
  saveStore();
  event.returnValue = true;
});
ipcMain.on('store-remove', (event, key) => {
  delete store[key];
  saveStore();
  event.returnValue = true;
});

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

  // ✅ 文件下载监听器，使用 Electron 的 session.downloadURL 获取进度
  // requestId 用于区分同名文件的多个并发下载
  ipcMain.on('download-file', (event, { url, filename, requestId }) => {
    if (!mainWindow) return;

    const downloadDir = path.join(os.homedir(), 'Downloads', 'Hezi');
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }

    const makeUniqueName = (name) => {
      const parsed = path.parse(name);
      let candidate = name;
      let counter = 1;
      while (fs.existsSync(path.join(downloadDir, candidate))) {
        candidate = `${parsed.name}(${counter})${parsed.ext}`;
        counter++;
      }
      return candidate;
    };

    const { session } = mainWindow.webContents;
    const handleWillDownload = (e, item) => {
      const requestName = filename || item.getFilename();
      const finalName = makeUniqueName(requestName);
      const destPath = path.join(downloadDir, finalName);
      item.setSavePath(destPath);

      item.on('updated', (e, state) => {
        if (state === 'progressing') {
          const total = item.getTotalBytes();
          const received = item.getReceivedBytes();
          const percent = total > 0 ? Math.round((received / total) * 100) : 0;
          mainWindow.webContents.send('download-progress', {
            requestId,
            requestName,
            filename: finalName,
            percent
          });
        }
      });

      item.once('done', (e, state) => {
        session.removeListener('will-download', handleWillDownload);
        if (state === 'completed') {
          mainWindow.webContents.send('download-done', {
            requestId,
            requestName,
            filename: finalName,
            filePath: destPath
          });
        } else {
          mainWindow.webContents.send('download-error', {
            requestId,
            requestName,
            error: `Download failed: ${state}`
          });
        }
      });
    };

    session.once('will-download', handleWillDownload);
    mainWindow.webContents.downloadURL(url);
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
  const menuPath = isDevelopment  ? path.join(__static, 'menu.html') // 开发环境下 __static 自动指向 public/
    : path.join(__dirname, 'menu.html') // 打包后 menu.html 会在 app.asar 根下
  menuWindow.loadFile(menuPath)
  console.log('[__dirname]:', __dirname, menuPath);
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

// 接收渲染进程发送的菜单尺寸，动态调整窗口大小
ipcMain.on('menu-size', (event, { width: w, height: h }) => {
  if (menuWindow && !menuWindow.isDestroyed()) {
    const [x, y] = menuWindow.getPosition()
    const width = Math.ceil(w)
    const height = Math.ceil(h)
    menuWindow.setBounds({ x, y, width, height })
  }
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
