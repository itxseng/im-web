<template>
  <div class="chat-item-icon">
    <div class="star icon"
         v-if="chat.star"></div>
    <div class="info icon"
         v-if="chat.notifyExpireTs"></div>
    <div class="top icon"
         v-if="chat.top"></div>
  </div>
</template>
<script>
export default {
  data () {
    return {

    }
  },
  props: {
    chat: {
      type: Object,
      default () {
        return {}
      }
    }
  }
}
</script>
<style lang="scss" scoped>
  .chat-item-icon {
    width: 50px;
    height: 20px;
    display: flex;
    justify-content: flex-end;
    .icon {
      width: 15px;
      height: 100%;
      margin-right: 5px;
    }
    .info {
      background: url("~@/assets/chat/info-icon.png") no-repeat center;
      background-size: 100%;
    }
    .top {
      width: 14px;
      height: 100%;
      background: url("~@/assets/chat/top-icon.png") no-repeat center;
      background-size: 100%;
    }
    .star {
      width: 16px;
      background: url("~@/assets/chat/star-icon.png") no-repeat center;
      background-size: 100%;
    }
    .icon:last-child {
      margin-right: 0;
    }
  }
</style>