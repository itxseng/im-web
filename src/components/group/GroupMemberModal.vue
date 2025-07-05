<template>
  <div class="group-member">
    <div class="title">
      <i class="el-icon-arrow-left"
         style="cursor: pointer;"
         @click="returnInfo"></i>
      <p>群成员</p>
    </div>
    <ul>
      <template v-for="(item,index) in groupMembers">
        <li :key="index"
            v-if="item.quit === false"
            @click="showMemberInfo(item)">
          <div class="left">
            <div class="left-img">
              <img :src="item.headImage"
                   alt="">
            </div>
            <div class="left-text">
              <p class="text">{{ item.showNickName }}</p>
              <span :class="[item.online ? 'isOnline' : '']">{{ showTime(item) }}</span>
            </div>
          </div>
          <span class="right">
            <i class="el-icon-user"
               title="管理员"
               v-if="managerPermission(item)"></i>
            <i class="el-icon-delete"
               v-if="filterPermission(item)"
               @click.stop="onRemoveMember(item)"></i>
            <span :class="[item.userId === groupInfo.ownerId ? 'icon group-owner-icon' : '']"
                  title="群主"></span>
          </span>
        </li>
      </template>
    </ul>
  </div>
</template>
<script>
export default {
  props: {
    chat: {
      type: Object,
      default: () => { }
    },
    groupInfo: {
      type: Object,
      default: () => { }
    },
    groupMembers: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {

    }
  },
  methods: {
    // 移除群成员
    onRemoveMember (item) {
      let data = {
        groupId: this.groupInfo.id,
        userIds: [item.userId]
      }
      this.$http({
        url: "/group/members/remove",
        method: 'delete',
        data: data
      }).then(() => {
        this.updateMembers();
        this.$message.success(`您移除了${data.userIds.length}位成员`);
      })
    },
    updateMembers () {
      this.$emit('updateMembers')
    },
    returnInfo () {
      this.$emit('returnInfo')
    },
    showMemberInfo (item) {
      console.log(item);
      this.$emit('showMemberInfo', item,'群成员')
    },
    filterPermission (item) {
      // 群主
      if (this.isOwner) {
        if (item.userId !== this.groupInfo.ownerId) {
          return true
        }
      }
      // 群管理
      if (this.isManager) {
        if (item.userId !== this.groupInfo.ownerId && !this.managerIds.includes(item.userId)) {
          return true
        }
      }
      // 群成员
      return false
    },
    // 显示管理员icon
    managerPermission (item) {
      let m = this.groupMembers.find((m) => m.userId == item.userId);
      return m && m.isManager;
    },
    showTime (item) {
      return item.online ? '在线' : this.$date.toTimeText(item.lastOnlineTime, true, true);
    },
  },
  computed: {
    managerIds () {
      return this.groupMembers.filter(m => m.isManager).map(m => m.userId)
    },
    mine () {
      return this.userStore.userInfo;
    },
    isOwner () {
      return this.groupInfo.ownerId == this.mine.id;
    },
    isManager () {
      let userId = this.mine.id;
      let m = this.groupMembers.find((m) => m.userId == userId);
      return m && m.isManager;
    },
  }
}
</script>
<style lang="scss" scoped>
  .group-member {
    width: 100%;
    height: 100%;
    .title {
      width: 100%;
      padding: 0 20px;
      height: 35px;
      color: #000000;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
      p {
        flex: 1;
        text-align: center;
      }
    }
    ul {
      width: 100%;
      margin: 0px;
      padding: 0px;
      li {
        width: calc(100% - 40px);
        height: 50px;
        padding: 0 20px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        cursor: pointer;
        .left {
          width: calc(100% - 28px);
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          .left-img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            overflow: hidden;
            margin-right: 10px;
            img {
              width: 100%;
              height: 100%;
            }
          }
          .left-text {
            width: calc(100% - 50px);
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            .text {
              width: 100%;
              margin: 0 !important;
              font-size: 14px;
              text-align: left;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            span {
              font-size: 12px;
              color: #999;
            }
          }
        }
        .right {
          width: 50px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          .group-owner-icon {
            width: 16px;
            height: 16px;
            margin-right: 0px;
            background: url("~@/assets/icon/group/group-owner-icon.png") no-repeat
              center;
            background-size: 100%;
          }
          .el-icon-delete:hover {
            color: red;
          }
          .el-icon-user {
            margin-right: 5px;
          }
        }
        &:hover {
          background-color: #ededed;
        }
      }
    }
  }
  .isOnline {
    color: #47ad47 !important;
  }
</style>