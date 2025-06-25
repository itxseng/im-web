<template>
  <div class="edit-user-info">
    <div class="header">
      <div class="header-back"
           @click="drawerClose()">
        <i class="el-icon-arrow-left"></i>
        <span>返回</span>
      </div>
      <div class="header-title">
        {{drawerTitle}}
      </div>
      <span class="header-btn"
            @click="submit">完成</span>
    </div>
    <div class="edit-user-info-content">
      <div class="edit-user-info-content-box">
        <div class="edit-user-info-content-box-item">
          <span>{{drawerTitle}}</span>
          <el-input v-if="drawerTitle === '电话号码'"
                    v-model="phone"
                    placeholder="请输入电话号码"></el-input>
          <el-input v-else-if="drawerTitle === '邮箱'"
                    v-model="email"
                    placeholder="请输入邮箱"
                    :minlength="11"></el-input>
          <el-input v-else
                    v-model="text"
                    placeholder="请输入签名"
                    :minlength="11"></el-input>
        </div>
        <div class="edit-user-info-content-box-item"
             v-if="drawerTitle === '电话号码'">
          <span>验证码</span>
          <div class="edit-user-info-content-box-item-code">
            <el-input v-model="code"
                      placeholder="请输入验证码"></el-input>
            <span class="btn-time"
                  v-if="phoneLockTime > 0">{{ `${phoneLockTime}秒后重新获取` }}</span>
            <span class="btn"
                  @click="onLoadSmsCaptcha"
                  v-else>发送验证码</span>
          </div>
        </div>
        <div class="edit-user-info-content-box-item"
             v-if="drawerTitle === '邮箱'">
          <span>验证码</span>
          <div class="edit-user-info-content-box-item-code">
            <el-input v-model="code"
                      placeholder="请输入验证码"></el-input>
            <span class="btn-time"
                  v-if="emailLockTime > 0">{{ `${emailLockTime}秒后重新获取` }}</span>
            <span class="btn"
                  @click="onLoadMailCaptcha"
                  v-else>发送验证码</span>
          </div>
        </div>
      </div>
    </div>
    <captcha-image ref="captchaRef"></captcha-image>
  </div>
</template>
<script>
import CaptchaImage from '@/components/common/CaptchaImage.vue';
export default {
  components: {
    CaptchaImage
  },
  props: {
    drawerTitle: {
      type: String,
      default: ''
    },
    itemValue: {
      type: String,
      default: ''
    },
    userInfo: {
      type: Object,
      default: () => {
        return {}
      }
    },
  },
  data () {
    return {
      phone: null,
      text: '',
      email: '',
      code: null,
      emailLockTimer: null,
      phoneLockTimer: null,
      emailLockTime: 0,
      phoneLockTime: 0
    }
  },
  methods: {
    drawerClose () {
      this.phone = null
      this.text = ''
      this.email = ''
      this.code = null
      this.$emit('drawerClose')
    },
    async submit () {
      try {
        let payload = {};
        let updateField = '';
        let apiUrl = '';
        let successMessage = '';

        switch (this.drawerTitle) {
          case '电话号码':
            payload = { phone: this.phone, code: this.code };
            apiUrl = '/user/bindPhone';
            updateField = 'phone';
            successMessage = '添加成功';
            break;
          case '邮箱':
            payload = { email: this.email, code: this.code };  // 修正字段名从phone改为email
            apiUrl = '/user/bindEmail';
            updateField = 'email';
            successMessage = '添加成功';
            break;
          case '签名':
            payload = { signature: this.text, id: this.userInfo.id };
            apiUrl = '/user/update';
            successMessage = '修改成功';
            break;
          default:
            throw new Error('未知的操作类型');
        }

        const response = await this.$http({
          url: apiUrl,
          method: 'put',
          data: payload
        });

        // 更新用户信息
        const userInfo = this.userStore.userInfo;
        if (updateField) {
          userInfo[updateField] = payload[updateField];
        } else if (response) {
          Object.assign(userInfo, response);
        }
        this.userStore.setUserInfo(userInfo);
        console.log('this.userStore.userInfo',this.userStore.userInfo);
        
        this.$message.success(successMessage);
        this.drawerClose();
      } catch (error) {
        console.error('提交失败:', error);
        this.$message.error(`操作失败: ${error.message}`);
      }
    },
    onLoadSmsCaptcha () {
      if (!this.validatePhoneNumber(this.phone)) {
        this.$message.error("请输入正确的手机号码")
        return
      }
      // 发短信前先验证验证码，防止盗刷
      this.$refs.captchaRef.open((id, code) => {
        // 60s内不允许再次发送
        this.phoneLockTime = 60;
        this.phoneLockTimer && clearInterval(this.phoneLockTimer);
        this.phoneLockTimer = setInterval(() => {
          this.phoneLockTime -= 1;
          if (this.phoneLockTime <= 0) {
            this.phoneLockTimer && clearInterval(this.phoneLockTimer);
          }
        }, 1000)
        // 发送短信
        let data = {
          phone: this.phone,
          id: id,
          code: code
        }
        this.$http({
          url: "/captcha/sms/code",
          method: 'post',
          data: data
        }).then(() => {
          this.$message.success("验证码已发送至您的手机，请注意查收")
        })
      });
    },
    onLoadMailCaptcha () {
      if (!this.validateEmail(this.email)) {
        this.$message.error("请输入正确的邮箱")
        return
      }
      // 60s内不允许再次发送
      this.emailLockTime = 60;
      this.emailLockTimer && clearInterval(this.emailLockTimer);
      this.emailLockTimer = setInterval(() => {
        this.emailLockTime -= 1;
        if (this.emailLockTime <= 0) {
          this.emailLockTimer && clearInterval(this.emailLockTimer);
        }
      }, 1000)
      // 发送短信
      let data = {
        email: this.email,
      }
      this.$http({
        url: "/captcha/mail/code",
        method: 'post',
        data: data
      }).then(() => {
        this.$message.success("验证码已发送至您的邮箱，请注意查收")
      })
    },
    validatePhoneNumber (str) {
      const reg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/
      return reg.test(str)
    },
    validateEmail (str) {
      const reg = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
      return reg.test(str)
    },
    open (userInfo) {
      this.text = userInfo.signature
      this.email = userInfo.email
      this.phone = userInfo.phone
    }
  }
}
</script>
<style lang="scss" scoped>
  .edit-user-info {
    width: 100%;
    height: 100%;
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
      .header-back {
        position: absolute;
        left: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: normal;
        color: #3066ec;
        cursor: pointer;
        .el-icon-arrow-left {
          font-size: 20px;
        }
      }
      .header-btn {
        position: absolute;
        right: 20px;
        font-weight: normal;
        color: #3066ec;
        cursor: pointer;
      }
    }
    .edit-user-info-content {
      width: 100%;
      padding: 20px;
      box-sizing: border-box;
      border-radius: 4px;
      overflow: hidden;
      display: flex;
      justify-content: center;
      .edit-user-info-content-box {
        width: 70%;
        background-color: #fff;
        padding: 20px 30px;
        box-sizing: border-box;
        border-radius: 4px;
        .edit-user-info-content-box-item {
          width: 100%;
          height: 80px;
          display: flex;
          align-items: flex-start;
          border-bottom: 1px solid #ccccccaa;
          transition: 0.3s;
          color: #999999;
          flex-direction: column;
          justify-content: space-between;
          &:active {
            border-bottom: 1px solid #3066ec;
          }
          &:focus {
            border-bottom: 1px solid #3066ec;
          }
          &:hover {
            transition: 0.3s;
            border-bottom: 1px solid #3066ec;
          }
          .edit-user-info-content-box-item-code {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            .el-input {
              width: calc(100% - 80px);
            }
          }
          ::v-deep .el-input__inner {
            padding: 0px;
          }
          span {
            width: 80px;
            height: 100%;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: flex-start;
          }
          .btn {
            width: 95px;
            font-size: 15px;
            color: #3066ec;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            cursor: pointer;
            &:hover {
              color: #3065ecb6;
            }
          }
          .btn-time {
            width: 116px;
            font-size: 15px;
            color: #ccc;
            pointer-events: none !important;
            display: flex;
            align-items: center;
            justify-content: flex-end;
          }
        }
      }
    }
  }
</style>