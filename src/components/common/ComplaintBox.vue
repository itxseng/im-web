<template>
  <div class="complaint">
    <div class="title">
      <i class="el-icon-arrow-left"
         style="cursor: pointer;"
         @click="returnFriendInfo"></i>
      <p>投诉</p>
    </div>
    <div class="content">
      <el-form ref="form"
               :rules="rules"
               :model="complaintForm">
        <el-form-item label="投诉原因:"
                      prop="title">
          <el-input type="textarea"
                    :autosize="{ minRows: 2, maxRows: 2}"
                    maxlength="50"
                    show-word-limit
                    v-model="complaintForm.title"></el-input>
        </el-form-item>
        <el-form-item label="投诉内容:"
                      prop="content">
          <el-input type="textarea"
                    :autosize="{ minRows: 3, maxRows: 6}"
                    maxlength="200"
                    show-word-limit
                    v-model="complaintForm.content"></el-input>
        </el-form-item>
        <el-form-item label="文件上传:">
          <file-upload class="avatar-uploader"
                       action="/image/upload"
                       :isPermanent="true"
                       :maxSize="maxSize"
                       @success="onUploadSuccess"
                       :fileTypes="['image/jpeg', 'image/png', 'image/jpg', 'image/webp']">
            <div class="avatar-uploader-box"
                 v-if="complaintForm.fileUrlList && complaintForm.fileUrlList.length > 0">
              <div class="avatar-uploader-box-img"
                   v-for="(img, index) in complaintForm.fileUrlList"
                   :key="index">
                <img :src="img"
                     class="avatar"
                     @click.stop>
                <i class="el-icon-delete"
                   @click.stop="removeImg(index)"></i>
              </div>
            </div>
            <div class="icon-box"
                 v-if="complaintForm.fileUrlList && complaintForm.fileUrlList.length <=2">
              <i class="el-icon-plus avatar-uploader-icon"></i>
            </div>
          </file-upload>
        </el-form-item>
        <el-form-item>
          <el-button type="primary"
                     @click="onSubmit">提交</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import FileUpload from "./FileUpload.vue";
export default {
  components: { FileUpload },
  data () {
    return {
      complaintForm: {
        title: '',
        content: '',
        fileUrlList: []
      },
      rules: {
        title: [
          { required: true, message: '请输入投诉原因', trigger: 'blur' },
          { max: 50, message: '最多输入50个字符', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入投诉内容', trigger: 'blur' },
          { max: 200, message: '最多输入200个字符', trigger: 'blur' }
        ]
      },
      maxSize: 5 * 1024 * 1024,
    }
  },
  methods: {
    onSubmit () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$http({
            url: `/complaint/add`,
            method: 'post',
            data: this.complaintForm
          }).then(() => {
            this.$message({
              type: 'success',
              message: '投诉成功'
            });
            this.returnFriendInfo()
          })
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    returnFriendInfo () {
      this.complaintForm = {
        title: '',
        content: '',
        fileUrlList: []
      };
      this.$emit('returnFriendInfo')
    },
    onUploadSuccess (data, file) {
      if (this.complaintForm.fileUrlList.length > 2) {
        this.$message.error('最多只能上传3张图片');
        return;
      }
      this.complaintForm.fileUrlList.push(data.originUrl);
    },
    removeImg (index) {
      this.complaintForm.fileUrlList.splice(index, 1);
    }
  }
}
</script>
<style lang="scss" scoped>
  .complaint {
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
      height: 450px;
      padding: 0 50px;
      box-sizing: border-box;
      overflow-y: auto;
    }
    .avatar-uploader {
      --width: 100px;
      ::v-deep .el-upload {
        width: 100%;
        height: 100px;
        display: flex;
        align-items: center;
        cursor: auto !important;
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
  }
</style>
