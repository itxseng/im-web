import localForage from 'localforage'

// 在浏览器环境下使用 IndexedDB/WebSQL，本地应用则使用 SQLite
const useElectronDB = typeof window !== 'undefined' && window.electronDB

const electronForage = {
  setItem (key, value) {
    if (useElectronDB) {
      return window.electronDB.setItem(key, value)
    }
    return localForage.setItem(key, value)
  },
  getItem (key) {
    if (useElectronDB) {
      return window.electronDB.getItem(key)
    }
    return localForage.getItem(key)
  },
  removeItem (key) {
    if (useElectronDB) {
      return window.electronDB.removeItem(key)
    }
    return localForage.removeItem(key)
  }
}

export default electronForage
