import localForage from 'localforage'

const isElectron = typeof window !== 'undefined' && window.electronStore

const electronForage = {
  setItem (key, value) {
    if (isElectron) {
      window.electronStore.setItem(key, value)
      return Promise.resolve(value)
    }
    return localForage.setItem(key, value)
  },
  getItem (key) {
    if (isElectron) {
      return Promise.resolve(window.electronStore.getItem(key))
    }
    return localForage.getItem(key)
  },
  removeItem (key) {
    if (isElectron) {
      window.electronStore.removeItem(key)
      return Promise.resolve()
    }
    return localForage.removeItem(key)
  }
}

export default electronForage
