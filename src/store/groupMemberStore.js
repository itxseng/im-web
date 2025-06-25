import { defineStore } from 'pinia'

const EXPIRE_MS = 5 * 60 * 1000

export default defineStore('groupMemberStore', {
  state: () => ({
    membersMap: {}
  }),
  actions: {
    setMembers (groupId, members) {
      this.membersMap[groupId] = {
        list: members,
        ts: Date.now()
      }
    },
    getMembers (groupId) {
      const cache = this.membersMap[groupId]
      if (cache && Date.now() - cache.ts < EXPIRE_MS) {
        return cache.list
      }
      return []
    },
    clear () {
      this.membersMap = {}
    }
  }
})
