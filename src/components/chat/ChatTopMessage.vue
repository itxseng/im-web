<template>
  <div class="chat-top-message">
    <!-- 指示器 -->
    <div class="indicator">
      <span class="dot"
            v-for="(item, index) in groupMassages"
            :key="index"
            :style="{'height':`calc(100% / ${groupMassagesNum})`}"
            :class="{ active: index === currentIndex }"></span>
    </div>
    <!-- 滚动容器 -->
    <div class="message-box"
         ref="scrollWrapper"
         @scroll="onScroll"
         @click.stop="scrollToNext()">
      <div class="message"
           v-for="(item, index) in groupMassages"
           :key="index"
           ref="messages">
        <div class="title">置顶消息:</div>
        <div class="content"
             v-html="content(item)"
             @click.stop="onLocate(item)">
        </div>
        <div class="close"
             title="移除"
             @click.stop="onClose(item)"
             v-if="isOwner || isManager">
          <i class="el-icon-close"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import HeadImage from '../common/HeadImage.vue';

export default {
  name: "chatTopMessage",
  // components: { HeadImage },
  props: {
    group: Object,
    groupMembers: Array,
    // msgInfo: { type: Object, required: true },
    // headImage: { type: String, default: '' },
    // showName: { type: String, required: true }
  },
  data () {
    return {
      currentIndex: 0,
      isScrollingByClick: false // <-- 新增标记
    }
  },
  computed: {
    groupMassagesNum () {
      return this.groupStore.groupInfo.topMessages.length;
    },
    groupMassages () {
      return this.groupStore.groupInfo.topMessages;
    },
    isOwner () {
      return this.group.ownerId === this.userStore.userInfo.id;
    },
    isManager () {
      const userId = this.userStore.userInfo.id;
      const m = this.groupMembers.find(m => m.userId === userId);
      return m && m.isManager;
    }
  },
  methods: {
    onClose (item) {
      if (this.isOwner || this.isManager) {
        this.removeTopMessage(item);
      }
      // else {
      //   this.hideTopMessage(item);
      // }
    },
    removeTopMessage (item) {
      console.log(item);

      this.$confirm('将在当前群聊的所有成员中移除此置顶消息,确认移除？', '移除置顶', {
        confirmButtonText: '移除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http({
          url: `/group/removeTopMessageById/${this.group.id}?messageId=${item.id}`,
          method: 'delete'
        }).then(() => {
          this.groupStore.deleteTopMessage(this.group.id, item)
          this.$message.success('移除成功');
        });
      });
    },
    hideTopMessage (item) {
      this.$http({
        url: "/group/hideTopMessage/" + this.group.id,
        method: 'delete'
      });
    },
    onLocate (item) {
      this.$emit('locate', item);
    },
    content (value) {
      let content = "不支持的消息类型";
      if (value.type === this.$enums.MESSAGE_TYPE.IMAGE) {
        content = "[图片]";
      } else if (value.type === this.$enums.MESSAGE_TYPE.VIDEO) {
        content = "[视频]";
      } else if (value.type === this.$enums.MESSAGE_TYPE.FILE) {
        content = "[文件] " + JSON.parse(value.content).name;
      } else if (value.type === this.$enums.MESSAGE_TYPE.AUDIO) {
        content = "[语音] " + JSON.parse(value.content).duration + '"';
      } else if (value.type === this.$enums.MESSAGE_TYPE.TEXT) {
        content = this.$emo.transform(value.content, 'emoji-normal');
      }
      return content;
    },
    scrollToNext () {
      // this.$emit("locate", this.msgInfo);
      this.$nextTick(() => {
        const messages = this.$refs.messages;
        const wrapper = this.$refs.scrollWrapper;

        if (!messages || !messages.length || !wrapper) return;

        let next = this.currentIndex + 1;
        if (next >= messages.length) next = 0;

        const target = messages[next];

        if (target) {
          this.isScrollingByClick = true; // 开启点击锁

          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          this.currentIndex = next;

          // 等待滚动完成后再解锁（300ms 视情况可调）
          setTimeout(() => {
            this.isScrollingByClick = false;
          }, 300);
        }
      });
    },
    onScroll () {
      if (this.scrollLock || this.isScrollingByClick) return;

      this.scrollLock = true;

      setTimeout(() => {
        const wrapper = this.$refs.scrollWrapper;
        const messages = this.$refs.messages;

        if (!messages || !wrapper) {
          this.scrollLock = false;
          return;
        }

        const scrollTop = wrapper.scrollTop;
        let closestIndex = 0;
        let minDistance = Infinity;

        messages.forEach((el, idx) => {
          const distance = Math.abs(el.offsetTop - scrollTop);
          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = idx;
          }
        });

        messages[closestIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
        this.currentIndex = closestIndex;

        this.scrollLock = false;
      }, 200);
    }
  }
}
</script>

<style scoped lang="scss">
  .chat-top-message {
    width: 100%;
    height: 50px; // 可自定义高度
    background: #dcebfd;
    border-radius: 8px;
    box-sizing: border-box;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    align-items: center;
    .message-box {
      display: flex;
      flex-direction: column;
      width: calc(100% - 3px);
      height: 50px; // 可自定义高度
      box-sizing: border-box;
      overflow-y: hidden;
      // overflow-x: hidden;
      scroll-behavior: smooth;
      // pointer-events: none;
    }

    .message {
      width: 100%;
      height: 50px !important; // 可自定义高度
      display: flex;
      align-items: center;
      padding: 5px 10px;
      min-height: 50px;
      box-sizing: border-box;
    }

    .title {
      width: 70px;
      font-size: var(--im-font-size-large);
      color: #666;
      flex-shrink: 0;
    }

    .content {
      width: calc(100% - 100px);
      height: 100%;
      font-size: var(--im-font-size-large);
      color: #666;
      word-break: break-word;
      cursor: pointer;
      margin-left: 10px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      overflow: hidden;
    }

    .close {
      width: 16px;
      margin-left: 10px;
      cursor: pointer;
      flex-shrink: 0;
    }

    .indicator {
      width: 3px;
      height: 50px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      z-index: 2;

      .dot {
        width: 3px;
        // height: calc(100% / var(--message-count));
        background: #bbb;
        margin: 2px 0;
        transition: background 0.3s;
        &.active {
          background: #409eff;
        }
      }
    }
    ::-webkit-scrollbar {
      width: 0px;
    }
  }
</style>
