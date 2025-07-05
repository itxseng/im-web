<template>
  <el-dialog class="group-permissions"
             :visible.sync="dialogModal"
             width="360px"
             :show-close="false"
             :append-to-body="true"
             :destroy-on-close="true">
    <div class="group-permissions">
      <div class="title">
        <p>{{ title }}</p>
      </div>
      <div class="head">
        <div class="head-img">
          <img :src="groupMemberInfo.headImage"
               alt="">
        </div>
        <div class="head-text">
          <p class="name">{{ groupMemberInfo.showNickName }}</p>
          <p :class="['time',groupMemberInfo.online ? 'is-online' : '']">{{showTime}}</p>
        </div>
      </div>
      <div class="content">
        <p>这位管理员可以做什么？</p>
        <ul>
          <li>
            <span>修改群组信息</span>
            <el-switch v-model="permissionFrom.canEditGroupInfo"
                       active-color="#99b6ff"
                       inactive-color="#b1b1b1">
            </el-switch>
          </li>
          <li>
            <span>删除消息</span>
            <el-switch v-model="permissionFrom.canDeleteMessage"
                       active-color="#99b6ff"
                       inactive-color="#b1b1b1">
            </el-switch>
          </li>
          <li>
            <span>封禁用户</span>
            <el-switch v-model="permissionFrom.canBanUser"
                       active-color="#99b6ff"
                       inactive-color="#b1b1b1">
            </el-switch>
          </li>
          <li>
            <span>使用链接邀请用户</span>
            <el-switch v-model="permissionFrom.canInviteUser"
                       active-color="#99b6ff"
                       inactive-color="#b1b1b1">
            </el-switch>
          </li>
          <li>
            <span>顶置消息</span>
            <el-switch v-model="permissionFrom.canPinMessage"
                       active-color="#99b6ff"
                       inactive-color="#b1b1b1">
            </el-switch>
          </li>
          <li>
            <span>添加新管理员</span>
            <el-switch v-model="permissionFrom.canAddAdmin"
                       active-color="#99b6ff"
                       inactive-color="#b1b1b1">
            </el-switch>
          </li>
          <p class="bottom-tip"
             v-if="permissionFrom.canAddAdmin">
            该管理员能够添加新管理员，并赋予其最高与该管理员 相当的权限。
          </p>
          <p class="bottom-tip"
             v-else>
            该管理员不能添加新管理员。
          </p>
        </ul>
      </div>
      <div class="bottom">
        <el-button @click="onClose"
                   type="text">取消</el-button>
        <el-button @click="onSave"
                   type="text">保存</el-button>
      </div>
    </div>
  </el-dialog>
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      searchText: '',
      dialogModal: false,
      groupMemberInfo: {},
      permissionFrom: {
        groupId: null,
        userId: null,
        // 编辑权限
        canEditGroupInfo: false,
        // 删除权限
        canDeleteMessage: false,
        // 封禁权限
        canBanUser: false,
        // 链接邀请权限
        canInviteUser: false,
        // 置顶权限
        canPinMessage: false,
        // 新增群管理权限
        canAddAdmin: false
      }
    }
  },
  methods: {
    open (item) {
      this.groupMemberInfo = item;
      this.getPermissions(item)
      this.dialogModal = true;
      console.log('groupMemberInfo', this.groupMemberInfo);
    },
    getPermissions (item) {
      this.permissionFrom.groupId = this.currentGroupInfo.id;
      this.permissionFrom.userId = item.userId;
      if (item.isManager) {
        this.permissionFrom.canEditGroupInfo = item.canEditGroupInfo;
        this.permissionFrom.canDeleteMessage = item.canDeleteMessage;
        this.permissionFrom.canBanUser = item.canBanUser;
        this.permissionFrom.canInviteUser = item.canInviteUser;
        this.permissionFrom.canPinMessage = item.canPinMessage;
        this.permissionFrom.canAddAdmin = item.canAddAdmin;
      }
    },
    // 取消按钮
    onClose () {
      this.dialogModal = false;
      this.$emit('close');
    },
    // 保存按钮
    onSave () {
      this.$http({
        url: '/group/modifyManagerPerm',
        method: 'PUT',
        data: this.permissionFrom
      }).then(() => {
        this.$message.success('保存成功')
        this.$emit('updateGroupData');
        this.dialogModal = false;
      })
    }
  },
  computed: {
    currentGroupMember () {
      return this.groupStore.currentGroupMember.filter(member => !member.quit);
    },
    currentGroupInfo () {
      return this.groupStore.groupInfo;
    },
    showTime () {
      return this.groupMemberInfo.online ? '在线' : this.$date.toTimeText(this.groupMemberInfo.lastOnlineTime, true, true);
    }
  },
}
</script>
<style lang="scss" scoped>
  .group-permissions {
    width: 100%;
    padding-top: 6px;
    .title {
      width: 100%;
      height: 35px;
      padding: 20px 20px 0 20px;
      color: #000000;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
      p {
        width: 100%;
        height: 35px;
        color: #999;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 0px;
      }
    }
    .head {
      width: 100%;
      height: 100px;
      margin-top: 5px;
      padding: 0 20px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 10px solid #ebebeb;
      .head-img {
        width: 60px;
        height: 60px;
        border-radius: 30px;
        overflow: hidden;
        img {
          width: 100%;
          height: 100%;
        }
      }
      .head-text {
        width: calc(100% - 70px);
        height: 60px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        p {
          margin: 0px;
          font-size: 15px;
        }
        .name {
          font-weight: 700;
        }
        .time {
          color: #999;
          margin-top: 5px;
          font-size: 12px;
        }
      }
      .is-online {
        color: #47ad47 !important;
      }
    }
    .content {
      width: 100%;
      min-height: 300px;
      max-height: 500px;
      box-sizing: border-box;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
      align-items: flex-start;
      justify-content: flex-start;
      align-content: space-between;
      margin-top: 15px;
      margin-bottom: 5px;
      p {
        margin: 0;
        color: #3066ec;
        margin-bottom: 13px;
        padding: 0 20px;
        box-sizing: border-box;
      }
      .bottom-tip {
        color: #999999;
        font-size: 12px;
        margin-top: 5px;
      }
      ul {
        width: 100%;
        list-style: none;
        margin: 0;
        padding: 0;
        li {
          width: 100%;
          height: 40px;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #ebebeb;
          box-sizing: border-box;
        }
        li:first-child {
          border-top: 1px solid #ebebeb;
        }
      }
    }
    .bottom {
      width: 100%;
      padding: 20px 20px 10px 20px;
      display: flex;
      justify-content: flex-end;
      box-sizing: border-box;
    }
    ::v-deep .el-dialog__header {
      padding: 0px !important;
    }
    ::v-deep .el-dialog__body {
      padding: 0px !important;
    }
  }
</style>