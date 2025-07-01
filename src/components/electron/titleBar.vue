<!-- 在 Vue 组件中 -->
<template>
  <div :class="['custom-titlebar']">
    <!-- 左侧标题 -->
    <!-- <div class="titlebar-drag-area">
      <span class="app-title">{{ appName }}</span>
    </div> -->
    <!-- 右侧控制按钮 -->
    <div :class="['window-controls',isShow ? '' : 'bg-right']">
      <div :class="['window-controls-left',isShow ? 'bg-left' : '']"></div>
      <div :class="['window-controls-right',isShow ? 'bg-right' : '']">
        <div class="window-controls-inner">
          <div @click="minimize">
            <span class="icon-minimize"></span>
          </div>
          <div @click="toggleMax">
            <span class="icon-maximize"></span>
          </div>
          <div class="close"
               @click="close">
            <span class="icon-close"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "CustomTitleBar",
  data () {
    return {
      appName: 'My Electron App',
      isMaximized: false,
      isShow: false
    }
  },
  // 在 Vue 组件中
  methods: {
    minimize () { window.electronAPI.minimize(); },
    toggleMax () { window.electronAPI.toggleMax(); },
    close () { window.electronAPI.close(); },
  },
  mounted () {
    window.electronAPI.onMaximized(() => { this.isMax = true; });
    window.electronAPI.onRestored(() => { this.isMax = false; });
  },
  watch: {
    '$route': {
      handler (to, from) {
        // 当路由变化时，检查是否需要显示标题栏
        if (to.path === '/login' || to.path === '/register' || to.path === '/forgetThePwd') {
          this.isShow = false;
        } else {
          this.isShow = true;
        }
      }
    }, deep: true,
    immediate: true
  }
};
</script>
<style scoped lang="scss">
  .custom-titlebar {
    height: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    -webkit-app-region: drag; /* 允许拖拽区域 */
    border-radius: 4px 4px 0 0;
    z-index: 9999999;
  }

  .titlebar-drag-area {
    --width: 60px;
    width: var(--width);
    color: #fff;
  }

  .window-controls {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    align-items: center;
    .window-controls-left {
      width: 30%;
      height: 100%;
    }
    .window-controls-right {
      width: 70%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
    .window-controls-inner {
      width: 100px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      -webkit-app-region: no-drag; /* 禁止按钮拖拽 */
      div {
        width: 40px;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        transition: background 0.2s;
        font-weight: 700;
        .icon-minimize {
          width: 16px;
          height: 16px;
          background: url("../../assets/icon/titleBar/reduce.svg") no-repeat
            center center;
          background-size: 100%;
        }
        .icon-maximize {
          width: 16px;
          height: 16px;
          background: url("../../assets/icon/titleBar/magnify.svg") no-repeat
            center center;
          background-size: 100%;
        }
        .icon-close {
          width: 12px;
          height: 12px;
          background: url("../../assets/icon/titleBar/close.svg") no-repeat center
            center;
          background-size: 100%;
        }
      }
      div:hover {
        background: #ebebeb;
      }
      .close:hover {
        background: #c42b1c;
      }
    }
  }
  .bg-right {
    background: linear-gradient(
      270deg,
      #ffffff 0%,
      #f0f3f9 100%
    ) !important;
  }
  .bg-left {
    background: white;
  }
</style>
