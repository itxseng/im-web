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
      </div>
      <div class="content">
        <ul>
          <!-- <li v-for="(item,index) in notifyList" :key="index">
          </li>
          <li v-if="notifyListNum>0">
            <el-button @click="openNotify">查看全部</el-button>
          </li> -->
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
    onSave () {
      console.log('666');
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
      max-height: 600px;
      box-sizing: border-box;
      overflow-y: auto;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: space-between;
      align-content: space-between;
      margin-top: 15px;
      margin-bottom: 5px;
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