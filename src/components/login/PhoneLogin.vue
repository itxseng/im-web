<template>
  <div class="phone-login">
    <el-form class="login-form"
             :model="loginForm"
             status-icon
             :rules="rules"
             ref="loginForm"
             @keyup.enter.native="submitForm('loginForm')">
      <div class="login-brand">
        <img :src="userImg"
             alt=""
             v-if="isShowImg && userImg">
        <img :src="defaultAvatar"
             alt=""
             v-else>
      </div>
      <el-form-item prop="userName"
                    v-show="false">
        <el-input type="terminal"
                  v-model="loginForm.terminal"
                  autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item class="login-name">
        <el-select v-model="loginForm.regionCode"
                   placeholder="请选择">
          <el-option :label="item.label"
                     :value="item.value"
                     v-for="(item,index) in areaCodeList"
                     :key="index">{{item.value}}</el-option>
        </el-select>
        <el-input type="userName"
                  class="el-input__content"
                  v-model="loginForm.userName"
                  placeholder="请输入手机号"
                  :suffix-icon="suffixIcon"
                  @click.native="handleClick"
                  ref="inputRef">
        </el-input>
        <el-popover placement="bottom-start"
                    trigger="manual"
                    v-model="visible"
                    :reference="$refs.inputWrapper">
          <template v-if="userNameList && userNameList.length > 0">
            <div class="user-name-list"
                 v-for="(item, index) in userNameList"
                 :key="index"
                 @click="selectItem(item)">
              <p>{{ item.phone }}</p>
              <i class="el-icon-close"
                 @click="removeItem(item)"></i>
            </div>
          </template>
          <p v-else
             class="no-data">暂无数据</p>
        </el-popover>
      </el-form-item>
      <el-form-item prop="password">
        <el-input type="password"
                  :show-password="true"
                  v-model="loginForm.password"
                  autocomplete="off"
                  placeholder="请输入密码"></el-input>
      </el-form-item>
      <el-checkbox v-model="agreement"
                   class="login-form-checkbox">我已阅读并同意<span>《用户隐私协议》</span>和<span>《隐私政策》</span></el-checkbox>
      <el-form-item>
        <el-button type="primary"
                   @click="submitForm('loginForm')"
                   class="login-btn">登录</el-button>
      </el-form-item>
      <div class="register">
        <a @click="cut('qrcode')">二维码登录</a>
        <span>丨</span>
        <a @click="cut('email')">邮箱登录</a>
        <span>丨</span>
        <el-dropdown trigger="click"
                     class="el-dropdown">
          <a class="el-dropdown-link">
            更多
          </a>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>
              <div @click="goTo('register')"
                   class="dropdown-item">注册账号</div>
            </el-dropdown-item>
            <el-dropdown-item>
              <div @click="goTo('forgetThePwd')"
                   class="dropdown-item">忘记密码</div>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-form>
  </div>
</template>
<script>
import areaCode from '../../utils/resource/areaCode.js'
import useUserStore from '../../store/userStore';
export default {
  props: ['device'],
  data () {
    var checkUsername = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入用户名'));
      }
      callback();
    };
    var checkPassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'));
      }
      callback();
    };
    return {
      loginForm: {
        terminal: this.$enums.TERMINAL_TYPE.WEB,
        // terminal: String(new Date().getTime()).slice(-8), // 使用时间戳作为终端标识
        userName: '',
        password: '',
        regionCode: '+86',
        mode: 'password' // 登录方式，默认为密码登录
      },
      rules: {
        userName: [{
          validator: checkUsername,
          trigger: 'blur'
        }],
        password: [{
          validator: checkPassword,
          trigger: 'blur'
        }]
      },
      userNameList: [], // 用户名列表
      // deviceId: '', // 设备ID
      // deviceName: '', // 设备名称
      defaultAvatar: require('../../assets/image/default-avatar.png'), // 默认头像
      visible: false,
      suffixIcon: 'el-icon-caret-bottom', // 图标
      agreement: false,
      userImg: '',
      areaCodeList: areaCode,
      isShowImg: false
    }
  },
  methods: {
    goTo (router) {
      this.$router.push(router);
    },
    cut (type) {
      this.$emit('cut', type)
    },
    removeItem (item) {
      const index = this.userNameList.indexOf(item);
      if (index > -1) {
        this.userNameList.splice(index, 1);
        this.isShowImg = false
      }
    },
    handleClick (event) {
      // 只在点击图标时触发
      const iconEl = this.$refs.inputRef.$el.querySelector('.el-input__suffix');
      if (iconEl && iconEl.contains(event.target)) {
        this.suffixIcon = 'el-icon-caret-top'; // 切换图标
        this.visible = !this.visible;
        if (this.visible) {
          this.suffixIcon = 'el-icon-caret-top';
        } else {
          this.suffixIcon = 'el-icon-caret-bottom';
        }
      }
    },
    selectItem (item) {
      this.loginForm.userName = item.phone;
      this.userImg = item.img
      this.suffixIcon = 'el-icon-caret-bottom';
      this.visible = false;
      this.isShowImg = true
    },
    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let agreement = document.querySelector('.login-form-checkbox')
          if (this.agreement) {
            agreement.classList.remove('apply-shake')
            let queryData = {
              ...this.loginForm,
              deviceId: this.deviceId, // 使用生成的设备ID
              deviceName: this.deviceName || '未知设备' // 设备名称可以根据需要设置
            };
            this.$http({
              url: "/login",
              method: 'post',
              data: queryData
            })
              .then((data) => {
                // 保存密码到cookie(不安全)
                this.setCookie('username', this.loginForm.userName);
                this.setCookie('password', this.loginForm.password);
                // 保存token
                window.electronStore.setItem("accessToken", data.accessToken);
                window.electronStore.setItem("refreshToken", data.refreshToken);
                window.electronStore.setItem("userNameList", JSON.stringify(this.userNameList));
                this.$message.success("登录成功");
                this.$router.push("/home/chat");
                window.electronAPI.resize(1075, 650);
              })
          } else {
            agreement.classList.add('apply-shake')
            setTimeout(() => {
              agreement.classList.remove('apply-shake')
            }, 500)
          }
        }
      });
    },
    resetForm (formName) {
      this.$refs[formName].resetFields();
    },
    // 获取cookie、
    getCookie (name) {
      let reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
      let arr = document.cookie.match(reg)
      if (arr) {
        return unescape(arr[2]);
      }
      return '';
    },
    // 设置cookie,增加到vue实例方便全局调用
    setCookie (name, value) {
      document.cookie = name + "=" + escape(value);
    }
  },
  computed: {
    deviceName () {
      return useUserStore().deviceName;
    },
    deviceId () {
      return useUserStore().deviceId;
    }
  },
  mounted () {
    let arr = window.electronStore.getItem('userNameList') ? JSON.parse(window.electronStore.getItem('userNameList')) : [];
    this.userNameList = arr.filter(item => item.phone)
    this.loginForm.userName = this.userNameList.length > 0 ? this.userNameList[0].userName : '';
  },
  watch: {
    loginForm: {
      handler (newVal) {
        // 当用户名或密码变化时，更新头像
        if (newVal.userName) {
          const user = this.userNameList.find(item => item.phone === newVal.userName);
          this.userImg = user ? user.img : null;
        } else {
          this.userImg = null;
        }
      },
      deep: true
    }
  }
}
</script>
<style lang="scss" scoped>
  .phone-login {
    .login-form {
      height: 100%;
      width: 100%;
      opacity: 0.9;
      border-radius: 3%;
      overflow: hidden;

      .login-brand {
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
        border-radius: 50px;
        img {
          width: 90px;
          height: 90px;
          border-radius: 50px;
        }
      }

      .register {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        line-height: 40px;
        text-align: left;
        margin-top: 40px;
        span {
          margin: 0 10px;
          color: #999;
        }
        a {
          color: #3066ec;
          text-decoration: none;
          cursor: pointer;
          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }
  .el-input__suffix {
    cursor: pointer;
  }
  ::v-deep .el-popover {
    position: absolute;
    top: 40px;
    left: -1px;
    width: 90%;
  }
  no-data,
  .user-name-list {
    width: calc(100% - 10px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 5px;
    &:hover {
      background-color: #f5f5f5;
    }
    p {
      width: 80%;
      margin: 0;
      cursor: pointer;
    }
    .el-icon-close {
      cursor: pointer;
    }
  }
  .no-data {
    // text-align: center;
    padding: 5px;
    margin: 0;
    color: #999;
  }
  ::v-deep .el-input__inner {
    text-align: left;
  }
  .login-btn {
    width: 100%;
    height: 40px;
  }
  .login-form-checkbox {
    margin-top: 40px;
    margin-bottom: 10px;
    color: #909090;
    span {
      color: #3066ec;
    }
  }
  ::v-deep .el-checkbox__label {
    font-size: 12.5px;
  }
  ::v-deep .el-input__inner {
    text-align: center;
    border: none;
    box-shadow: 0px 0px 5px 0px rgba(76, 76, 76, 0.1);
    border-radius: 4px 4px 4px 4px;
  }
  .login-name {
    ::v-deep .el-form-item__content {
      display: flex;
      position: relative;
      .el-select {
        width: 60px;
        position: absolute;
        z-index: 888;
        .el-input__inner {
          box-shadow: none;
          padding-right: 10px;
          text-align: center;
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
  ::v-deep .el-dropdown {
    .el-dropdown-link {
      cursor: pointer;
    }
  }
  .el-dropdown-menu__item {
    padding: 0px !important;
    a {
      color: #3066ec !important;
      // 取消下划线
      text-decoration: none;
      cursor: pointer;
    }
  }
  .dropdown-item {
    width: 100%;
    height: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }
  @keyframes shake {
    10%,
    90% {
      transform: translate3d(-1px, 0, 0);
    }

    20%,
    80% {
      transform: translate3d(2px, 0, 0);
    }

    30%,
    50%,
    70% {
      transform: translate3d(-4px, 0, 0);
    }

    40%,
    60% {
      transform: translate3d(4px, 0, 0);
    }
  }

  .apply-shake {
    animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }
</style>