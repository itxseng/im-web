<template>
  <div class="login-view">
    <div class="login-content">
      <PhoneLogin @cut="cut"
                  v-if="type === 'phone'" />
      <QRCodeLogin @cut="cut"
                   v-if="type === 'qrcode'" />
      <EmailLogin @cut="cut"
                  v-if="type === 'email'" />
    </div>
    <!-- <icp></icp> -->
    <captcha-image ref="captchaRef"></captcha-image>
  </div>
</template>

<script>
import Icp from '../components/common/Icp.vue'
import CaptchaImage from '../components/common/CaptchaImage.vue';
import PhoneLogin from '../components/login/PhoneLogin.vue';
import QRCodeLogin from '../components/login/QRCodeLogin.vue';
import EmailLogin from '../components/login/EmailLogin.vue';
import useConfigStore from '../store/configStore';
import useUserStore from '../store/userStore';
export default {
  name: "login",
  components: {
    Icp,
    CaptchaImage,
    PhoneLogin,
    QRCodeLogin,
    EmailLogin
  },
  data () {
    return {
      type: 'phone'
    };
  },
  methods: {
    cut (type) {
      this.type = type;
    }
  },
  created () {
    // 加载配置
  },
  mounted () {
    useConfigStore().loadConfig();
    useUserStore().initDeviceInfo();
    window.electronAPI.resize(450, 600);
  },
  computed: {
    loginNamePlaceholder () {
      let mode = useConfigStore().registration.mode;
      let strText = "用户名";
      if (mode.includes("phone")) {
        strText += "/手机号"
      }
      if (mode.includes("email")) {
        strText += "/邮箱"
      }
      return strText;
    },
    deviceName () {
      return useUserStore().deviceName;
    },
    deviceId () {
      return useUserStore().deviceId;
    }
  },
  watch: {
    loginForm: {
      handler (newVal) {
        // 当用户名或密码变化时，更新头像
        if (newVal.userName) {
          const user = this.userNameList.find(item => item.userName === newVal.userName);
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

<style scoped lang="scss">
  .login-view {
    width: 100%;
    height: 100%;
    background-size: cover;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    background: linear-gradient(
      270deg,
      #ffffff 0%,
      rgba(224, 232, 251, 0.5) 100%
    );
    .login-content {
      height: 500px;
      width: 360px;
      padding: 10px 30px 30px 30px;
      position: relative;
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 10%;
    }
  }
</style>