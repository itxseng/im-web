<template>
  <div class="tab-bar">
    <div :class="[routerPath === '/home/chat' ? 'messages-click' : 'messages']"
         @click="goToRoute('/home/chat')">
      <div class="messages-tip"
           v-if="messagesTip">{{messagesTip}}</div>
    </div>
    <div :class="[routerPath === '/home/friend' ? 'linkman-click' : 'linkman']"
         @click="goToRoute('/home/friend')">
      <div class="linkman-tip"
           v-if="linkmanTip">{{linkmanTip}}</div>
    </div>
    <div :class="[routerPath === '/home/group' ? 'user-click' : 'user']"
         @click="goToRoute('/home/group')"></div>
    <div :class="[routerPath === '/home/user' ? 'user-click' : 'user']"
         @click="goToRoute('/home/user')"></div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      routerPath: null
    }
  },
  mounted () {
    this.routerPath = this.$route.path;
  },
  methods: {
    goToRoute (route) {
      if (route) {
        this.$router.push(route);
      }
    }
  },
  computed: {
    mine () {
      return this.userStore.userInfo;
    },
    messagesTip () {
      let messagesTip = 0;
      let chats = this.chatStore.chats;
      chats.forEach((chat) => {
        if (!chat.delete) {
          messagesTip += chat.unreadCount
        }
      });
      return messagesTip;
    },
    linkmanTip () {
      let requests = this.friendStore.requests;
      return requests.filter((req) => req.recvId == this.mine.id && req.status == 1).length;
    },
  },
  watch: {
    messagesTip: {
      handler (newCount, oldCount) {
        let tip = newCount > 0 ? `${newCount}条未读` : "";
        this.$elm.setTitleTip(tip);
      },
      immediate: true
    }
  }
}
</script>
<style lang="scss" scoped>
  .tab-bar {
    width: calc(100% - 16px);
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    padding: 0 8px;
    border-top: 1px solid #eee;
    .user,
    .linkman,
    .messages {
      width: 25px;
      height: 25px;
      background: url("../../assets/icon/navBar/messages.png") no-repeat center
        center;
      background-size: 100%;
      cursor: pointer;
      position: relative;
    }
    .user {
      background: url("../../assets/icon/navBar/user.png") no-repeat center center;
      background-size: 100%;
    }
    .linkman {
      background: url("../../assets/icon/navBar/linkman.png") no-repeat center
        center;
      background-size: 100%;
    }
    .user-click,
    .user:hover {
      background: url("../../assets/icon/navBar/user-click.png") no-repeat center
        center;
      background-size: 100%;
    }
    .linkman-click,
    .linkman:hover {
      background: url("../../assets/icon/navBar/linkman-click.png") no-repeat
        center center;
      background-size: 100%;
    }
    .messages-click,
    .messages:hover {
      background: url("../../assets/icon/navBar/messages-click.png") no-repeat
        center center;
      background-size: 100%;
    }
    .user-click,
    .linkman-click,
    .messages-click {
      width: 25px;
      height: 25px;
      cursor: pointer;
      position: relative;
    }
    .linkman-tip,
    .messages-tip {
      position: absolute;
      background-color: var(--im-color-danger);
      left: 13px;
      top: -8px;
      color: white;
      border-radius: 30px;
      padding: 0 3px;
      font-size: 12px;
      text-align: center;
      white-space: nowrap;
      border: 1px solid #f1e5e5;
    }
  }
</style>