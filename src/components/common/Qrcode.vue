<template>
  <div class="qrcode">
    <div class="title">
      <i class="el-icon-arrow-left"
         style="cursor: pointer;"
         @click="returnInfo"></i>
      <p>二维码</p>
    </div>
    <div class="content">
      <div class="content-box">
        <canvas ref="qrcodeCanvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script>
import QRCode from 'qrcode'

export default {
  data () {
    return {
      currentEntrance: null
    }
  },
  mounted () {

  },
  methods: {
    open (id, type, currentEntrance) {
      const link = {
        url: `${process.env.VUE_APP_PROXY}/user/find/${id}`,
        type: type
      }
      this.currentEntrance = currentEntrance
      QRCode.toCanvas(this.$refs.qrcodeCanvas, JSON.stringify(link), { width: 200 }, function (error) {
        if (error) console.error(error);
      });
    },
    returnInfo () {
      if (this.currentEntrance === '群成员信息') {
        this.$emit('returnInfo', '群成员信息')
      } else {
        this.$emit('returnInfo')
      }
      this.currentEntrance = null
    },
  }
}
</script>

<style lang="scss" scoped>
  .qrcode {
    width: 100%;
    padding-top: 6px;
    .title {
      width: 100%;
      padding: 0 20px;
      height: 35px;
      color: #999;
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
      display: flex;
      width: calc(100% - 40px);
      height: 280px;
      margin: 10px 20px;
      box-sizing: border-box;
      overflow-y: auto;
      align-items: center;
      justify-content: center;
      background: linear-gradient(
        270deg,
        #ffffff 0%,
        rgba(224, 232, 251, 0.5) 100%
      );
      border-radius: 7px;
      .content-box {
        width: 250px;
        height: 250px;
        display: flex;
        align-items: center;
        justify-content: center;
        canvas {
          border-radius: 7px;
        }
      }
    }
  }
</style>
