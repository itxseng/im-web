<template>
  <div class="userInfo">
    <div class="header">
      <div class="header-title">
        用户信息
      </div>
      <span class="header-btn"
            @click="putUserInfo">完成</span>
    </div>
    <div class="content">
      <div class="content-info">
        <div class="content-info-img">
          <file-upload class="avatar-uploader"
                       action="/image/upload"
                       :isPermanent="true"
                       :showLoading="true"
                       :maxSize="maxSize"
                       @success="onUploadSuccess"
                       :fileTypes="['image/jpeg', 'image/png', 'image/jpg', 'image/webp']">
            <img v-if="userInfoForm.headImage"
                 :src="userInfoForm.headImage"
                 class="avatar">
            <i v-else
               class="el-icon-camera-solid avatar-uploader-icon"></i>
          </file-upload>
        </div>
        <div class="content-info-text">
          <div class="content-info-text-name">
            <span>昵称</span>
            <el-input v-model="userInfoForm.nickName"></el-input>
          </div>
          <div class="content-info-text-id">
            <span>ID</span>
            <el-input v-model="userInfoForm.userName"
                      :disabled="true"></el-input>
          </div>
        </div>
      </div>
      <ul class="content-list">
        <div class="content-list-box">
          <li @click="showRight(userInfoForm.phone,'电话号码')">
            <div class="content-list-item">
              <span>电话号码</span>
              <el-input v-model="userInfoForm.phone"
                        placeholder="添加你的电话号码"
                        readonly></el-input>
              <i class="el-icon-arrow-right"></i>
            </div>
          </li>
          <li @click="showRight(userInfoForm.email,'邮箱')">
            <div class="content-list-item">
              <span>邮箱</span>
              <el-input v-model="userInfoForm.email"
                        placeholder="添加你的邮箱"
                        readonly></el-input>
              <i class="el-icon-arrow-right"></i>
            </div>
          </li>
          <li @click="showRight(userInfoForm.signature,'签名')">
            <div class="content-list-item">
              <span>签名</span>
              <el-input v-model="userInfoForm.signature"
                        placeholder="编辑你的签名"
                        readonly></el-input>
              <i class="el-icon-arrow-right"></i>
            </div>
          </li>
        </div>
        <div class="content-list-box">
          <li>
            <div class="content-list-item">
              <span>性别</span>
              <el-select v-model="userInfoForm.sex"
                         placeholder="请选择">
                <el-option v-for="item in sexOptions"
                           :key="item.value"
                           :label="item.label"
                           :value="item.value">
                </el-option>
              </el-select>
            </div>
          </li>
          <li>
            <div class="content-list-item">
              <span>生日</span>
              <el-date-picker v-model="userInfoForm.birthday"
                              prefix-icon="none"
                              type="date"
                              placeholder="选择日期">
              </el-date-picker>
            </div>
          </li>
          <li>
            <div class="content-list-item">
              <span>地区</span>
              <el-select v-model="userInfoForm.country"
                         placeholder="请选择">
                <el-option v-for="item in countryOptions"
                           :key="item.value"
                           :label="item.label"
                           :value="item.value">
                </el-option>
              </el-select>
            </div>
          </li>
        </div>
      </ul>
    </div>
    <el-drawer size="70%"
               :with-header="false"
               :visible.sync="drawer"
               direction="rtl"
               :modal="false"
               :before-close="drawerClose">
      <EditUserInfo :drawerTitle="drawerTitle"
                    @drawerClose="drawerClose"
                    :itemValue="itemValue"
                    :userInfo="userInfo"
                    :destroy-on-close="true"
                    ref="editUserInfo" />
    </el-drawer>
  </div>
</template>
<script>
import EditUserInfo from '@/components/user/EditUserInfo.vue'
import FileUpload from "@/components/common/FileUpload.vue";
import { countryList } from '@/utils/resource/countryList'
export default {
  components: {
    EditUserInfo,
    FileUpload
  },
  data () {
    return {
      userInfoForm: {
        nickName: '',
        id: '',
        phone: '',
        signature: '',
        sex: '0',
        birthday: '',
        country: '',
        headImage: '',
        headImageThumb: '',
        email: ''
      },
      drawer: false,
      drawerTitle: '',
      itemValue: '',
      sexOptions: [
        {
          value: '0',
          label: '男'
        },
        {
          value: '1',
          label: '女'
        },
        {
          value: '2',
          label: '保密'
        },
      ],
      countryOptions: countryList,
      maxSize: 5 * 1024 * 1024,
    }
  },
  methods: {
    // 图片上传成功回调
    onUploadSuccess (data, file) {
      this.userInfoForm.headImage = data.originUrl;
      this.userInfoForm.headImageThumb = data.thumbUrl;
    },
    // 关闭右侧
    drawerClose () {
      this.setForm()
      this.drawer = false
    },
    // 显示右侧
    showRight (value, title) {
      if (title === '电话号码') {
        if (this.userInfoForm.phone) {
          this.$message.error('你已绑定电话号码！')
          return
        }
      }
      if (title === '邮箱') {
        if (this.userInfoForm.phone) {
          this.$message.error('你已绑定邮箱！')
          return
        }
      }
      this.itemValue = value
      this.drawerTitle = title
      this.$nextTick(() => {
        this.$refs.editUserInfo.open(this.userInfo)
      })
      this.drawer = true
    },
    // 修改用户信息
    putUserInfo () {
      this.$http({
        url: "/user/update",
        method: 'put',
        data: this.userInfoForm
      }).then((info) => {
        this.userStore.setUserInfo(info)
        this.$message.success("修改成功")
      })
    },
    setForm () {
      this.userInfoForm.nickName = this.userInfo.nickName
      this.userInfoForm.id = this.userInfo.id
      this.userInfoForm.sex = String(this.userInfo.sex)
      this.userInfoForm.phone = this.userInfo.phone
      this.userInfoForm.signature = this.userInfo.signature
      this.userInfoForm.headImage = this.userInfo.headImage
      this.userInfoForm.headImageThumb = this.userInfo.headImageThumb
      this.userInfoForm.birthday = this.userInfo.birthday
      this.userInfoForm.country = this.userInfo.country
      this.userInfoForm.email = this.userInfo.email
      this.userInfoForm.userName = this.userInfo.userName
    }
  },
  mounted () {
    this.setForm()
  },
  computed: {
    userInfo () {
      console.log('this.userStore.userInfo', this.userStore.userInfo);
      return this.userStore.userInfo
    },
  },
}
</script>
<style lang="scss" scoped>
  .userInfo {
    width: 100%;
    height: 100%;
    padding: 0px;
    .header {
      width: 100%;
      height: 50px;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0 12px;
      font-size: var(--im-font-size-larger);
      border-bottom: var(--im-border);
      font-weight: 700;
      box-sizing: border-box;
      position: relative;
      .header-btn {
        position: absolute;
        right: 20px;
        font-weight: normal;
        color: #3066ec;
        cursor: pointer;
      }
    }
    .content {
      width: calc(100% - 40px);
      height: calc(100% - 90px);
      padding: 20px;
      .content-info {
        width: 100%;
        height: 130px;
        padding: 20px;
        box-sizing: border-box;
        background-color: #fff;
        border-radius: 4px;
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        .content-info-img {
          width: 100px;
          height: 100px;
          background-color: #cccccc66;
          border-radius: 50%;
          overflow: hidden;
          img {
            width: 100%;
            height: 100%;
          }
          .avatar-uploader {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }
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
        .content-info-text {
          width: calc(100% - 120px);
          height: 100px;
          margin-left: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
        }
      }
      .content-list-item,
      .content-info-text-id,
      .content-info-text-name {
        width: 100%;
        display: flex;
        border-bottom: 1px solid #ccccccaa;
        color: #999999;
        span {
          width: 45px;
          height: 100%;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
        }
      }
      .content-list {
        width: 100%;
        height: 100px;
        padding: 0px;
        margin: 0px;
        ::v-deep .el-input__inner {
          text-align: right;
        }
        .content-list-box {
          border-radius: 4px;
          overflow: hidden;
          background-color: #fff;
          margin-bottom: 20px;
        }
        .content-list-item {
          width: 100%;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          .el-icon-arrow-right {
            font-size: 18px;
            color: #999999;
          }
        }
        li {
          width: 100%;
          height: 60px;
          padding: 0 20px;
          box-sizing: border-box;
        }
        .content-list-box:first-child {
          li {
            cursor: pointer;
            &:hover {
              background-color: #e2e9fc;
            }
            ::v-deep .el-input__inner {
              cursor: pointer;
            }
          }
          li:nth-child(1) {
            span {
              width: 80px;
            }
          }
        }
        li:last-child {
          .content-list-item {
            border-bottom: none !important;
          }
        }
      }
    }
  }
  ::v-deep .el-input__inner {
    border: none;
    border-radius: 0px;
    font-size: 18px;
    background-color: #ffffff00 !important;
    color: #000 !important;
  }
  ::v-deep .el-drawer {
    box-shadow: none;
    background: #ffffff;
    background: linear-gradient(270deg, white 0%, #f2f4f9 100%);
    margin-top: 30px;
  }
</style>
