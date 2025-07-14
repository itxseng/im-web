<template>
  <div>
    <div :class="['chat-item',chat.top ? 'top' : '',active ? 'top' : '']"
         @contextmenu.prevent="showRightMenu($event,chat)">
      <div class="chat-left">
        <head-image :url="chat.headImage"
                    :name="chat.showName"
                    :size="42"
                    :online="chat.online"
                    :id="chat.type == 'PRIVATE' ? chat.targetId : 0"
                    :isShowUserInfo="false"></head-image>
      </div>
      <div class="chat-right">
        <div class="chat-name">
          <div class="chat-name-text">
            <div>{{ chat.showName }}</div>
            <el-tag v-if="chat.type == 'GROUP'"
                    size="mini">群聊</el-tag>
            <el-tag v-if="chat.type == 'SYSTEM'"
                    size="mini"
                    class="tag-system">官方</el-tag>
          </div>
          <div class="chat-time-text">{{ showTime }}</div>
          <!-- <div class="top-icon"
             v-if="chat.top"></div> -->
        </div>
        <div class="chat-content">
          <div class="chat-at-text">{{ atText }}</div>
          <div class="chat-send-name"
               v-show="isShowSendName">{{ chat.sendNickName + ':&nbsp;' }}</div>
          <div class="chat-content-text"
               v-html="content"></div>
          <div v-show="chat.unreadCount > 0"
               :class="['unread-text',chat.notifyExpireTs > 0 ? 'unread-text-color' : '']">{{ chat.unreadCount }}</div>
          <ChatItemIcon class="chat-item-icon"
                        v-show="!chat.unreadCount > 0"
                        :chat="chat" />
        </div>
      </div>
    </div>
    <right-menu ref="rightMenu"
                @select="onSelectMenu"></right-menu>
  </div>
</template>

<script>
import HeadImage from '../common/HeadImage.vue';
import RightMenu from '../common/RightMenu.vue';
import ChatItemIcon from './ChatItemIcon.vue';
export default {
  name: "chatItem",
  components: {
    HeadImage,
    RightMenu,
    ChatItemIcon
  },
  data () {
    return {
      menuItems: [
        // {
        //   key: 'GUIDANG',
        //   name: '归档',
        //   icon: 'el-icon-top'
        // }, 
        {
          key: 'TOP',
          name: '置顶',
          icon: 'el-icon-top'
        },
        {
          key: 'CHAKANGERENXINXI',
          name: '查看个人信息',
          icon: 'el-icon-delete'
        }, {
          key: 'XIAOXITONGZHI',
          name: '关闭消息通知',
          icon: 'el-icon-delete'
        }, {
          key: 'BIAOWEIWEIDU',
          name: '标为未读',
          icon: 'el-icon-delete'
        }, {
          key: 'DELETE',
          name: '删除对话',
          icon: 'el-icon-delete'
        }, {
          key: 'QINGCHU',
          name: '清除历史记录',
          icon: 'el-icon-delete'
        }, {
          key: 'HEIMINGDAN',
          name: '加入黑名单',
          icon: 'el-icon-delete'
        }, {
          key: 'TOUSU',
          name: '投诉',
          icon: 'el-icon-delete'
        },
        // {
        //   key: 'INFO',
        //   name: '查看资料'
        // }
      ]
    }
  },
  props: {
    chat: {
      type: Object
    },
    active: {
      type: Boolean
    },
    index: {
      type: Number
    }
  },
  methods: {
    showRightMenu (e, chat) {
      if (chat.blacklist) {
        this.menuItems.forEach(item => {
          if (item.key === 'HEIMINGDAN') {
            item.name = '移出黑名单'
            item.icon = 'el-icon-remove-outline'
          }
        })
      } else {
        this.menuItems.forEach(item => {
          if (item.key === 'HEIMINGDAN') {
            item.name = '加入黑名单'
            item.icon = 'el-icon-circle-plus-outline'
          }
        })
      }
      if (chat.notifyExpireTs) {
        this.menuItems.forEach(item => {
          if (item.key === 'XIAOXITONGZHI') {
            item.name = '开启消息通知'
            item.icon = 'el-icon-remove-outline'
          }
        })
      } else {
        this.menuItems.forEach(item => {
          if (item.key === 'XIAOXITONGZHI') {
            item.name = '关闭消息通知'
            item.icon = 'el-icon-circle-plus-outline'
          }
        })
      }
      if (chat.top) {
        let obj = {
          key: 'UNPINFROMTOP',
          name: '取消置顶',
          icon: 'el-icon-bottom'
        }
        this.menuItems.forEach(item => {
          if (item.key === 'TOP') {
            this.menuItems.splice(this.menuItems.indexOf(item), 1, obj)
          }
        })
        this.$refs.rightMenu.open(e, this.menuItems);
      } else {
        let obj = {
          key: 'TOP',
          name: '置顶',
          icon: 'el-icon-top'
        }
        this.menuItems.forEach(item => {
          if (item.key === 'UNPINFROMTOP') {
            this.menuItems.splice(this.menuItems.indexOf(item), 1, obj)
          }
        })
        // if (this.chat.type == 'PRIVATE' || this.chat.type == 'GROUP') {
        //   this.menuItems.push({
        //     key: 'INFO',
        //     name: '查看资料'
        //   })
        // }
        this.$refs.rightMenu.open(e, this.menuItems);
      }
    },
    onSelectMenu (item) {
      console.log(item.key.toLowerCase());
      this.$emit(item.key.toLowerCase(), this.chat);

      // if (item.key === 'HEIMINGDAN' || item.key === 'CHAKANGERENXINXI' || item.key === 'BIAOWEIWEIDU' || item.key === 'QINGCHU') {
      // } 
      // else {
      //   this.$emit(item.key.toLowerCase(), this.msgInfo);
      // }
    }
  },
  computed: {
    content () {
      if (this.chat.messages.length == 0) {
        return "";
      }
      let msg = this.chat.messages[this.chat.messages.length - 1];
      let content = "不支持的消息类型"
      if (msg.type == this.$enums.MESSAGE_TYPE.IMAGE) {
        content = "[图片]";
      } else if (msg.type == this.$enums.MESSAGE_TYPE.VIDEO) {
        content = "[视频]";
      } else if (msg.type == this.$enums.MESSAGE_TYPE.FILE) {
        content = "[文件]";
      } else if (msg.type == this.$enums.MESSAGE_TYPE.AUDIO) {
        content = "[语音]";
      } else if (msg.type == this.$enums.MESSAGE_TYPE.USER_CARD) {
        content = "[个人名片] " + JSON.parse(msg.content).nickName;
      } else if (msg.type == this.$enums.MESSAGE_TYPE.GROUP_CARD) {
        content = "[群名片] " + JSON.parse(msg.content).groupName;
      } else if (msg.type == this.$enums.MESSAGE_TYPE.FORWARD) {
        content = "[转发消息]";
      } else if (msg.type == this.$enums.MESSAGE_TYPE.ACT_RT_VOICE) {
        content = "[语音通话]";
      } else if (msg.type == this.$enums.MESSAGE_TYPE.ACT_RT_VIDEO) {
        content = "[视频通话]";
      } else if (msg.type == this.$enums.MESSAGE_TYPE.SYSTEM_MESSAGE) {
        content = msg.title;
      } else if (msg.type == this.$enums.MESSAGE_TYPE.TEXT ||
        msg.type == this.$enums.MESSAGE_TYPE.RECALL ||
        msg.type == this.$enums.MESSAGE_TYPE.TIP_TEXT) {
        content = this.$emo.transform(msg.content, 'emoji-small');
      } if (msg.type === this.$enums.MESSAGE_TYPE.CONFERENCE) {
        content = "[群会议]";
      }
      return content;
    },
    isShowSendName () {
      if (!this.chat.sendNickName) {
        return false;
      }
      let size = this.chat.messages.length;
      if (size == 0) {
        return false;
      }
      // 只有群聊的普通消息需要显示名称
      let lastMsg = this.chat.messages[size - 1];
      return this.$msgType.isNormal(lastMsg.type)
    },
    showTime () {
      return this.$date.toTimeText(this.chat.lastSendTime, true)
    },
    atText () {
      if (this.chat.atMe) {
        return "[有人@我]"
      } else if (this.chat.atAll) {
        return "[@全体成员]"
      }
      return "";
    }
  }
}
</script>

<style lang="scss" scoped>
  .chat-item {
    width: 100%;
    height: 60px;
    display: flex;
    position: relative;
    padding: 5px 10px;
    align-items: center;
    background-color: #fff;
    white-space: nowrap;
    cursor: pointer;
    box-sizing: border-box;
    &:hover {
      background-color: var(--im-background-active);
    }

    &.active {
      background-color: var(--im-background-active-dark);
    }

    .chat-left {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .chat-right {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding-left: 10px;
      text-align: left;
      overflow: hidden;
      position: relative;
      .top-icon {
        width: 15px;
        height: 20px;
        position: absolute;
        top: 25px;
        right: 10px;
        background: url("../../assets/chat/top-icon.png") no-repeat center;
        background-size: 100%;
      }
      .chat-name {
        display: flex;
        line-height: 20px;
        height: 20px;

        .chat-name-text {
          flex: 1;
          display: flex;
          align-items: center;
          font-size: var(--im-font-size);
          white-space: nowrap;
          overflow: hidden;

          .el-tag {
            min-width: 22px;
            text-align: center;
            border-radius: 10px;
            border: 0;
            height: 14px;
            line-height: 14px;
            font-size: 10px;
            padding: 0px 5px;
            background-color: #3066ec;
            color: white;
            margin-left: 5px;
          }

          .tag-system {
            font-size: 10px;
            background: #f04e4e;
            color: white;
            margin-left: 2px;
          }
        }

        .chat-time-text {
          font-size: var(--im-font-size-smaller);
          text-align: right;
          color: var(--im-text-color-light);
          white-space: nowrap;
          overflow: hidden;
          padding-left: 10px;
        }
      }

      .chat-content {
        width: 100%;
        display: flex;
        line-height: 22px;
        position: relative;
        .unread-text {
          position: absolute;
          background-color: #fd0200;
          right: 0px;
          top: 5px;
          color: white;
          border-radius: 50px;
          padding: 1px 4px;
          font-size: 9px;
          line-height: 11px;
          text-align: center;
          white-space: nowrap;
        }
        .unread-text-color {
          background-color: #4f4c4c66 !important;
        }
        .chat-at-text {
          color: #c70b0b;
          font-size: var(--im-font-size-smaller);
        }

        .chat-send-name {
          font-size: var(--im-font-size-small);
          color: var(--im-text-color-light);
        }

        .chat-content-text {
          // flex: 1;
          width: calc(100% - 55px);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: var(--im-font-size-small);
          color: var(--im-text-color-light);
        }
      }
    }
  }
  .top {
    background-color: var(--im-background-active-dark) !important;
  }
</style>
