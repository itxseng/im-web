<template>
  <div class="QR_code-login">
    <div class="code">
      <img src="../../assets/icon/QRCode.png" alt="">
    </div>
    <p>请使用移动端扫描登录</p>
    <div class="register">
      <a @click="cut('phone')">手机号登录</a>
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
            <router-link to="/register">注册账号</router-link>
          </el-dropdown-item>
          <el-dropdown-item>
            <router-link to="/forgetThePwd">忘记密码</router-link>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      
    }
  },
  methods: {
    cut(type){
      this.$emit('cut',type)
    }
  }
}
</script>
<style lang="scss" scoped>
  .QR_code-login {
    height: 100%;
    width: 100%;
    opacity: 0.9;
    border-radius: 3%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .code {
    width: 300px;
    height: 300px;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 15px;
    img {
      width: 80%;
      height: 80%;
    }
  }
  p {
    color: #999999;
    margin-top: 20px;
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
    a {
      color: #3066ec !important;
      // 取消下划线
      text-decoration: none;
      cursor: pointer;
    }
  }
</style>