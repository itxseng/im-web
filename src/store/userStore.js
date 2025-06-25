import http from '../api/httpRequest.js'
import { defineStore } from 'pinia';
import { RTC_STATE } from "../api/enums.js"
import os from 'os';
const crypto = require('crypto');
export default defineStore('userStore', {
  state: () => {
    return {
      userInfo: {},
      rtcInfo: {
        friend: {},  // 好友信息
        mode: "video", // 模式 video:视频 voice:语音
        state: RTC_STATE.FREE // FREE:空闲  WAIT_CALL:呼叫方等待 WAIT_ACCEPT: 被呼叫方等待接听  CHATING:聊天中 
      },
      deviceName: '',
      deviceId: ''
    }
  },
  actions: {
    setDeviceName (name) {
      this.deviceName = name;
    },
    setDeviceId (id) {
      this.deviceId = id;
    },
    // ------------------------------
    setUserInfo (userInfo) {
      this.userInfo = userInfo
    },
    setRtcInfo (rtcInfo) {
      this.rtcInfo = rtcInfo;
    },
    setRtcState (rtcState) {
      this.rtcInfo.state = rtcState;
    },
    clear () {
      this.userInfo = {};
      this.rtcInfo = {
        friend: {},
        mode: "video",
        state: RTC_STATE.FREE
      };
    },
    loadUser () {
      return new Promise((resolve, reject) => {
        http({
          url: '/user/self',
          method: 'GET'
        }).then((userInfo) => {
          this.setUserInfo(userInfo);
          resolve();
        }).catch((res) => {
          reject(res);
        });
      })
    },
    initDeviceInfo () {
      // 判断当前环境
      const isElectron = () => {
        return typeof window !== 'undefined' &&
          typeof window.electronAPI !== 'undefined';
      }
      // 获取 deviceName
      let deviceName = localStorage.getItem('deviceName');
      if (!deviceName) {
        if (isElectron()) {
          deviceName = window.electronAPI.getUsername();
        } else {
          deviceName = 'Windows PC'
        }
        localStorage.setItem('deviceName', deviceName);
      }
      this.setDeviceName(deviceName);
      // 获取 deviceId
      let deviceId = localStorage.getItem('deviceId');
      if (!deviceId) {
        const raw = [
          os.platform(),
          os.arch(),
          os.release(),
          os.hostname(),
          Date.now()
        ].join('-');

        deviceId = crypto.createHash('md5').update(raw).digest('hex');
        localStorage.setItem('deviceId', deviceId);
      }
      this.setDeviceId(deviceId);
    }
  }
});