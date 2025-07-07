<template>
  <el-dialog class="group-member-astrict"
             :visible.sync="dialogModal"
             width="360px"
             :show-close="false"
             :append-to-body="true"
             :destroy-on-close="true">
    <div class="group-member-astrict">
      <div class="title">
        <p>{{ title }}</p>
      </div>
      <div class="head">
        <div class="head-img">
          <img :src="memberInfo.headImage"
               alt="">
        </div>
        <div class="head-text">
          <p class="name">{{ memberInfo.showNickName }}</p>
          <p :class="['time',memberInfo.online ? 'is-online' : '']">{{showTime}}</p>
        </div>
      </div>
      <div class="content">
        <ul>
          <li>
            <span>禁言</span>
            <el-switch :value="message"
                       active-color="#99B6FF"
                       inactive-color="#B1B1B1">
            </el-switch>
          </li>
          <li>
            <span>发送视频</span>
            <el-switch :value="message"
                       active-color="#99B6FF"
                       inactive-color="#B1B1B1">
            </el-switch>
          </li>
          <li>
            <span>发送图片</span>
            <el-switch :value="message"
                       active-color="#99B6FF"
                       inactive-color="#B1B1B1">
            </el-switch>
          </li>
          <li>
            <span>发送文件</span>
            <el-switch :value="message"
                       active-color="#99B6FF"
                       inactive-color="#B1B1B1">
            </el-switch>
          </li>
        </ul>
      </div>
      <div class="astrict-time">
        <div class="astrict-time-title">
          <span>限制持续时间</span>
        </div>
        <el-radio-group v-model="radio">
          <el-radio :label="1">永久</el-radio>
          <el-radio :label="2">持续1天</el-radio>
          <el-radio :label="3">持续1周</el-radio>
          <el-radio :label="4">持续1月</el-radio>
        </el-radio-group>
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
      dialogModal: false,
      message: false,
      memberInfo: {},
      radio: 1
    }
  },
  methods: {
    open (value) {
      console.log(value);
      this.memberInfo = value;
      this.dialogModal = true;
    },
    // 取消按钮
    onClose () {
      this.dialogModal = false;
      this.$emit('groupMemberAstrictClose');
    },
    onSave () {
      // let data = {
      //   groupId: this.currentGroupInfo.id,
      //   userId: this.radio
      // }
      // this.$http({
      //   url: '/group/transfer',
      //   method: 'PUT',
      //   data
      // }).then(() => {
      //   this.$message.success('转让成功')
      //   this.updateGroupData()
      // })
    },
    updateGroupData () {
      this.dialogModal = false;
      this.$emit('updateGroupData');
    },
  },
  computed: {
    showTime () {
      return this.memberInfo.online ? '在线' : this.$date.toTimeText(this.memberInfo.lastOnlineTime, true, true);
    }
  }
}
</script>
<style lang="scss" scoped>
  .group-member-astrict {
    width: 100%;
    padding-top: 6px;
    .title {
      width: 100%;
      height: 35px;
      padding: 0 10px;
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
      padding: 0 10px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #ebebeb;

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
    }
    .content {
      width: 100%;
      box-sizing: border-box;
      overflow-y: auto;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: space-between;
      align-content: space-between;
      margin-bottom: 5px;
      border-bottom: 0px;
      ul {
        width: 100%;
        overflow-y: auto;
        padding: 0px;
        margin: 0px;
        li {
          width: 100%;
          height: 50px;
          padding: 0 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-sizing: border-box;
          position: relative;
          border-bottom: 1px solid #ededed;
          &:hover {
            background-color: #ededed;
          }
        }
      }
    }
    .astrict-time {
      width: 100%;
    }
    .astrict-time-title {
      width: 100%;
      padding: 0 10px;
      height: 30px;
      display: flex;
      align-items: center;
      box-sizing: border-box;
      color: #999;
      // border-bottom: 1px solid #ededed;
      color: #096bff;
    }
    .bottom {
      width: 100%;
      display: flex;
      justify-content: flex-end;
    }
    .is-online {
      color: #47ad47 !important;
    }
    ::v-deep .el-dialog__header {
      padding: 0px !important;
    }
    ::v-deep .el-dialog__body {
      padding: 10px !important;
    }
    ::v-deep .el-radio-group {
      width: 100%;
      margin-left: 10px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    ::v-deep .el-radio {
      width: 100%;
      height: 30px !important;
      margin-right: 0px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      box-sizing: border-box;
    }
  }
</style>