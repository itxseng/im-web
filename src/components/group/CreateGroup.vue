<template>
  <div class="create-group">
    <div class="title">
      <p>新建群组</p>
    </div>
    <div class="content">
      <div class="left">
        <file-upload class="avatar-uploader"
                     action="/image/upload"
                     :isPermanent="true"
                     :showLoading="true"
                     :maxSize="maxSize"
                     @success="onUploadSuccess"
                     :fileTypes="['image/jpeg', 'image/png', 'image/jpg', 'image/webp']">
          <img v-if="createGroupQuery.headImage"
               :src="createGroupQuery.headImage"
               class="avatar">
          <i v-else
             class="el-icon-camera-solid avatar-uploader-icon"></i>
        </file-upload>
      </div>
      <div class="right">
        <el-input v-model="createGroupQuery.name"
                  placeholder="请输入群组名称"></el-input>
      </div>
      <div class="bottom">
        <el-button type="text"
                   @click="onClose()">取消</el-button>
        <el-button type="text"
                   @click="onSaveGroup()">下一步</el-button>
      </div>
    </div>
    <AddGroupMember ref="addGroupMember"
                    :members="[]"
                    :createGroupQuery="createGroupQuery"
                    :appendToBody="true"
                    @reload="reload" />
  </div>
</template>
<script>
import AddGroupMember from '@/components/group/AddGroupMember.vue';
import FileUpload from "@/components/common/FileUpload.vue";
export default {
  components: {
    FileUpload,
    AddGroupMember
  },
  data () {
    return {
      maxSize: 5 * 1024 * 1024,
      createGroupQuery: {
        name: '',
        headImage: '',
        headImageThumb: ''
      }
    }
  },
  methods: {
    onUploadSuccess (data, file) {
      this.createGroupQuery.headImage = data.originUrl;
      this.createGroupQuery.headImageThumb = data.thumbUrl;
    },
    onSaveGroup () {
      if (!this.createGroupQuery.name || this.createGroupQuery.name.trim() === '') {
        this.$message.error('群组名称不能为空');
        return;
      }
      // 调用添加群组的逻辑
      this.$refs.addGroupMember.open();
    },
    onClose () {
      this.createGroupQuery = {
        name: '',
        headImage: '',
        headImageThumb: ''
      };
      this.$emit('close');
    },
    reload () {
      this.onClose();
      this.$emit('reload');
    }
  }
}
</script>
<style lang="scss" scoped>
  .create-group {
    width: 100%;
    padding-top: 6px;
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
    .content {
      width: 100%;
      height: 160px;
      box-sizing: border-box;
      padding: 0px 30px;
      overflow-y: auto;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: space-between;
      align-content: space-between;
      .left {
        width: 100px;
        height: 100px;
        background-color: #e2e9fc;
        border-radius: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        .el-icon-camera-solid {
          font-size: 50px;
          color: #fff;
        }
        .avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
        }
      }
      .right {
        width: calc(100% - 120px);
        height: 100px;
        display: flex;
        align-items: center;
      }
      .bottom {
        width: 100%;
        height: 50px;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        box-sizing: border-box;
        .el-button {
          margin-left: 20px;
        }
      }
    }
  }
  ::v-deep .el-input__inner {
    border: none !important;
    border-bottom: 3px solid #e2e9fc !important;
  }
</style>
