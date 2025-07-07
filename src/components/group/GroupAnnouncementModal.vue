<template>
  <el-dialog class="group-announcement"
             :visible.sync="dialogModal"
             width="360px"
             :show-close="false"
             :append-to-body="true"
             :destroy-on-close="true">
    <div class="group-announcement"
         v-if="currentGroupMember && currentGroupInfo">
      <div class="title">
        <p>{{ title }}</p>
      </div>
      <div class="user">
        <div class="user-img">
          <img :src="currentGroupMember.headImage"
               alt="">
        </div>
        <div class="user-text">
          <span class="name">{{ currentGroupMember.showNickName }}</span>
          <span class="time">{{ currentGroupInfo.noticePublishTime }}</span>
        </div>
      </div>
      <div class="content">
        <el-input type="textarea"
                  :rows="13"
                  placeholder="请输入群公告内容..."
                  v-model="groupQuery.notice"
                  v-if="isEdit">
        </el-input>
        <p v-else>{{ currentGroupInfo.notice }}</p>
      </div>
      <div class="bottom">
        <el-button @click="onClose"
                   type="text">关闭</el-button>
        <div v-if="mine.id === currentGroupInfo.ownerId || currentGroupMember.isManager">
          <el-button @click="onSave"
                     type="text"
                     v-if="isEdit">保存</el-button>
          <el-button @click="onEdit"
                     type="text"
                     v-else>编辑</el-button>
        </div>
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
      dialogModal: false,
      groupQuery: {
        id: null,
        notice: ''
      },
      isEdit: false
    }
  },
  methods: {
    open () {
      this.dialogModal = true
      this.groupQuery.notice = this.currentGroupInfo.notice
      this.groupQuery.id = this.currentGroupInfo.id
      console.log('groupMemberInfo', this.groupQuery);
    },
    // 取消按钮
    onClose () {
      this.groupQuery.notice = ''
      this.groupQuery.id = null
      this.$emit('groupAnnouncementClose');
      this.dialogModal = false;
    },
    onEdit () {
      this.isEdit = true
    },
    onSave () {
      this.$http({
        url: '/group/modify',
        method: 'PUT',
        data: this.groupQuery
      }).then(() => {
        this.$message.success('修改成功')
        this.$emit('updateInfo')
        this.groupQuery.notice = ''
        this.groupQuery.id = null
        this.dialogModal = false
      })
    }
  },
  computed: {
    mine () {
      return this.userStore.userInfo;
    },
    currentGroupMember () {
      return this.groupStore.currentGroupMember.filter(member => !member.quit && this.currentGroupInfo.noticePublisherId === member.userId)[0];
    },
    currentGroupInfo () {
      return this.groupStore.groupInfo;
    }
  },
}
</script>
<style lang="scss" scoped>
  .group-announcement {
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
    .user {
      width: calc(100% - 30px);
      height: 70px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 15px;
      padding-bottom: 10px;
      box-sizing: border-box;
      border-bottom: 1px solid #ccc;
      .user-img {
        width: 50px;
        height: 50px;
        border-radius: 25px;
        overflow: hidden;
        img {
          width: 100%;
          height: 100%;
        }
      }
      .user-text {
        width: calc(100% - 60px);
        height: 50px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        .time {
          font-size: 12px;
          color: #999;
          margin-top: 5px;
        }
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
      margin-top: 10px;
      margin-bottom: 5px;
      padding: 0 20px;
      box-sizing: border-box;
      p {
        margin: 0;
        padding: 0;
        width: 100%;
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