<template>
  <el-dialog class="group-add"
             :visible.sync="dialogModal"
             width="360px"
             :show-close="false"
             :append-to-body="true"
             :destroy-on-close="true">
    <div class="group-add">
      <div class="title">
        <p>{{ title }}</p>
        <i class="el-icon-delete" @click="deleteNotify"></i>
      </div>
      <div class="content">
        <ul>
          <template v-if="notifyList && notifyList.length > 0">
            <li v-for="(item,index) in notifyList"
                :key="index">
            </li>
          </template>
          <div v-else
               class="tip">暂无通知数据</div>
        </ul>
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
      dialogModal: false,
    }
  },
  methods: {
    open () {
      this.dialogModal = true;
      console.log(this.notifyList);

    },
    // 取消按钮
    onClose () {
      this.searchText = ''
      this.radio = ''
      this.dialogModal = false;
      // this.$emit('close');
    },
    deleteNotify(){
      this.$message.warning('开发中...')
    }
  },
  computed: {
    notifyList () {
      return this.pyqStore.notifyList
    }
  }
}
</script>
<style lang="scss" scoped>
  .group-add {
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
      position: relative;
      p {
        width: 100%;
        height: 35px;
        color: #999;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0px;
      }
      .el-icon-delete {
        position: absolute;
        right: 10px;
        color: #999;
        &:hover {
          color: #658efe;
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
      margin-top: 15px;
      margin-bottom: 5px;
      ul {
        width: 100%;
        min-height: 300px;
        max-height: 600px;
        margin: 0px;
        padding: 0px;
      }
      .tip {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        color: #999;
      }
    }
    .bottom {
      width: 100%;
      display: flex;
      justify-content: flex-end;
    }
    ::v-deep .el-dialog__header {
      padding: 0px !important;
    }
    ::v-deep .el-dialog__body {
      padding: 10px !important;
    }
    ::v-deep .el-dialog {
      border-radius: 10px !important;
    }
  }
</style>