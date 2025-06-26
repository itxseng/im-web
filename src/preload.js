const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');

contextBridge.exposeInMainWorld('electronAPI', {
  // 窗口控制相关
  minimize: () => ipcRenderer.send('window-minimize'),
  toggleMax: () => ipcRenderer.send('window-toggle-maximize'),
  close: () => ipcRenderer.send('window-close'),
  onMaximized: (cb) => ipcRenderer.on('window-is-maximized', cb),
  onRestored: (cb) => ipcRenderer.on('window-is-restored', cb),
  resize: (width, height) => ipcRenderer.send('window-resize', { width, height }),
  loginSuccess: () => ipcRenderer.send('login-success'),
  getUsername: () => os.userInfo().username,

  // ✅ 文件下载相关
  downloadFile: ({ url, filename }) => ipcRenderer.send('download-file', { url, filename }),

  onDownloadProgress: (callback) => {
    const handler = (event, data) => {
      callback(data); // data: { filename, percent }
    };
    ipcRenderer.on('download-progress', handler);
    return () => ipcRenderer.removeListener('download-progress', handler);
  },

  onDownloadDone: (callback) => {
    const handler = (event, data) => {
      callback(data); // data: { filename, filePath }
    };
    ipcRenderer.on('download-done', handler);
    return () => ipcRenderer.removeListener('download-done', handler);
  },

  onDownloadError: (callback) => {
    const handler = (event, errorMsg) => {
      callback(errorMsg);
    };
    ipcRenderer.on('download-error', handler);
    return () => ipcRenderer.removeListener('download-error', handler);
  },
  showInFolder: (filePath) => ipcRenderer.send('show-in-folder', filePath),
  showInLocalFolder: (filePath) => ipcRenderer.send('show-in-local-folder', filePath),
  showInFolderByName: (filename) => ipcRenderer.send('show-in-folder-by-name', filename),
  checkFileExists: (filename) => {
    if (!filename) return false;
    const filePath = path.join(os.homedir(), 'Downloads', 'Hezi', filename);
    return fs.existsSync(filePath);
  },
  checkPathExists: (filePath) => {
    if (!filePath) return false;
    return fs.existsSync(filePath);
  },
  showFloatingMenu: (options) => ipcRenderer.send('show-floating-menu', options),
  onMenuCommand: (callback) => ipcRenderer.on('menu-command', (e, cmd) => callback(cmd))
});

// 简易存储接口，使用同步 ipc 调用主进程持久化数据
contextBridge.exposeInMainWorld('electronStore', {
  getItem: (key) => ipcRenderer.sendSync('store-get', key),
  setItem: (key, value) => ipcRenderer.sendSync('store-set', { key, value }),
  removeItem: (key) => ipcRenderer.sendSync('store-remove', key)
});
