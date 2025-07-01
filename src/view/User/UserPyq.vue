<template>
  <div class="user-pyq">
    <div class="header-title">
      我的朋友圈
    </div>
    <div class="content">
      
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      deviceName: null,
      deviceId: null,
      currentDeviceData: {},
      otherDeviceList: [],
    }
  },
  created () {
    this.deviceName = window.electronStore.getItem('deviceName');
    this.deviceId = window.electronStore.getItem('deviceId');
    this.getEquipment()
  },
  mounted () {
  },
  methods: {
    getEquipment () {
      this.$http({
        url: `/user/login/device/list?deviceId=${this.deviceId}`,
        method: 'get'
      }).then((data) => {
        this.currentDeviceData = data.nowDevice
        this.otherDeviceList = data.otherDeviceList
        console.log(this.otherDeviceList)
      })
    }
  },
  computed: {
    userInfo () {
      return this.userStore
    }
  }
}
</script>
<style lang="scss" scoped>
  .user-pyq {
    width: 100%;
    height: 100%;
    .header-title {
      width: 100%;
      height: 50px;
      padding: 0 20px;
      box-sizing: border-box;
      border-bottom: 1px solid #e5e5e5;
      font-size: 18px;
      color: #000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
</style>
