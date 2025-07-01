<template>
  <div class="user-equipment">
    <div class="header-title">
      我的设备
    </div>
    <div class="current-equipment">
      <div class="current-equipment-title">
        当前设备
      </div>
      <div class="current-equipment-item">
        <div class="current-equipment-item-text">
          <span class="current-equipment-item-text-versions">1.0.0</span>
          <span class="current-equipment-item-text-device">{{currentDeviceData.deviceName ? currentDeviceData.deviceName : '未识别'}}</span>
          <span class="current-equipment-item-text-ip">{{currentDeviceData.deviceId ? currentDeviceData.deviceId : '未识别'}}</span>
        </div>
        <el-divider></el-divider>
        <div class="current-equipment-item-btn">
          <span>注销所有其他设备</span>
        </div>
        <p class="current-equipment-item-tip">退出所有已登录的设备，只保留当前使用的</p>
      </div>
    </div>
    <div class="current-equipment mt">
      <div class="current-equipment-title">
        设备列表
      </div>
      <ul class="current-equipment-item">
        <template v-if="otherDeviceList && otherDeviceList.length > 0">
          <li class="current-equipment-item-text"
              v-for="(item,index) in otherDeviceList"
              :key="index">
            <div class="current-equipment-item-text-versions">
              <span>
                {{item.versions ? item.versions : '未知'}}
              </span>
              <span class="time">
                {{item.lastLoginTime}}
              </span>
              <div class="delet-icon">
                <i class="el-icon-delete"></i>
              </div>
            </div>
            <p class="current-equipment-item-text-device">
              {{item.deviceName}}
            </p>
            <p class="current-equipment-item-text-ip">
              {{item.lastIp}}
            </p>
          </li>
        </template>
        <div class="current-equipment-item-no-data"
             v-else>
          暂时无设备数据
        </div>
      </ul>
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
      // let 
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
  .user-equipment {
    width: 100%;
    height: 100%;
    .header-title {
      width: 100%;
      height: 50px;
      padding: 0 20px;
      box-sizing: border-box;
      border-bottom: 1px solid #e5e5e5;
      font-size: 18px;
      color: #33333390;
      display: flex;
      align-items: center;
    }
    .current-equipment {
      width: 100%;
      height: 160px;
      box-sizing: border-box;
      padding: 0 20px;
      .current-equipment-title {
        width: 100%;
        height: 25px;
        padding: 5px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        color: #33333390;
        box-sizing: border-box;
      }
    }
    .current-equipment-item {
      width: 100%;
      min-height: 145px;
      background-color: #fff;
      border-radius: 4px;
      padding: 15px 20px;
      box-sizing: border-box;
      position: relative;
      .current-equipment-item-text {
        width: 100%;
        height: 70px;
        font-size: 12px;
        color: #000;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: space-between;
        p {
          margin: 0;
        }
        .current-equipment-item-text-device {
          text-align: left;
        }
        .current-equipment-item-text-versions {
          font-size: 14px;
          font-weight: 700;
        }
        .current-equipment-item-text-ip {
          color: #999999;
        }
      }
      .current-equipment-item-tip {
        position: absolute;
        left: 20px;
        bottom: -40px;
        color: #33333390;
        font-size: 12px;
      }
      .current-equipment-item-btn {
        width: 100%;
        display: flex;
        align-items: center;
        color: #c42b1c;
        font-weight: 500;
        span {
          cursor: pointer;
          font-size: 14px;
        }
      }
    }
    ul {
      width: 100%;
      min-height: 60px !important;
      margin: 0px;
      li {
        width: 100%;
        height: 79px;
        padding: 10px 0px;
        border-bottom: 1px solid #e5e5e5;
        box-sizing: border-box;
        position: relative;
        .delet-icon {
          position: absolute;
          right: 0;
          bottom: 10px;
          cursor: pointer;
          .el-icon-delete {
            font-size: 22px;
            color: #c42b1c;
          }
          .el-icon-delete:hover {
            color: #c42a1cbc;
          }
        }
        .current-equipment-item-text-versions {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          .time {
            color: #999999;
            font-weight: normal;
          }
        }
      }
      li:first-child {
        padding: 0 0 10px 0px;
      }
      li:last-child {
        border: none;
      }
    }
    .mt {
      margin-top: 70px;
    }
    .current-equipment-item-no-data {
      width: 100%;
      font-size: 14px;
      color: #999;
    }
  }
</style>
