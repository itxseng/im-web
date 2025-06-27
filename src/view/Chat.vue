<template>
  <el-container class="chat-page">
    <el-aside width="300px"
              class="chat-list-box">
      <div class="chat-list-header">
        <el-input class="search-text"
                  size="small"
                  placeholder="搜索"
                  v-model="searchText">
          <i class="el-icon-search el-input__icon"
             slot="prefix"> </i>
        </el-input>
        <div class="chat-list-header-btn">
          <el-popover placement="top-start"
                      width="100"
                      trigger="hover">
            <div class="chat-list-header-btn-list">
              <div class="friend"
                   @click="showAddFriend = true">
                <span class="icon"></span>
                <span>添加联系人</span>
              </div>
              <div class="group"
                   @click="onCreateGroup">
                <span class="icon"></span>
                <span>新建群聊</span>
              </div>
            </div>
            <i class="el-icon-plus"
               slot="reference"></i>
          </el-popover>
        </div>
      </div>
      <div class="chat-list-loading"
           v-if="loading"
           v-loading="true"
           element-loading-text="消息接收中..."
           element-loading-spinner="el-icon-loading"
           element-loading-background="#F9F9F9"
           element-loading-size="24">
      </div>
      <el-scrollbar class="chat-list-items"
                    v-else>
        <div v-for="(chat, index) in chatStore.chats"
             :key="index">
          <chat-item v-if="!chat.delete && (chat.showName || '').includes(searchText)"
                     :chat="chat"
                     :index="index"
                     @click.native="onActiveItem(chat,index)"
                     @delete="onDelItem(chat)"
                     @top="onTop(chat)"
                     @info="onShowInfo(chat)"
                     @unpinfromtop="unpinFromTop(chat)"
                     @biaoweiweidu="setUnread"
                     @heimingdan="blacklist"
                     @chakangerenxinxi="showFriendInfo(chat)"
                     :active="chat === chatStore.activeChat"></chat-item>
        </div>
      </el-scrollbar>
      <NavBar v-if="!loading" />
    </el-aside>
    <el-container class="chat-box">
      <div class="img-box"
           v-if="!activeChat">
        <img src="@/assets/bg-logo.png"
             alt="">
      </div>
      <chat-box v-if="activeChat && activeChat.type != 'SYSTEM'"
                :chat="activeChat"
                :itemIndex="isShow"
                :showUserInfo="showUserInfo"></chat-box>
      <chat-system-box v-if="activeChat && activeChat.type == 'SYSTEM'"
                       :chat="activeChat"></chat-system-box>
      <add-friend :dialogVisible="showAddFriend"
                  @close="onCloseAddFriend"></add-friend>
      <el-dialog :visible.sync="dialogModal"
                 width="450px"
                 :destroy-on-close="true">
        <CreateGroup @reload="dialogModalClose"
                     @close="dialogModalClose" />
      </el-dialog>
    </el-container>
  </el-container>
</template>

<script>
import ChatItem from "../components/chat/ChatItem.vue";
import ChatBox from "../components/chat/ChatBox.vue";
import ChatSystemBox from "../components/chat/ChatSystemBox.vue";
import NavBar from "../components/navBar/index.vue";
import AddFriend from "@/components/friend/AddFriend.vue";
import CreateGroup from "@/components/group/CreateGroup.vue";
export default {
  name: "chat",
  components: {
    ChatItem,
    ChatBox,
    ChatSystemBox,
    NavBar,
    AddFriend,
    CreateGroup
  },
  data () {
    return {
      searchText: "",
      messageContent: "",
      group: {},
      groupMembers: [],
      isShow: null,
      showAddFriend: false,
      dialogModal: false,
      friendInfoModal: false,
      editRemarkState: false,
      editMessage: null,// 需要被修改的消息
      isSelected: false,
      selectMessageList: [],
      dialogType: '',
      commonGroupList: [],
      showUserInfo: false
    }
  },
  methods: {
    dialogModalClose () {
      this.dialogModal = false;
    },
    onCreateGroup () {
      this.dialogModal = true;
    },
    onCloseAddFriend () {
      this.showAddFriend = false;
    },
    onActiveItem (item, index) {
      this.showUserInfo = false
      this.isShow = index
      this.chatStore.setActiveChat(item.targetId);
    },
    onDelItem (chat) {
      const idx = this.chatStore.findChatIdx(chat)
      this.chatStore.removeChat(idx);
    },
    onTop (chat) {
      const idx = this.chatStore.findChatIdx(chat)
      this.chatStore.moveTop(idx);
    },
    onShowInfo (chat) {
      if (chat.type == 'PRIVATE') {
        this.$router.push("/home/friend?id=" + chat.targetId);
      } else if (chat.type == 'GROUP') {
        if (!this.groupStore.isGroup(chat.targetId)) {
          this.$message.error("您已不在群聊中，无法查看群资料")
          return;
        }
        this.$router.push("/home/group?id=" + chat.targetId);
      }
    },
    unpinFromTop (chat) {
      const idx = this.chatStore.findChatIdx(chat)
      this.chatStore.unpinFromTop(idx)
    },
    // 添加黑名单
    blacklist (item) {
      console.log(item);
      if (item.blacklist) {
        this.chatStore.removeBlacklist(item.targetId)
          .then(() => {
            this.$message.success('已移出黑名单');
          })
      } else {
        this.chatStore.addBlacklist(item.targetId)
          .then(() => {
            this.$message.success('已加入黑名单');
          })
      }
    },
    showFriendInfo (item) {
      this.chatStore.chats.forEach((chat, index) => {
        if (item.targetId == chat.targetId) {
          this.isShow = index
        }
      })
      this.chatStore.setActiveChat(item.targetId);
      this.showUserInfo = true
    },
    // 设置未读表示
    setUnread (item) {
      this.chatStore.setUnreadCount(item.targetId);
    }
  },
  computed: {
    activeChat () {
      return this.chatStore.activeChat;
    },
    loading () {
      console.log('loading:', this.chatStore.loadingGroupMsg, this.chatStore.loadingPrivateMsg)
      return this.chatStore.loadingGroupMsg || this.chatStore.loadingPrivateMsg
    }
  }
}
</script>

<style lang="scss">
  .chat-page {
    .chat-list-box {
      display: flex;
      flex-direction: column;
      background: #fff;
      flex: 0 0 300px;
      width: 300px;

      .chat-list-header {
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 8px 5px 8px;
        .search-text {
          width: calc(100% - 42px);
          height: 32px;
          border: none;
          background-color: #f1f1f1;
          border-radius: 4px;
        }
        .el-input__inner {
          border: 0px !important;
          background-color: #f1f1f1;
          border-radius: 4px;
        }
        .chat-list-header-btn {
          width: 32px;
          height: 32px;
          background-color: #f1f1f1;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          .el-icon-plus {
            color: #ccc;
          }
        }
      }
      .chat-list-loading {
        height: 50px;
        background-color: #eee;

        .el-icon-loading {
          font-size: 24px;
          color: var(--im-text-color-light);
        }

        .el-loading-text {
          color: var(--im-text-color-light);
        }

        .chat-loading-box {
          height: 100%;
        }
      }

      .chat-list-items {
        flex: 1;
        width: 100%;
      }
    }
    .chat-box {
      flex: 1;
      background: linear-gradient(
        270deg,
        #ffffff 0%,
        rgba(224, 232, 251, 0.5) 100%
      );
      .img-box {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        img {
          width: 120px;
          height: 130px;
        }
      }
    }
  }
  .chat-item-top {
    background-color: var(--im-background-active-dark) !important;
  }
  .chat-list-header-btn-list {
    width: 100%;
    display: flex;
    flex-direction: column;
    .icon {
      width: 12px;
      height: 12px;
      margin-right: 5px;
    }
    .group,
    .friend {
      width: 100%;
      height: 30px;
      padding-left: 15px;
      box-sizing: border-box;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      cursor: pointer;
      .icon {
        background: url("~@/assets/chat/add-friend-icon.png") no-repeat center;
        background-size: 100%;
      }
    }
    .group {
      .icon {
        background: url("~@/assets/chat/add-group-icon.png") no-repeat center;
        background-size: 100%;
      }
    }
    .friend:hover,
    .group:hover {
      background-color: #f2f2f2;
    }
  }
</style>
