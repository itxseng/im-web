import http from '../api/httpRequest.js'
import localForage from '../utils/electronForage.js';
import { defineStore } from 'pinia';
export default defineStore('groupStore', {
  state: () => {
    return {
      groups: [],
      currentGroupMember: [],
      groupInfo: {},
      groupPermission: {},
      groupsApplication: []
    }
  },
  actions: {
    getGroupsApplication () {
      localForage.getItem('groupsApplication').then(application => {
        if (Array.isArray(application) && application.length) {
          this.setGroupsApplication(application);
        }
      });
    },

    setGroupsApplication (application) {
      const existing = Array.isArray(this.groupsApplication) ? this.groupsApplication : [];
      const combined = [...existing, ...application];

      // 按 id 去重
      const map = new Map();
      combined.forEach(item => {
        if (item && item.id != null) {
          map.set(item.id, item); // 后者会覆盖前者
        }
      });

      this.groupsApplication = Array.from(map.values());

      localForage.setItem('groupsApplication', this.groupsApplication);
    },
    // 更新群申请
    updateGroupsApplication (application, status) {
      const index = this.groupsApplication.findIndex(item => item.id === application.id);
      if (index !== -1) {
        const updatedApplication = {
          ...this.groupsApplication[index],
          status
        };
        this.groupsApplication.splice(index, 1, updatedApplication);
        localForage.setItem('groupsApplication', this.groupsApplication);
      }
    },
    setGroupPermission (permission) {
      this.groupPermission = permission;
    },
    setCurrentGroupMember (member) {
      this.currentGroupMember = member;
    },
    setGroupInfo (info) {
      this.groupInfo = info;
    },
    setGroups (groups) {
      this.groups = groups;
    },
    addGroup (group) {
      if (this.groups.some(g => g.id == group.id)) {
        this.updateGroup(group)
      } else {
        this.groups.unshift(group);
      }
    },
    removeGroup (id) {
      this.groups.filter(g => g.id == id).forEach(g => g.quit = true);
    },
    updateGroup (group) {
      this.groups.forEach((g, idx) => {
        if (g.id == group.id) {
          // 拷贝属性
          Object.assign(this.groups[idx], group);
        }
      })
    },
    updateTopMessage (id, topMessage) {
      console.log(id, topMessage);

      let group = this.findGroup(id);
      if (!group) return;

      let topMessages = group.topMessages || [];

      let index = topMessages.findIndex(m => m.id == topMessage.id);
      if (index >= 0) {
        // 已存在：替换为新的 topMessage
        topMessages[index] = topMessage;
      } else {
        // 不存在：先判断长度，控制最大为 5 条
        if (topMessages.length >= 5) {
          topMessages.shift(); // 移除最旧的
        }
        topMessages.push(topMessage);
      }

      // 可选是否更新 group.topMessage
      // group.topMessage = topMessage;
    },
    deleteTopMessage (id, message) {
      const group = this.findGroup(id);
      if (!group || !Array.isArray(group.topMessages)) return;

      const index = group.topMessages.findIndex(item => item.id === message.id);
      if (index !== -1) {
        group.topMessages.splice(index, 1);
      }
    },
    clear () {
      this.groups = [];
    },
    loadGroup () {
      return new Promise((resolve, reject) => {
        http({
          url: '/group/list',
          method: 'GET'
        }).then(groups => {
          this.setGroups(groups);
          this.getGroupsApplication()
          resolve();
        }).catch((res) => {
          reject(res);
        })
      });
    }
  },
  getters: {
    findGroup: (state) => (id) => {
      return state.groups.find(g => g.id == id);
    },
    isGroup: (state) => (id) => {
      return state.groups.filter(g => !g.quit).some(g => g.id == id);
    },
    groupMembers: (state) => (userId) => {
      return state.currentGroupMember.find((f) => f.userId == userId);
    },
  }
});