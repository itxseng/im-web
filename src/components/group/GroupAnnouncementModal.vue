<template>
  <el-dialog class="group-announcement"
             :visible.sync="dialogModal"
             width="360px"
             :show-close="false"
             :append-to-body="true"
             :destroy-on-close="true">
    <div class="group-announcement">
      <div class="title">
        <p>{{ title }}</p>
      </div>
      <div class="content">
        {{ groupAnnouncement }}
      </div>
      <div class="bottom">
        <el-button @click="onClose"
                   type="text">关闭</el-button>
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
      dialogModal: false
    }
  },
  methods: {
    open () {
      this.dialogModal = true
      // console.log('groupMemberInfo', item);
    },
    // 取消按钮
    onClose () {
      this.dialogModal = false;
      this.$emit('groupAnnouncementClose');
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
    },
    groupAnnouncement () {
      return this.groupStore.groupInfo.notice;
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
      padding: 0 20px;
      box-sizing: border-box;
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