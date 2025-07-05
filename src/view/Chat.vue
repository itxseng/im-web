<template>
  <el-container class="chat-page">
    <el-aside width="350px"
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
                      :width="80"
                      trigger="hover">
            <div class="chat-list-header-btn-list">
              <div class="friend"
                   @click="showAddFriend = true">
                <span class="icon"></span>
                <span>添加联系人</span>
              </div>
              <!-- <div class="group"
                   @click="addGroup">
                <span class="icon"></span>
                <span>添加群组</span>
              </div> -->
              <div class="group"
                   @click="onCreateGroup">
                <span class="icon"></span>
                <span>新建群组</span>
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
                     @xiaoxitongzhi="closeNotify(chat)"
                     @qingchu="clearChat(chat)"
                     @tousu="complaint(chat)"
                     :active="chat === chatStore.activeChat"></chat-item>
        </div>
      </el-scrollbar>
      <NavBar v-if="!loading" />
    </el-aside>
    <el-container class="chat-box"
                  v-loading="chatLoading">
      <div class="img-box"
           v-if="!activeChat">
        <img src="@/assets/bg-logo.png"
             alt="">
      </div>
      <chat-box ref="ChatBoxRef"
                v-if="activeChat && activeChat.type != 'SYSTEM'"
                :chat="activeChat"
                :itemIndex="isShow"
                :showUserInfo="showUserInfo"
                :showComplaint="showComplaint"
                :editRemarkModal="editRemarkModal"
                :updateNotifyExpireTs="updateNotifyExpireTs"
                @updateGroupInfo="updateGroupInfo"
                @updateGroupMembers="updateGroupMembers"
                @updateInfo="updateInfo"
                @delete="onDelItem(activeChat)"
                @top="onTop(activeChat)"
                @info="onShowInfo(activeChat)"
                @unpinfromtop="unpinFromTop(activeChat)"
                @biaoweiweidu="setUnread"
                @heimingdan="blacklist"
                @chakangerenxinxi="showFriendInfo(activeChat)"
                @xiaoxitongzhi="closeNotify(activeChat)"
                @qingchu="clearChat(activeChat)"
                @tousu="complaint(activeChat)"
                @shanchulianxiren="delLinkman(activeChat)"
                @bianjilianxiren="editLinkman(activeChat)"
                @messageinform="closeNotify(activeChat)"
                @managegroup="manageGroup"
                @addmember="addMember"
                @isunread="setUnread(activeChat)"
                @deletegroup="deleteGroup"
                @clearrecord="clearChat(activeChat)"></chat-box>
      <chat-system-box v-if="activeChat && activeChat.type == 'SYSTEM'"
                       :chat="activeChat"></chat-system-box>
      <add-friend :dialogVisible="showAddFriend"
                  @close="onCloseAddFriend"></add-friend>
      <el-dialog :visible.sync="dialogModal"
                 :width="dialogModalWidth"
                 :destroy-on-close="true">
        <CreateGroup v-if="dialogType == 'createGroup' && dialogModal"
                     @reload="dialogModalClose"
                     @close="dialogModalClose" />
        <GroupManagementModal v-if="dialogType == 'groupManagement' && dialogModal"
                              @close="dialogModalClose"
                              @updateGroupData="updateGroupData"
                              :groupInfo="groupInfo"
                              :groupMembers="groupMembers" />
      </el-dialog>
      <AddGroupModal  ref="addGroup" />
      <AddGroupMember :groupId="groupInfo.id"
                      ref="addGroupMember"
                      :members="groupMembers"
                      :appendToBody="true"
                      @reload="updateGroupData" />
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
import AddGroupModal from "@/components/group/AddGroupModal.vue";
import GroupManagementModal from "@/components/group/GroupManagementModal.vue";
import AddGroupMember from "../components/group/AddGroupMember.vue";
export default {
  name: "chat",
  components: {
    ChatItem,
    ChatBox,
    ChatSystemBox,
    NavBar,
    AddFriend,
    CreateGroup,
    GroupManagementModal,
    AddGroupMember,
    AddGroupModal
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
      removeLoading: null,
      showUserInfo: false,
      showComplaint: false,
      editRemarkModal: false,
      updateNotifyExpireTs: 0,
      dialogModalWidth: '450px',
      chat: {},
      groupInfo: {}
    }
  },
  methods: {
    updateInfo (type) {
      this.showUserInfo = type
      this.showComplaint = type
      this.editRemarkModal = type
    },
    dialogModalClose () {
      this.dialogType = ''
      this.dialogModal = false;
    },
    onCreateGroup () {
      this.dialogModalWidth = '450px'
      this.dialogModal = true;
      this.dialogType = 'createGroup';
    },
    addGroup () {
      this.$refs.addGroup.open()
    },
    onCloseAddFriend () {
      this.showAddFriend = false;
    },
    onActiveItem (item, index) {
      this.isShow = index
      this.chatStore.setActiveChat(item.targetId, item.type);
    },
    onDelItem (chat) {
      const isPrivate = chat.type === 'PRIVATE';
      if (isPrivate) {
        const idx = this.chatStore.findChatIdx(chat)
        this.chatStore.removeChat(idx);
      } else {
        this.chatStore.removeGroupChat(chat.targetId);
      }
    },
    clearChat (chat) {
      const idx = this.chatStore.findChatIdx(chat)
      this.chatStore.removeRecord(idx);
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
    // 关闭消息通知
    closeNotify (chat) {
      const isPrivate = chat.type === 'PRIVATE';
      const url = isPrivate ? '/friend/notify/expire' : '/group/notify/expire';
      const method = isPrivate ? 'post' : 'put';
      const key = isPrivate ? 'friendId' : 'groupId';

      const notifyExpireTs = chat.notifyExpireTs ? 0 : 876000 * 1000 * 60 * 60; // 100年（大致）
      const data = {
        [key]: chat.targetId,
        notifyExpireTs
      };
      this.$http({ url, method, data }).then(() => {
        this.chatStore.addNotify(chat.targetId, notifyExpireTs);
        this.updateNotifyExpireTs = notifyExpireTs;
        console.log(this.updateNotifyExpireTs);

        this.$message.success("设置成功");
      });
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
    // 查看用户信息
    showFriendInfo (item) {
      this.chatStore.chats.forEach((chat, index) => {
        if (item.targetId == chat.targetId) {
          this.isShow = index
        }
      })
      this.chatStore.setActiveChat(item.targetId, item.type);
      this.showUserInfo = true
    },
    // 设置未读表示
    setUnread (item) {
      this.chatStore.setUnreadCount(item.targetId);
    },
    // 投诉
    complaint (item) {
      console.log(item);
      this.chatStore.chats.forEach((chat, index) => {
        if (item.targetId == chat.targetId) {
          this.isShow = index
        }
      })
      this.chatStore.setActiveChat(item.targetId, item.type);
      this.showComplaint = true
    },
    // 删除联系人
    delLinkman (item) {
      this.$confirm(`确认删除'${item.showName}',并清空聊天记录吗?`, '确认解除?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http({
          url: `/friend/delete/${item.targetId}`,
          method: 'delete'
        }).then(() => {
          this.onCloseModal()
          this.$message.success("删除好友成功");
          this.chatStore.removeChat(this.itemIndex);
          this.friendStore.removeFriend(item.targetId);
          this.chatStore.removePrivateChat(item.targetId);
        })
      })
    },
    editLinkman (item) {
      this.chatStore.chats.forEach((chat, index) => {
        if (item.targetId == chat.targetId) {
          this.isShow = index
        }
      })
      this.chatStore.setActiveChat(item.targetId, item.type);
      this.editRemarkModal = true
    },
    // Group set 
    manageGroup (info, member) {
      this.groupInfo = info
      this.groupMembers = member
      this.dialogModalWidth = '350px'
      this.dialogModal = true;
      this.dialogType = 'groupManagement';
    },
    // 更新群数据
    updateGroupData () {
      this.dialogType = ''
      this.dialogModal = false
      this.$refs.ChatBoxRef.loadGroup(this.groupInfo.id)
    },
    updateGroupInfo (info) {
      this.groupInfo = info
      this.groupStore.updateGroup(info)
    },
    updateGroupMembers (member) {
      this.groupMembers = member
    },
    // 新增成员
    addMember (info, member) {
      this.groupInfo = info
      this.groupMembers = member
      this.$refs.addGroupMember.open();
    },
    // 删除并退出或解散群组
    deleteGroup (info, member) {
      this.groupInfo = info
      this.groupMembers = member
      const isOwner = info.ownerId == this.mine.id
      if (isOwner) {
        this.$http({
          url: `/group/delete/${info.id}`,
          method: 'delete'
        }).then(() => {
          this.updateGroupData()
          this.$message.success(`群聊'${info.name}'已解散`);
          this.groupStore.removeGroup(info.id);
          this.groupInfo = {}
          this.groupMembers = []
        })
      } else {
        this.$http({
          url: `/group/quit/${info.id}`,
          method: 'delete'
        }).then(() => {
          this.chatStore.removeGroupChat(info.id);
          this.groupStore.removeGroup(info.id);
        });
      }
    }
  },
  computed: {
    mine () {
      return this.userStore.userInfo;
    },
    chatLoading () {
      return this.chatStore.chatLoading;
    },
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
        ::v-deep .el-popover {
          width: 80px !important;
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
      width: 70%;
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
