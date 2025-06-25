<template>
  <div class="my-group">
    <div class="title">我的群聊</div>
    <ul class="content">
      <template v-for="(group, i) in groups">
        <li class="content-item"
            :key="i" v-if="group.quit === false">
          <div class="content-item-left">
            <div class="content-item-left-img">
              <img :src="group.headImage"
                   alt="">
            </div>
            <div class="content-item-left-text">
              <p>{{group.name}}（999+）</p>
            </div>
          </div>
          <div class="content-item-right">
            <div class="content-item-right-btn"
                 @click="onSendMessage(group)">发消息</div>
          </div>
        </li>
      </template>
    </ul>
  </div>
</template>
<script>
export default {
  data () {
    return {

    }
  },
  methods: {
    onSendMessage (group) {
      let chat = {
        type: 'GROUP',
        targetId: group.id,
        showName: group.showGroupName,
        headImage: group.headImage,
      };
      this.chatStore.openChat(chat);
      this.chatStore.setActiveChat(group.id);
      this.$router.push("/home/chat");
    }
  },
  computed: {
    groups () {
      console.log('获取我的群聊', this.groupStore.groups);

      return this.groupStore.groups;
    }
  }
}
</script>
<style lang="scss" scoped>
  .my-group {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    .title {
      height: 50px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 12px;
      font-size: var(--im-font-size-larger);
      border-bottom: var(--im-border);
      box-sizing: border-box;
      font-weight: 700;
      padding: 0 20px;
    }
    .content {
      width: 100%;
      height: calc(100% - 50px);
      padding: 0px 20px;
      margin: 20px 0px !important;
      overflow-y: auto;
      box-sizing: border-box;
      .content-item {
        width: 100%;
        height: 70px;
        background: white;
        margin-bottom: 15px;
        padding: 15px 20px;
        display: flex;
        box-sizing: border-box;
        border-radius: 4px;
        .content-item-left {
          width: 70%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          .content-item-left-img {
            width: 40px;
            height: 40px;
            // background: #ccc;
            border-radius: 20px;
            img {
              width: 100%;
              height: 100%;
              border-radius: 20px;
            }
          }
          .content-item-left-text {
            width: calc(100% - 50px);
            height: 40px;
            margin-left: 10px;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            p {
              font-size: 12px;
              margin: 0px;
            }
          }
        }
        .content-item-right {
          width: 30%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          .content-item-right-btn {
            width: 70px;
            height: 25px;
            background-color: #3066ec;
            border-radius: 4px;
            font-size: 12px;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }
        }
      }
      .content-item:last-child {
        margin-bottom: 0px !important;
      }
    }
  }
</style>