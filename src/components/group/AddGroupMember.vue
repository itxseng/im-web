<template>
  <el-dialog title="添加成员"
             :visible.sync="show"
             width="620px"
             :before-close="close"
             :append-to-body="appendToBody ?  true : false">
    <div class="agm-container">
      <div class="agm-l-box">
        <div class="search">
          <el-input placeholder="搜索好友"
                    v-model="searchText"
                    size="small">
            <i class="el-icon-search el-input__icon"
               slot="suffix"> </i>
          </el-input>
        </div>
        <el-scrollbar style="height:400px;">
          <div v-for="friend in friends"
               :key="friend.id">
            <friend-item v-show="friend.showNickName.includes(searchText)"
                         :showDelete="false"
                         @click.native="onSwitchCheck(friend)"
                         :menu="false"
                         :friend="friend"
                         :active="false">
              <el-checkbox :disabled="friend.disabled"
                           @click.native.stop=""
                           class="agm-friend-checkbox"
                           v-model="friend.isCheck"
                           size="medium"></el-checkbox>
            </friend-item>
          </div>
        </el-scrollbar>
      </div>
      <div class="agm-arrow el-icon-d-arrow-right"></div>
      <div class="agm-r-box">
        <div class="agm-select-tip"> 已勾选{{ checkCount }}位好友</div>
        <el-scrollbar style="height:400px;">
          <div v-for="friend in friends"
               :key="friend.id">
            <friend-item v-if="friend.isCheck && !friend.disabled"
                         :friend="friend"
                         :active="false"
                         @del="onRemoveFriend(friend)"
                         :menu="false">
            </friend-item>
          </div>
        </el-scrollbar>
      </div>
    </div>
    <span slot="footer"
          class="dialog-footer">
      <el-button @click="close()">取 消</el-button>
      <el-button type="primary"
                 @click="onOk()">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import FriendItem from '../friend/FriendItem.vue';

export default {
  name: "addGroupMember",
  components: {
    FriendItem
  },
  data () {
    return {
      show: false,
      searchText: "",
      friends: []
    }
  },
  methods: {
    open () {
      this.show = true;
      this.friends = [];
      this.friendStore.friends.forEach((f) => {
        if (f.deleted) {
          return;
        }
        console.log('members', this.members);

        let friend = JSON.parse(JSON.stringify(f))
        let m = this.members.filter((m) => !m.quit).find((m) => m.userId == f.id);
        if (m) {
          // 好友已经在群里
          friend.disabled = true;
          friend.isCheck = true
        } else {
          friend.disabled = false;
          friend.isCheck = false;
        }
        this.friends.push(friend);
      })
    },
    close () {
      this.show = false;
    },
    onOk () {
      if (this.groupId) {
        let inviteVO = {
          groupId: this.groupId,
          friendIds: []
        }
        this.friends.forEach((f) => {
          if (f.isCheck && !f.disabled) {
            inviteVO.friendIds.push(f.id);
          }
        })
        if (inviteVO.friendIds.length > 0) {
          this.$http({
            url: "/group/invite",
            method: 'post',
            data: inviteVO
          }).then(() => {
            this.$message.success("邀请成功");
            this.$emit("reload");
            this.close()
          })
        }
      } else {
        let arr = []
        this.friends.forEach((f) => {
          if (f.isCheck && !f.disabled) {
            arr.push(f.id);
          }
        })
        let query = {
          ...this.createGroupQuery,
          memberIds: arr
        }
        this.$http({
          url: "/group/create",
          method: 'post',
          data: query
        }).then((group) => {
          this.groupStore.addGroup(group);
          this.$message.success("创建成功");
          this.$emit("reload");
          this.close()
          this.onSendMessage(group);
        })
      }
    },
    onSendMessage (group) {
      let chat = {
        type: 'GROUP',
        targetId: group.id,
        showName: group.showGroupName,
        headImage: group.headImage,
      };
      this.chatStore.openChat(chat);
      this.chatStore.setActiveChat(group.id,'GROUP');
      // 判断是否需要跳转到聊天界面
      if (this.$route.path !== '/home/chat') {
        this.$router.push("/home/chat");
      }
    },
    onRemoveFriend (friend) {
      friend.isCheck = false;
    },
    onSwitchCheck (friend) {
      if (!friend.disabled) {
        friend.isCheck = !friend.isCheck
      }
    }
  },
  props: {
    groupId: {
      type: Number
    },
    members: {
      type: Array
    },
    type: {
      type: String,
      default: 'create' // group or team
    },
    appendToBody: {
      type: Boolean,
      default: false
    },
    createGroupQuery: {
      type: Object,
      default: () => { }
    }
  },
  computed: {
    checkCount () {
      return this.friends.filter((f) => f.isCheck && !f.disabled).length;
    }
  }
}
</script>

<style lang="scss">
  .agm-container {
    display: flex;

    .agm-l-box {
      flex: 1;
      width: 100%;
      overflow: hidden;
      border: var(--im-border);

      .search {
        height: 40px;
        display: flex;
        align-items: center;

        .el-input__inner {
          border: unset;
          border-bottom: var(--im-border);
        }
      }

      .agm-friend-checkbox {
        width: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .agm-arrow {
      display: flex;
      align-items: center;
      font-size: 18px;
      padding: 10px;
      font-weight: 600;
      color: var(--im-color-primary);
    }

    .agm-r-box {
      flex: 1;
      border: var(--im-border);

      .agm-select-tip {
        text-align: left;
        height: 40px;
        line-height: 40px;
        text-indent: 6px;
        color: var(--im-text-color-light);
      }
    }
  }
  .el-scrollbar__wrap {
    width: 100%;
  }
</style>
