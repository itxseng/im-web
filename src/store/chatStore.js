import { MESSAGE_TYPE, MESSAGE_STATUS } from "../api/enums.js"
import { defineStore } from 'pinia';
import useUserStore from './userStore.js';
import localForage from '../utils/electronForage.js';
import http from '../api/httpRequest.js'

/**
 * 优化1(冷热消息分区):
 * 热消息：登录后的消息
 * 冷消息: 登录前的消息
 * 每个会话的冷热消息分别用一个key进行存储，当有新的消息时，只更新热消息key，冷消息key保持不变
 * 由于热消息数量不会很大，所以localForage.setItem耗时很低，可以防止消息过多时出现卡顿的情况
 *
 * 优化2(延迟渲染):
 * 拉取消息时，如果直接用state.chats接收，页面就开始渲染，一边渲染页面一边大量接消息会导致很严重的卡顿
 * 为了加速拉取离线消息效率，拉取时消息暂时存储到cacheChats,等待所有离线消息拉取完成后，再统一放至state中进行渲染
 * 
 * 优化3(pinia代替vuex)
 * 实测pinia的远超vuex,且语法更简洁清晰
 * 
 * */
let cacheChats = [];

export default defineStore('chatStore', {
  state: () => {
    return {
      activeChat: null,
      groupMemberChat: null,
      privateMsgMaxId: 0,
      groupMsgMaxId: 0,
      systemMsgMaxSeqNo: 0,
      loadingPrivateMsg: false,
      loadingGroupMsg: false,
      loadingSystemMsg: false,
      chats: [],
      chatLoading: false
    }
  },
  actions: {
    setChatLoading (type) {
      this.chatLoading = type;
    },
    initChats (chatsData) {
      this.chats = [];
      this.privateMsgMaxId = chatsData.privateMsgMaxId || 0;
      this.groupMsgMaxId = chatsData.groupMsgMaxId || 0;
      this.systemMsgMaxSeqNo = chatsData.systemMsgMaxSeqNo || 0;
      cacheChats = chatsData.chats || [];
      // 防止图片一直处在加载中状态
      cacheChats.forEach((chat) => {
        chat.messages.forEach((msg) => {
          if (msg.loadStatus == "loading") {
            msg.loadStatus = "fail"
          }
        })
      })
    },
    openChat (chatInfo) {
      let chats = this.findChats()
      let chat = null;
      for (let idx in chats) {
        if (
          chats[idx].type === chatInfo.type &&
          chats[idx].targetId === chatInfo.targetId
        ) {
          chat = chats[idx];
          // 放置头部
          // this.commit("moveTop", idx);
          return;
        }
      }

      // 创建会话
      chat = {
        targetId: chatInfo.targetId,
        type: chatInfo.type,
        showName: chatInfo.showName,
        headImage: chatInfo.headImage,
        lastContent: "",
        lastSendTime: new Date().getTime(),
        unreadCount: 0,
        messages: [],
        atMe: false,
        atAll: false,
        stored: false,
        delete: false,
        star: false,// 星标
        blacklist: false,//  黑名单
        notifyExpireTs: 0, // 提醒
        top: false, // 默认新建的是非置顶
        online: false, // 在线状态
        onlineApp: false, // 在线状态
        onlineWeb: false, // 在线状态
      };
      // chats.unshift(chat);
      // 插入位置判断
      let insertIndex = 0;
      if (chat.top) {
        // 插入到最后一个 top == true 的后面
        for (let i = 0; i < chats.length; i++) {
          if (chats[i].top) {
            insertIndex = i + 1;
          }
        }
      } else {
        // 插入到第一个 top == false 的前面（也就是第一个非置顶的位置）
        for (let i = 0; i < chats.length; i++) {
          if (!chats[i].top) {
            insertIndex = i;
            break;
          }
          // 如果都是 top == true，则 insertIndex 仍为 chats.length
          insertIndex = chats.length;
        }
      }
      chats.splice(insertIndex, 0, chat);
      console.log('chats', chats);

      this.saveToStorage();
    },
    setActiveChat (idx, type) {
      let chats = this.findChats()
      // 根据chatInfo.id 找到对应的 chat
      let arr = []
      chats.forEach(chat => {
        if (chat.targetId == idx && chat.type == type) {

          console.log(chat);

          arr = chat;
        }
      });
      this.activeChat = arr;
      this.saveToStorage();
    },
    setGroupMemberChat (idx) {
      let chats = this.findChats()
      // 根据chatInfo.id 找到对应的 chat
      let arr = []
      chats.forEach(chat => {
        console.log(chat.targetId, idx);
        if (chat.targetId == idx) {
          arr = chat;
        }
      });
      this.groupMemberChat = arr;
      this.saveToStorage();
    },
    setUnreadCount (id) {
      let chats = this.findChats()
      chats.forEach(chat => {
        if (chat.targetId == id && chat.unreadCount === 0) {
          chat.unreadCount += 1;
          chat.stored = false;
        }
      });
      this.saveToStorage();
    },
    resetUnreadCount (chatInfo) {
      let chats = this.findChats()
      for (let idx in chats) {
        if (chats[idx].type == chatInfo.type &&
          chats[idx].targetId == chatInfo.targetId) {
          chats[idx].unreadCount = 0;
          chats[idx].atMe = false;
          chats[idx].atAll = false;
          chats[idx].stored = false;
          this.saveToStorage();
          break;
        }
      }
    },
    readedMessage (pos) {
      let chat = this.findChatByFriend(pos.friendId);
      if (!chat) return;
      chat.messages.forEach((m) => {
        if (m.id && m.selfSend && m.status < MESSAGE_STATUS.RECALL) {
          // pos.maxId为空表示整个会话已读
          if (!pos.maxId || m.id <= pos.maxId) {
            m.status = MESSAGE_STATUS.READED
            chat.stored = false;
          }
        }
      })
      this.saveToStorage()
    },
    // 添加黑名单
    addToTheBlacklist (id) {
      this.chats.forEach(chat => {
        if (chat.targetId === id) {
          chat.blacklist = true;
          chat.stored = false;
        }
      });
      this.saveToStorage()
    },
    // 在线状态更新
    updateOnlineStatus (content) {
      if (!content) return;
      this.chats.forEach(chat => {
        if (chat.targetId == content.id) {
          if (content.online) {
            chat.online = content.online;
            chat.onlineApp = content.onlineApp;
            chat.onlineWeb = content.onlineWeb;
            chat.stored = false;
          } else {
            chat.online = false;
            chat.onlineApp = false;
            chat.onlineWeb = false;
            chat.stored = false;
          }
        }
      });
      this.saveToStorage()
    },
    // 移除黑名单
    removeTheBlacklist (id) {
      this.chats.forEach(chat => {
        if (chat.targetId === id) {
          chat.blacklist = false;
          chat.stored = false;
        }
      });
      this.saveToStorage()
    },
    // 添加提醒
    addNotify (id, time) {
      let chats = this.findChats()
      chats.forEach(chat => {
        if (chat.targetId === id) {
          chat.notifyExpireTs = time
          chat.stored = false;
        }
      });
      this.saveToStorage()
    },
    // 添加星标好友
    setStar (id, type) {
      let chats = this.findChats()
      chats.forEach(chat => {
        if (chat.targetId === id) {
          chat.star = type
          chat.stored = false;
        }
      });
      this.saveToStorage()
    },
    setDownload (id, messageId, type) {
      let chats = this.findChats()
      chats.forEach(chat => {
        if (chat.targetId === id) {
          chat.messages.forEach(m => {
            if (m.id === messageId) {
              m.isDownload = type
            }
          })
          chat.stored = false;
        }
      });
      this.saveToStorage()
    },
    // 删除对话
    removeChat (idx) {
      let chats = this.findChats()
      if (chats[idx] == this.activeChat) {
        this.activeChat = null;
      }
      chats[idx].delete = true;
      chats[idx].stored = false;
      this.saveToStorage()
    },
    // 删除聊天记录
    removeRecord (idx) {
      let chats = this.findChats()
      chats[idx].messages = [];
      const userStore = useUserStore();
      let userId = userStore.userInfo.id;
      let key = "chats-" + userId;
      let chatKey = `${key}-${chats[idx].type}-${chats[idx].targetId}`
      this.setChatLoading(true)
      localForage.removeItem(chatKey).then(() => {
        this.setChatLoading(false)
      });
      chats[idx].stored = false;
      this.saveToStorage()
    },
    removePrivateChat (friendId) {
      let chats = this.findChats()
      for (let idx in chats) {
        if (chats[idx].type == 'PRIVATE' &&
          chats[idx].targetId === friendId) {
          this.removeChat(idx);
          break;
        }
      }
    },
    removeGroupChat (groupId) {
      let chats = this.findChats()
      for (let idx in chats) {
        if (chats[idx].type == 'GROUP' &&
          chats[idx].targetId === groupId) {
          this.removeChat(idx);
          break;
        }
      }
    },
    // 置顶
    moveTop (idx) {
      // 加载中不移动，很耗性能
      if (this.isLoading()) {
        return;
      }
      if (idx >= 0) {
        let chats = this.findChats()
        let chat = chats[idx];
        chats.splice(idx, 1);
        chats.unshift(chat);
        chat.lastSendTime = new Date().getTime();
        chat.stored = false;
        chat.top = true;
        this.saveToStorage()
      }
    },
    // 取消置顶
    unpinFromTop (idx) {
      if (this.isLoading()) {
        return;
      }

      if (idx >= 0) {
        let chats = this.findChats()
        let chat = chats[idx];

        // 先从原位置移除 chat
        chats.splice(idx, 1);

        // 找到最后一个置顶项的索引
        let insertIdx = 0;
        for (let i = 0; i < chats.length; i++) {
          if (chats[i].top) {
            insertIdx = i + 1;
          } else {
            break; // 一旦遇到非置顶项，停止查找
          }
        }

        // 插入到置顶项的最后一个后面
        chats.splice(insertIdx, 0, chat);

        // 更新 chat 状态
        chat.lastSendTime = new Date().getTime();
        chat.stored = false;
        chat.top = false;

        this.saveToStorage()
      }
    },
    //排序
    sortChats (idx) {
      if (this.isLoading()) {
        return;
      }
      if (idx > 0) {
        let chats = this.findChats()
        let chat = chats[idx];

        // 先从原位置移除 chat
        chats.splice(idx, 1);

        // 找到最后一个置顶项的索引
        let insertIdx = 0;
        for (let i = 0; i < chats.length; i++) {
          if (chats[i].top) {
            insertIdx = i + 1;
          } else {
            break; // 一旦遇到非置顶项，停止查找
          }
        }
        // 插入到置顶项的最后一个后面
        chats.splice(insertIdx, 0, chat);

        // 更新 chat 状态
        chat.lastSendTime = new Date().getTime();
        chat.stored = false;
        this.saveToStorage()
      }
    },
    insertMessage (msgInfo, chatInfo) {
      console.log("insertMessage", msgInfo, chatInfo);

      let type = chatInfo.type;
      // 记录消息的最大id
      if (msgInfo.id && type == "PRIVATE" && msgInfo.id > this.privateMsgMaxId) {
        this.privateMsgMaxId = msgInfo.id;
      }
      if (msgInfo.id && type == "GROUP" && msgInfo.id > this.groupMsgMaxId) {
        this.groupMsgMaxId = msgInfo.id;
      }
      if (msgInfo.seqNo && type == "SYSTEM" && msgInfo.seqNo > this.systemMsgMaxSeqNo) {
        this.systemMsgMaxSeqNo = msgInfo.seqNo;
      }
      // 如果是已存在消息，则覆盖旧的消息数据
      let chat = this.findChat(chatInfo);
      let message = this.findMessage(chat, msgInfo);
      if (message) {
        Object.assign(message, msgInfo);
        chat.stored = false;
        this.saveToStorage();
        return;
      }
      // 插入新的数据
      if (msgInfo.type == MESSAGE_TYPE.IMAGE) {
        chat.lastContent = "[图片]";
      } else if (msgInfo.type == MESSAGE_TYPE.VIDEO) {
        chat.lastContent = "[视频]";
      } else if (msgInfo.type == MESSAGE_TYPE.FILE) {
        chat.lastContent = "[文件]";
      } else if (msgInfo.type == MESSAGE_TYPE.AUDIO) {
        chat.lastContent = "[语音]";
      } else if (msgInfo.type == MESSAGE_TYPE.USER_CARD) {
        chat.lastContent = "[个人名片] " + JSON.parse(msgInfo.content).nickName;
      } else if (msgInfo.type == MESSAGE_TYPE.GROUP_CARD) {
        chat.lastContent = "[群名片] " + JSON.parse(msgInfo.content).groupName;
      } else if (msgInfo.type == MESSAGE_TYPE.FORWARD) {
        chat.lastContent = "[转发消息]";
      } else if (msgInfo.type == MESSAGE_TYPE.ACT_RT_VOICE) {
        chat.lastContent = "[语音通话]";
      } else if (msgInfo.type == MESSAGE_TYPE.ACT_RT_VIDEO) {
        chat.lastContent = "[视频通话]";
      } else if (msgInfo.type == MESSAGE_TYPE.SYSTEM_MESSAGE) {
        chat.lastContent = msgInfo.title;
      } else if (msgInfo.type == MESSAGE_TYPE.TEXT ||
        msgInfo.type == MESSAGE_TYPE.RECALL ||
        msgInfo.type == MESSAGE_TYPE.TIP_TEXT) {
        chat.lastContent = msgInfo.content;
      }
      chat.lastSendTime = msgInfo.sendTime;
      chat.sendNickName = msgInfo.sendNickName;
      // 未读加1
      if (!msgInfo.selfSend && msgInfo.status != MESSAGE_STATUS.READED &&
        msgInfo.status != MESSAGE_STATUS.RECALL && msgInfo.type != MESSAGE_TYPE.TIP_TEXT) {
        console.log("未读消息", this.activeChat);
        // if (!this.activeChat.notifyExpireTs > 0) {
        // }
        chat.unreadCount++;
      }
      // 是否有人@我
      if (!msgInfo.selfSend && chat.type == "GROUP" && msgInfo.atUserIds &&
        msgInfo.status != MESSAGE_STATUS.READED) {
        const userStore = useUserStore();
        let userId = userStore.userInfo.id;
        if (msgInfo.atUserIds.indexOf(userId) >= 0) {
          chat.atMe = true;
        }
        if (msgInfo.atUserIds.indexOf(-1) >= 0) {
          chat.atAll = true;
        }
      }
      // 间隔大于10分钟插入时间显示
      if (!chat.lastTimeTip || (chat.lastTimeTip < msgInfo.sendTime - 600 * 1000)) {
        chat.messages.push({
          sendTime: msgInfo.sendTime,
          type: MESSAGE_TYPE.TIP_TIME,
        });
        chat.lastTimeTip = msgInfo.sendTime;
      }
      // 根据id顺序插入，防止消息乱序
      let insertPos = chat.messages.length;
      // 防止 图片、文件 在发送方 显示 在顶端  因为还没存库，id=0
      if (type != "SYSTEM" && msgInfo.id && msgInfo.id > 0) {
        for (let idx in chat.messages) {
          if (chat.messages[idx].id && msgInfo.id < chat.messages[idx].id) {
            insertPos = idx;
            console.log(`消息出现乱序,位置:${chat.messages.length},修正至:${insertPos}`);
            break;
          }
        }
      }
      // 系统消息是按序列号发送
      if (type == "SYSTEM" && msgInfo.seqNo && msgInfo.seqNo > 0) {
        for (let idx in chat.messages) {
          if (chat.messages[idx].seqNo && msgInfo.seqNo < chat.messages[idx].seqNo) {
            insertPos = idx;
            console.log(`消息出现乱序,位置:${chat.messages.length},修正至:${insertPos}`);
            break;
          }
        }
      }
      chat.messages.splice(insertPos, 0, msgInfo);
      chat.stored = false;
      this.saveToStorage();
    },
    updateMessage (msgInfo, chatInfo) {
      // 获取对方id或群id
      let chat = this.findChat(chatInfo);
      let message = this.findMessage(chat, msgInfo);
      if (message) {
        // 属性拷贝
        Object.assign(message, msgInfo);
        chat.stored = false;
        this.saveToStorage()
      }
    },
    deleteMessage (msgInfo, chatInfo) {
      console.log('deleteMessage', msgInfo, chatInfo);
      let chat = this.findChat(chatInfo);
      for (let idx in chat.messages) {
        // 已经发送成功的，根据id删除
        if (chat.messages[idx].id && chat.messages[idx].id == msgInfo.id) {
          chat.messages.splice(idx, 1);
          break;
        }
        // 正在发送中的消息可能没有id，只有临时id
        if (chat.messages[idx].tmpId && chat.messages[idx].tmpId == msgInfo.tmpId) {
          chat.messages.splice(idx, 1);
          break;
        }
      }
      chat.stored = false;
      this.saveToStorage()
    },
    remoteDeletionMessage (msgInfo, chatInfo) {
      let chat = this.findChat(chatInfo);
      const msgIds = new Set(msgInfo.msgIds); // 用 Set 提高查找效率
      const messages = chat.messages;

      for (let i = messages.length - 1; i >= 0; i--) {
        const msg = messages[i];

        const isMatch =
          (msg.id && msgIds.has(msg.id)) ||
          (msg.tmpId && msgIds.has(msg.tmpId));

        if (isMatch) {
          // 先判断上一条是否 type === 20，如果是，先删除它
          if (i > 0 && messages[i - 1].type === 20) {
            messages.splice(i - 1, 1); // 删除上一条
            i--; // 索引前移，避免跳过下一个元素
          }

          messages.splice(i, 1); // 删除当前消息
        }
      }

      chat.stored = false;
      this.saveToStorage();
    },
    recallMessage (msgInfo, chatInfo) {
      let chat = this.findChat(chatInfo);
      if (!chat) return;
      // 要撤回的消息id
      let id = msgInfo.content;
      let name = msgInfo.selfSend ? '你' : chat.type == 'PRIVATE' ? '对方' : msgInfo.sendNickName;
      for (let idx in chat.messages) {
        let m = chat.messages[idx];
        if (m.id && m.id == id) {
          // 改造成一条提示消息
          m.status = MESSAGE_STATUS.RECALL;
          m.content = name + "撤回了一条消息";
          m.type = MESSAGE_TYPE.TIP_TEXT
          // 会话列表
          chat.lastContent = m.content;
          chat.lastSendTime = msgInfo.sendTime;
          chat.sendNickName = '';
          if (!msgInfo.selfSend && msgInfo.status != MESSAGE_STATUS.READED) {
            chat.unreadCount++;
          }
        }
        // 被引用的消息也要撤回
        if (m.quoteMessage && m.quoteMessage.id == msgInfo.id) {
          m.quoteMessage.content = "引用内容已撤回";
          m.quoteMessage.status = MESSAGE_STATUS.RECALL;
          m.quoteMessage.type = MESSAGE_TYPE.TIP_TEXT
        }
      }
      chat.stored = false;
      this.saveToStorage()
    },
    updateChatFromFriend (friend) {
      let chat = this.findChatByFriend(friend.id);
      // 更新会话中的昵称和头像
      if (chat && (chat.headImage != friend.headImage ||
        chat.showName != friend.showNickName)) {
        chat.headImage = friend.headImage;
        chat.showName = friend.showNickName;
        chat.stored = false;
        this.saveToStorage()
      }

    },
    updateChatFromUser (user) {
      let chat = this.findChatByFriend(user.id);
      // 更新会话中的昵称和头像
      if (chat && (chat.headImage != user.headImageThumb ||
        chat.showName != user.nickName)) {
        chat.headImage = user.headImageThumb;
        chat.showName = user.nickName;
        chat.stored = false;
        this.saveToStorage()
      }
    },
    updateChatFromGroup (group) {
      let chat = this.findChatByGroup(group.id);
      if (chat && (chat.headImage != group.headImageThumb ||
        chat.showName != group.showGroupName)) {
        // 更新会话中的群名称和头像
        chat.headImage = group.headImageThumb;
        chat.showName = group.showGroupName;
        chat.stored = false;
        this.saveToStorage()
      }
    },
    setLoadingPrivateMsg (loading) {
      this.loadingPrivateMsg = loading;
      if (!this.isLoading()) {
        this.refreshChats();
      }
    },
    setLoadingGroupMsg (loading) {
      this.loadingGroupMsg = loading;
      if (!this.isLoading()) {
        this.refreshChats();
      }
    },
    setLoadingSystemMsg (loading) {
      this.loadingSystemMsg = loading;
      if (!this.isLoading()) {
        this.refreshChats();
      }
    },
    refreshChats () {
      if (!cacheChats) return;
      // 排序
      cacheChats.sort((chat1, chat2) => chat2.lastSendTime - chat1.lastSendTime);
      // 记录热数据索引位置
      cacheChats.forEach(chat => chat.hotMinIdx = chat.messages.length);
      // 将消息一次性装载回来
      this.chats = cacheChats;
      // 清空缓存
      cacheChats = null;
      // 持久化消息
      this.saveToStorage(true);
    },
    saveToStorage (withColdMessage) {
      // 加载中不保存，防止卡顿
      if (this.isLoading()) {
        return;
      }
      const userStore = useUserStore();
      let userId = userStore.userInfo.id;
      let key = "chats-" + userId;
      let chatKeys = [];
      // 按会话为单位存储，
      this.chats.forEach((chat) => {
        // 只存储有改动的会话
        let chatKey = `${key}-${chat.type}-${chat.targetId}`
        if (!chat.stored) {
          if (chat.delete) {
            localForage.removeItem(chatKey);
          } else {
            // 存储冷数据
            if (withColdMessage) {
              let coldChat = Object.assign({}, chat);
              coldChat.messages = chat.messages.slice(0, chat.hotMinIdx);
              console.log("coldChat.messages:", coldChat.messages.length)
              localForage.setItem(chatKey, coldChat)
            }
            // 存储热消息
            let hotKey = chatKey + '-hot';
            let hotChat = Object.assign({}, chat);
            hotChat.messages = chat.messages.slice(chat.hotMinIdx)
            localForage.setItem(hotKey, hotChat)
          }
          chat.stored = true;
        }
        if (!chat.delete) {
          chatKeys.push(chatKey);
        }
      })
      // 会话核心信息
      let chatsData = {
        privateMsgMaxId: this.privateMsgMaxId,
        groupMsgMaxId: this.groupMsgMaxId,
        systemMsgMaxSeqNo: this.systemMsgMaxSeqNo,
        chatKeys: chatKeys
      }
      localForage.setItem(key, chatsData)
      // 清理已删除的会话
      this.chats = this.chats.filter(chat => !chat.delete)
    },

    clear () {
      cacheChats = []
      this.chats = [];
      this.activeChat = null;
    },
    updateChatsOnlineStatus (friends) {
      console.log("更新聊天在线状态====>>>", friends.friends);

      // 创建好友ID到在线状态的映射
      const onlineStatusMap = new Map();
      friends.forEach(friend => {
        onlineStatusMap.set(friend.id, {
          online: friend.online,
          onlineApp: friend.onlineApp,
          onlineWeb: friend.onlineWeb
        });
      });

      // 更新所有私聊会话的在线状态
      this.chats.forEach(chat => {
        if (chat.type === 'PRIVATE') {
          const status = onlineStatusMap.get(chat.targetId);
          if (status) {
            chat.online = status.online;
            chat.onlineApp = status.onlineApp;
            chat.onlineWeb = status.onlineWeb;
            chat.stored = false; // 标记需要保存
          }
        }
      });

      // 保存更新后的状态
      this.saveToStorage()
    },
    loadChat () {
      return new Promise((resolve, reject) => {
        let userStore = useUserStore();
        let userId = userStore.userInfo.id;
        let key = "chats-" + userId;
        localForage.getItem(key).then((chatsData) => {
          if (!chatsData) {
            resolve();
          } else if (chatsData.chatKeys) {
            const promises = [];
            chatsData.chatKeys.forEach(key => {
              promises.push(localForage.getItem(key))
              promises.push(localForage.getItem(key + "-hot"))
            })
            Promise.all(promises).then(chats => {
              chatsData.chats = [];
              // 偶数下标为冷消息，奇数下标为热消息
              for (let i = 0; i < chats.length; i += 2) {
                if (!chats[i] && !chats[i + 1]) {
                  continue;
                }
                let coldChat = chats[i];
                let hotChat = chats[i + 1];
                // 冷热消息合并
                let chat = Object.assign({}, coldChat, hotChat);
                if (hotChat && coldChat) {
                  chat.messages = coldChat.messages.concat(hotChat
                    .messages)
                }
                if (chat.targetId == 2) {
                  console.log("chat.messages.length1:", coldChat.messages.length)
                  console.log("chat.messages.length2:", hotChat.messages.length)
                  console.log("chat.messages.length3:", chat.messages.length)
                }
                chatsData.chats.push(chat);
              }
              this.initChats(chatsData);
              resolve();
            })
          }
        }).catch((e) => {
          console.log("加载消息失败")
          reject();
        })
      })
    },

    async addBlacklist (userId) {
      try {
        await http.post(`/blacklist/add?userId=${userId}`);
        this.addToTheBlacklist(userId)
        return 'success'; // 显式返回
      } catch (e) {
        return Promise.reject(e); // 抛错由组件处理
      }
    },
    // 移除黑名单
    async removeBlacklist (userId) {
      try {
        await http.delete(`/blacklist/remove?userId=${userId}`);
        this.removeTheBlacklist(userId);
        return 'success'; // 显式返回
      } catch (e) {
        return Promise.reject(e); // 抛错由组件处理
      }
    }
  },
  getters: {
    isLoading: (state) => () => {
      return state.loadingPrivateMsg || state.loadingGroupMsg || state.loadingSystemMsg
    },
    findChats: (state) => () => {
      if (cacheChats && state.isLoading()) {
        return cacheChats;
      }
      return state.chats;
    },
    findChatIdx: (state) => (chat) => {
      let chats = state.findChats();
      for (let idx in chats) {
        if (chats[idx].type == chat.type &&
          chats[idx].targetId === chat.targetId) {
          chat = chats[idx];
          return idx
        }
      }
    },
    findChat: (state) => (chat) => {
      let chats = state.findChats();
      let idx = state.findChatIdx(chat);
      return chats[idx];
    },
    findChatByFriend: (state) => (fid) => {
      let chats = state.findChats();
      return chats.find(chat => chat.type == 'PRIVATE' &&
        chat.targetId == fid)
    },
    findChatByGroup: (state) => (gid) => {
      let chats = state.findChats();
      return chats.find(chat => chat.type == 'GROUP' &&
        chat.targetId == gid)
    },
    findMessage: (state) => (chat, msgInfo) => {
      if (!chat || !chat.messages) return null;

      if (chat.type === 'SYSTEM') {
        // 系统消息通过 seqNo 判断唯一
        if (msgInfo.seqNo) {
          return chat.messages.find(m => m.seqNo === msgInfo.seqNo);
        }
      } else {
        return chat.messages.find(m => {
          // 优先用 clientMsgId 去重
          if (msgInfo.clientMsgId && m.clientMsgId === msgInfo.clientMsgId) return true;

          // 其次使用后端 id 去重（发送成功后）
          if (msgInfo.id && m.id === msgInfo.id) return true;

          // 向后兼容旧逻辑：使用 tmpId 判断
          if (msgInfo.tmpId && m.tmpId && msgInfo.tmpId === m.tmpId) return true;

          return false;
        });
      }

      return null;
    }

  }
})