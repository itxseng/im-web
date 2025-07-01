<template>
  <div class="ForgetThePwd">
    <div class="main-box">
      <el-form :model="dataForm"
               status-icon
               :rules="rules"
               ref="ForgetThePwdForm"
               class="web-ruleForm">
        <div class="ForgetThePwd-brand">
          <img src="@/assets/logo.png"
               alt="logo">
        </div>
        <el-form-item v-if="dataForm.mode == 'phone'"
                      prop="phone"
                      class="form-phone">
          <el-select v-model="dataForm.regionCode"
                     placeholder="请选择">
            <el-option :label="item.label"
                       :value="item.value"
                       v-for="(item,index) in areaCodeList"
                       :key="index">{{item.value}}</el-option>
          </el-select>
          <el-input v-model="dataForm.phone"
                    autocomplete="off"
                    placeholder="请输入手机号码"></el-input>
        </el-form-item>
        <el-form-item v-if="dataForm.mode == 'email'"
                      prop="email">
          <el-input v-model="dataForm.email"
                    autocomplete="off"
                    placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item v-show="dataForm.mode == 'phone'"
                      prop="code"
                      class="form-code">
          <el-input v-model="dataForm.code"
                    autocomplete="off"
                    placeholder="请输入验证码">
            <div slot="append"
                 class="code-btn">
              <div v-if="phoneLockTime > 0"
                   class="code-btn-time">{{ `${phoneLockTime}秒后重新获取` }}</div>
              <el-button v-else
                         class="code-btn"
                         style="color:#3f3fde"
                         @click="onLoadSmsCaptcha">获取验证码</el-button>
            </div>
          </el-input>
        </el-form-item>
        <el-form-item v-show="dataForm.mode == 'email'"
                      prop="code"
                      class="form-code">
          <el-input v-model="dataForm.code"
                    autocomplete="off"
                    placeholder="请输入验证码">
            <div v-if="emailLockTime > 0"
                 slot="append">{{ `${emailLockTime}秒后重新获取` }}</div>
            <el-button v-else
                       slot="append"
                       class="code-btn"
                       style="color:#3f3fde"
                       @click="onLoadMailCaptcha">获取验证码</el-button>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input type="password"
                    v-model="dataForm.password"
                    autocomplete="off"
                    placeholder="请输入新密码"></el-input>
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input type="password"
                    v-model="dataForm.confirmPassword"
                    autocomplete="off"
                    placeholder="请确认新密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary"
                     @click="submitForm()"
                     class="login-btn">完成并登录</el-button>
          <div class="to-login">
            <p v-if="dataForm.mode == 'email'"
               @click="switchMode('phone')">手机号找回</p>
            <p v-if="dataForm.mode == 'phone'"
               @click="switchMode('email')">邮箱找回</p>
            <router-link to="/login">已有账号? 返回 <span>登录</span></router-link>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <!-- <icp></icp> -->
    <captcha-image ref="captchaRef"></captcha-image>
  </div>
</template>

<script>
import CaptchaImage from '../components/common/CaptchaImage.vue';
import useConfigStore from '@/store/configStore.js';
import Icp from '../components/common/Icp.vue'
import areaCode from '../utils/resource/areaCode.js'
import { login, changePassword } from '../api/user.js'
export default {
  name: "login",
  components: {
    Icp,
    CaptchaImage
  },
  data () {
    var checkPhone = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入手机号码'));
      }
      const regex = /^1[3-9]\d{9}$/;
      if (!regex.test(value)) {
        return callback(new Error('手机号格式错误'));
      }
      callback();
    };
    var checkEmail = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入邮箱'));
      }
      const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!regex.test(value)) {
        return callback(new Error('邮箱格式错误'));
      }
      callback();
    };
    var checkPassword = (rule, value, callback) => {
      if (value === '') {
        return callback(new Error('请输入密码'));
      }
      callback();
    };
    var checkConfirmPassword = (rule, value, callback) => {
      if (value === '') {
        return callback(new Error('请输入密码'));
      }
      if (value != this.dataForm.password) {
        return callback(new Error('两次密码输入不一致'));
      }
      callback();
    };
    return {
      dataForm: {
        phone: '',
        email: '',
        code: '',
        mode: 'phone',
        password: '',
        confirmPassword: '',
        regionCode: '+86'
      },
      rules: {
        phone: [{
          validator: checkPhone,
          trigger: 'blur'
        }],
        email: [{
          validator: checkEmail,
          trigger: 'blur'
        }],
        password: [{
          validator: checkPassword,
          trigger: 'blur'
        }],
        confirmPassword: [{
          validator: checkConfirmPassword,
          trigger: 'blur'
        }]
      },
      showCaptchaImage: false,
      phoneLockTime: 0,
      phoneLockTimer: null,
      emailLockTime: 0,
      emailLockTimer: null,
      modeNameMap: {
        username: "用户名注册",
        phone: "手机号注册",
        email: "邮箱注册"
      },
      next: true,
      nextName: '下一步',
      agreement: false,
      areaCodeList: areaCode
    };
  },
  methods: {
    async userLogin () {
      let query = {
        terminal: this.$enums.TERMINAL_TYPE.WEB,
        mode: 'password',
        regionCode: this.dataForm.regionCode,
        userName: this.dataForm.phone || this.dataForm.email,
        password: this.dataForm.password,
        deviceId: this.deviceId, // 使用生成的设备ID
        deviceName: this.deviceName || '未知设备' // 设备名称可以根据需要设置
      }
      const res = await login(query)
      if (res.accessToken) {
        window.electronStore.setItem("accessToken", res.accessToken);
        window.electronStore.setItem("refreshToken", res.refreshToken);
        this.$router.push("/home/chat");
        window.electronAPI.resize(1000, 650);
      }
    },
    submitForm () {
      this.$refs.ForgetThePwdForm.validate(async (valid) => {
        if (valid) {
          let query = {
            mode: this.dataForm.mode,
            code: this.dataForm.code,
            newPassword: this.dataForm.password
          }
          switch (this.dataForm.mode) {
            case 'phone':
              query.phone = this.dataForm.phone
              break
            case 'email':
              query.email = this.dataForm.email
              break
          }
          await changePassword(query)
          this.$message.success('修改密码成功,登录转跳中...');
          this.userLogin()
        }
      });
    },
    onLoadSmsCaptcha () {
      this.$refs.ForgetThePwdForm.validateField('phone', (valid) => {
        if (valid == '') {
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
              phone: this.dataForm.phone,
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
        }
      })
    },
    onLoadMailCaptcha () {
      this.$refs.ForgetThePwdForm.validateField('email', (valid) => {
        if (valid == '') {
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
            email: this.dataForm.email,
          }
          this.$http({
            url: "/captcha/mail/code",
            method: 'post',
            data: data
          }).then(() => {
            this.$message.success("验证码已发送至您的邮箱，请注意查收")
          })
        }
      })
    },
    switchMode (mode) {
      this.next = true
      this.nextName = '下一步'
      this.dataForm = {
        phone: '',
        email: '',
        code: '',
        mode: mode,
        password: '',
        confirmPassword: '',
        regionCode: '+86'
      }
    },
    resetForm () {
      this.$refs.ForgetThePwdForm.resetFields();
    }
  },
  computed: {
    config () {
      return useConfigStore().registration;
    },
    deviceName () {
      return this.userStore.deviceName;
    },
    deviceId () {
      return this.userStore.deviceId;
    }
  },
  watch: {
    config: {
      handler () {
        this.switchMode(this.config.mode[0]);
      }
    }
  },
  mounted () {
    if (this.config.mode) {
      this.switchMode(this.config.mode[0]);
      this.userStore.initDeviceInfo()
    }
  }
}
</script>

<style scoped lang="scss">
  .ForgetThePwd {
    width: 100%;
    height: 100%;
    background-size: cover;
    box-sizing: border-box;
    .main-box {
      position: relative;
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 0 10% 10% 10%;
      .web-ruleForm {
        height: 500px;
        width: 360px;
        padding: 10px 30px 30px 30px;
        opacity: 0.9;
        border-radius: 3%;
        overflow: hidden;
      }
      .ForgetThePwd-brand {
        display: flex;
        justify-content: center;
        align-items: center;
        line-height: 50px;
        margin: 30px 0 40px 0;
        font-size: 22px;
        font-weight: 600;
        letter-spacing: 2px;
        text-transform: uppercase;
        text-align: center;
        img {
          width: 75px;
          height: 90px;
        }
      }

      .to-login {
        display: flex;
        flex-direction: row;
        line-height: 10px;
        text-align: left;
        align-items: center;
        justify-content: space-between;
        p {
          cursor: pointer;
          color: #3066ec;
        }
        a {
          color: #000;
          text-decoration: none;
          span {
            color: #3066ec;
          }
        }
      }

      .other-mode {
        display: flex;
        justify-content: center;
        align-items: center;

        .reg-mode {
          display: flex;
          padding: 20px;
          cursor: pointer;

          .icon {
            color: var(--im-text-color);
            font-size: 20px;
            margin-right: 2px;
          }

          .mode-text {
            color: var(--im-text-color);
            font-size: var(--im-font-size);
          }

          &.active {
            .mode-text {
              color: var(--im-color-primary);
            }

            .icon {
              color: var(--im-color-primary);
            }
          }
        }
      }
    }
  }
  .login-btn {
    width: 100%;
    height: 40px;
    margin-left: 0px !important;
  }
  .last_step-btn {
    width: 100%;
    height: 40px;
    margin-bottom: 10px;
  }
  ::v-deep .el-input__inner {
    text-align: center;
  }
  .login-form-checkbox {
    margin-top: 20px;
    margin-bottom: 10px;
    color: #909090;
    ::v-deep .el-checkbox__label {
      font-size: 12px;
    }
    span {
      color: #3066ec;
    }
  }
  .form-phone {
    ::v-deep .el-form-item__content {
      display: flex;
      position: relative;
      .el-select {
        width: 60px;
        height: 100%;
        position: absolute;
        z-index: 888;
        .el-input__inner {
          box-shadow: none;
          padding-right: 10px;
          text-align: center;
          border: none !important;
        }
        .el-input__suffix {
          display: none;
        }
      }
      .el-input__content {
        input {
          text-align: center;
          width: 100%;
          padding-left: 60px; /* 留出空间给选择器 */
        }
      }
    }
  }
  ::v-deep .el-input__inner {
    border: none;
    box-shadow: 0px 0px 5px 0px rgba(76, 76, 76, 0.1);
    border-radius: 4px 4px 4px 4px;
  }
  ::v-deep .el-input-group__append {
    border: none;
    box-shadow: 0px 0px 5px 0px rgba(76, 76, 76, 0.1);
    border-radius: 0px 4px 4px 0px;
  }
  .sex-radio {
    ::v-deep .el-form-item__label {
      color: #999999;
    }
    ::v-deep .el-form-item__content {
      display: flex;
      justify-content: flex-end;
      .el-form-item__error {
        position: absolute;
        top: 100%;
        left: -82px;
      }
      label:first-child {
        margin-right: 5px;
      }
      label {
        span {
          border: none !important;
          border-radius: 5px;
        }
        .el-radio-button__inner {
          padding: 7px 20px;
          margin-top: 5px;
        }
      }
      .female {
        .el-radio-button__orig-radio:checked + .el-radio-button__inner {
          background-color: #f383bb;
          border-color: #f383bb;
          box-shadow: -1px 0 0 0 #f383bb;
        }
      }
      .male {
        .el-radio-button__orig-radio:checked + .el-radio-button__inner {
          background-color: #7ec9f4;
          border-color: #7ec9f4;
          box-shadow: -1px 0 0 0 #7ec9f4;
        }
      }
    }
    .click-icon {
      color: #fff !important;
    }
  }
  .form-code {
    .code-btn-time {
      background: #f2f2f2;
      padding: 6px 5px;
      margin-right: -15px;
      border-radius: 3px;
    }
    ::v-deep .el-input-group__append {
      background-color: #fff !important;
      box-shadow: none;
      button {
        background: #f2f2f2;
        color: #000 !important;
        margin-right: -15px;
        border-radius: 3px;
      }
    }
  }
</style>
