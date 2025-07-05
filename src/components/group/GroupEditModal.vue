<template>
  <div class="group-edit">
    <div class="title">
      <p>编辑群组</p>
    </div>
    <div class="content">
      <div class="centent-info">
        <div :class="['centent-info-img',groupFrom.headImage ? '' : 'centent-info-img-bg']">
          <file-upload class="avatar-uploader"
                       action="/image/upload"
                       :isPermanent="true"
                       :showLoading="true"
                       :maxSize="maxSize"
                       @success="onUploadSuccess"
                       :fileTypes="['image/jpeg', 'image/png', 'image/jpg', 'image/webp']">
            <img v-if="groupFrom.headImage"
                 :src="groupFrom.headImage"
                 class="avatar">
            <i class="el-icon-camera-solid"></i>
          </file-upload>
        </div>
        <div class="centent-info-input">
          <span>群组名称</span>
          <el-input v-model="groupFrom.name"
                    placeholder="请输入群组名称"></el-input>
        </div>
      </div>
      <!-- <div class="centent-inform">
        <span>群组简介</span>
        <el-input v-model="groupFrom.notice"
                  placeholder="请输入群公告"></el-input>
      </div> -->
      <div class="centent-inform">
        <span>群组公告</span>
        <el-input type="textarea"
                  v-model="groupFrom.notice"
                  placeholder="请输入群公告"></el-input>
      </div>
      <div class="centent-set">
        <el-radio-group v-model="groupFrom.type">
          <el-radio :label="0">公开群组</el-radio>
          <p>
            任何人可以通过搜索找到并加入群组，并且能看到所有聊天记录
          </p>
          <el-radio :label="1">私人群组</el-radio>
          <p>
            用户只能通过用户邀请或公开的邀请链接加入
          </p>
        </el-radio-group>
        <p>谁可以添加成员</p>
        <el-radio-group v-model="groupFrom.addGroupPerm">
          <el-radio :label="0"
                    style="margin-bottom: 10px;">所有人</el-radio>
          <el-radio :label="1">仅管理员</el-radio>
        </el-radio-group>
        <br />
        <el-checkbox v-model="groupFrom.interimPerm"
                     style="margin-bottom: 7px;">体禁止私聊</el-checkbox>
        <el-checkbox v-model="groupFrom.isMuted">全体禁言</el-checkbox>
        <p>@全体成员</p>
        <el-checkbox v-model="groupFrom.managerCanAtAll">管理员</el-checkbox>
      </div>
    </div>
    <div class="bottom">
      <el-button @click="onClose"
                 type="text">取消</el-button>
      <el-button @click="editGroupInfo"
                 type="text">保存</el-button>
    </div>
  </div>
</template>
<script>
import FileUpload from "@/components/common/FileUpload.vue";
export default {
  components: {
    FileUpload
  },
  props: {
    groupInfo: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    return {
      maxSize: 5 * 1024 * 1024,
      groupFrom: {
        id: null,
        name: '',
        headImage: '',
        headImageThumb: '',
        notice: '',
        type: 0,
        addGroupPerm: 1,
        interimPerm: false,
        isMuted: false,
        managerCanAtAll: false
      }
    }
  },
  methods: {
    // 取消按钮
    onClose () {
      this.$emit('close');
    },
    // 保存按钮
    onSave () {
      this.$emit('save');
    },
    onUploadSuccess (data, file) {
      this.groupFrom.headImage = data.originUrl;
      this.groupFrom.headImageThumb = data.thumbUrl;
    },
    editGroupInfo () {
      this.$http({
        url: `/group/modify`,
        method: 'put',
        data: this.groupFrom
      }).then((info) => {
        this.$message.success('修改成功')
        this.updateInfo(info)
        this.$emit('updateGroupData')
      });
    },
    updateInfo (val) {
      this.groupFrom.id = val.id;
      this.groupFrom.name = val.name;
      this.groupFrom.notice = val.notice;
      this.groupFrom.headImage = val.headImage;
      this.groupFrom.type = val.type;
      this.groupFrom.addGroupPerm = val.addGroupPerm;
      this.groupFrom.interimPerm = val.interimPerm;
      this.groupFrom.isMuted = val.isMuted;
      this.groupFrom.managerCanAtAll = val.managerCanAtAll;
    },
  },
  watch: {
    groupInfo: {
      handler (val) {
        if (val) {
          this.updateInfo(val)
        }
      }, deep: true, immediate: true
    }
  }
}
</script>
<style lang="scss" scoped>
  .group-edit {
    width: 100%;
    padding-top: 6px;
    .title {
      width: 100%;
      height: 35px;
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
      box-sizing: border-box;
      overflow-y: auto;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: space-between;
      align-content: space-between;
      margin-top: 15px;
      .centent-info {
        width: 100%;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .centent-info-img {
          width: 70px;
          height: 70px;
          border-radius: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
          img {
            width: 70px;
            height: 70px;
          }
          .el-icon-camera-solid {
            position: absolute;
            top: 23px;
            left: 0;
            bottom: 0;
            right: 0;
            margin: auto;
            font-size: 25px;
            color: #fff;
          }
        }
        .centent-info-img-bg {
          background-color: #658efe;
        }
        .centent-info-input {
          width: calc(100% - 80px);
          height: 70px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
        }
      }
      .centent-inform {
        width: 100%;
        // height: 70px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        margin-top: 20px;
        span {
          margin-bottom: 5px;
        }
      }
      .centent-set {
        width: 100%;
        // height: 50px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        margin-top: 20px;
      }
    }
    .bottom {
      width: 100%;
      display: flex;
      justify-content: flex-end;
    }
  }
  ::v-deep .el-input__inner {
    border: none !important;
    border-bottom: 1px solid #658efe !important;
    border-radius: 0px;
    padding: 0px;
  }
  ::v-deep .el-radio-group {
    display: flex;
    flex-direction: column;
    p {
      margin: 8px 0px 8px 24px;
      font-size: 12px;
      line-height: 16px;
      color: #999;
    }
  }
  .avatar-uploader {
    --width: 100px;
    &:hover {
      background-color: #0000005f !important;
    }
    ::v-deep .el-upload {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      cursor: pointer;
      .avatar-uploader-box {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-start;

        .avatar-uploader-box-img {
          height: 100%;
          margin-right: 10px;
          position: relative;
          .el-icon-delete {
            display: none;
            position: absolute;
            top: 40px;
            right: 0;
            bottom: 0;
            left: 0;
            margin: auto;
            font-size: 0px;
            color: rgb(208, 24, 24);
            cursor: pointer;
          }

          img {
            width: 100px;
            height: 100%;
            border-radius: 6px;
          }
        }
        .avatar-uploader-box-img:hover {
          .el-icon-delete {
            display: block;
            font-size: 22px;
          }
        }
      }
      .icon-box {
        width: 100px;
        height: 100%;
        border: 1px dashed #d9d9d9 !important;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
    }

    .el-upload:hover {
      border-color: #409eff;
    }

    .avatar-uploader-icon {
      font-size: 24px;
      color: #8c939d;
      width: var(--width);
      height: var(--width);
      line-height: var(--width);
      text-align: center;
    }

    .avatar {
      width: var(--width);
      height: var(--width);
      display: block;
    }
  }
</style>