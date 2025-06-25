import { defineStore } from 'pinia'

export default defineStore('groupMemberStore', {
  state: () => {
    return {
      membersMap: {}
    }
  },
  actions: {
    setMembers (groupId, members) {
      this.membersMap[groupId] = {
        list: members,
        ts: Date.now()
      }
    },
    getMembers (groupId) {
      return this.membersMap[groupId] ? this.membersMap[groupId].list : []
    },
    clear () {
      this.membersMap = {}
    }
  }
})
