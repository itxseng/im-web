<template>
  <div class="chat-top-announcement"
       @click.stop="openAnnouncement">
    <i class="el-icon-chat-dot-square"></i>
    <div class="content">
      <p>{{ groupAnnouncement }}</p>
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
    openAnnouncement () {
      this.$emit('openAnnouncement')
    }
  },
  computed: {
    groupAnnouncement () {
      return this.groupStore.groupInfo.notice;
    }
  },
}
</script>
<style lang="scss" scoped>
  .chat-top-announcement {
    width: calc(100% - 10px);
    height: 40px !important;
    margin: 5px;
    padding: 0 10px;
    background: #cccccc8e;
    border-radius: 8px;
    box-sizing: border-box;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    .el-icon-chat-dot-square {
      font-size: 25px;
      line-height: 50px;
      height: 50px !important;
      color: #f8ba33;
    }
    .content {
      width: calc(100% - 30px);
      height: 50px;
      p {
        width: 100%;
        padding: 0;
        margin: 0;
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: left;
      }
    }
  }
</style>