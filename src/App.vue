<template>
  <div id="app">
    <titleBarVue class="title-bar" />
    <div class="container">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import titleBarVue from './components/electron/titleBar.vue'
export default {
  name: 'App',
  components: {
    titleBarVue
  }
}
</script>

<style lang="scss">
  #app {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    // position: absolute;
    height: 100%;
    width: 100%;
    color: var(--im-text-color);
    font-family: var(--im-font-family);
    // background: linear-gradient(
    //   270deg,
    //   #ffffff 0%,
    //   rgba(184, 193, 213, 0.5) 100%
    // );
    .container {
      width: 100%;
      height: calc(100% - 30px);
      margin-top: 30px;
    }
    li {
      list-style: none;
    }
    .title-bar {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      overflow: hidden;
      margin: 0;
    }
  }
</style>
