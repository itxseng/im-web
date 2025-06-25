import { defineStore } from 'pinia';
import http from '../api/httpRequest.js'

export default defineStore('configStore', {
  state: () => {
    return {
      registration: {
        mode: []
      },
      webrtc: {},
      sendSize: {
        image: 10 * 1024 * 1024,
        video: 100 * 1024 * 1024,
        file: 200 * 1024 * 1024
      }
    }
  },
  actions: {
    setConfig (config) {
      this.webrtc = config.webrtc;
      this.registration = config.registration;
    },
    loadConfig () {
      return new Promise((resolve, reject) => {
        http({
          url: '/system/config',
          method: 'GET'
        }).then(config => {
          console.log("系统配置", config)
          this.setConfig(config);
          resolve();
        }).catch((res) => {
          reject(res);
        });
      })
    }
  }
});