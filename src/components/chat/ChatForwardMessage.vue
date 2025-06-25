<template>
  <div class="chat-forward-message">
    <div>
      <div class="message-text"
           v-if="content.type == $enums.MESSAGE_TYPE.TEXT"
           v-html="htmlText">
      </div>
      <div class="message-image"
           v-if="content.type == $enums.MESSAGE_TYPE.IMAGE">
        <div class="message-image-tip"
             v-html="forwardTip"></div>
        <img class="send-image"
             :src="JSON.parse(content.content).originUrl"
             @click="showFullImageBox()"
             loading="lazy" />
      </div>
      <div class="message-video"
           v-if="content.type == $enums.MESSAGE_TYPE.VIDEO">
        <div class="message-image-tip"
             v-html="forwardTip"></div>
        <video class="send-video"
               controls
               preload="none"
               :poster="JSON.parse(content.content).coverUrl"
               :src="JSON.parse(content.content).videoUrl" />
      </div>
      <div class="message-file"
           v-if="content.type == $enums.MESSAGE_TYPE.FILE">
        <div class="message-image-tip"
             v-html="forwardTip"></div>
        <div class="file-box">
          <div class="file-info">
            <el-link class="file-name"
                     :underline="true"
                     target="_blank"
                     type="primary"
                     :href="JSON.parse(content.content).url.originUrl"
                     :download="JSON.parse(content.content).name">{{ JSON.parse(content.content).name
										}}</el-link>
            <div class="file-size">{{ fileSize(JSON.parse(content.content).size)}}</div>
          </div>
          <div class="file-icon">
            <span type="primary"
                  class="el-icon-document"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "ChatForwardMessage",
  props: {
    cardInfo: {
      type: Object
    }
  },
  data () {
    return {}
  },
  methods: {
    showFullImageBox () {
      let imageUrl = JSON.parse(this.content.content).originUrl;
      if (imageUrl) {
        this.$eventBus.$emit("openFullImage", imageUrl);
      }
    },
    fileSize (fileSize) {
      let size = fileSize;
      if (size > 1024 * 1024) {
        return Math.round(size / 1024 / 1024) + "M";
      }
      if (size > 1024) {
        return Math.round(size / 1024) + "KB";
      }
      return size + "B";
    }
  },
  computed: {
    content () {
      console.log(this.cardInfo);

      return this.cardInfo
    },
    userInfo () {
      return this.userStore.userInfo;
    },
    friendInfo () {
      if (this.content.sendId === this.userInfo.id) {
        return this.userInfo
      } else {
        return this.friendStore.findFriend(this.content.sendId);
      }
    },
    forwardTip () {
      let html = `<div style="display: flex;justify-content: flex-start;align-items: center;">转发自用户<img style="width: 30px;height: 30px;border-radius: 15px;margin:0 3px;" src="${this.friendInfo.headImage}" />${this.friendInfo.nickName}</div>`
      return html
    },
    htmlText () {
      let text = this.$url.replaceURLWithHTMLLinks(this.cardInfo.content)
      let html = `${this.forwardTip}<div>${text}</div>`
      return this.$emo.transform(html, 'emoji-normal')
    }
  },


}
</script>
<style scoped lang="scss">
  .chat-forward-message {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    border-radius: 10px;
    font-size: var(--im-font-size);
  }
  .message-image-tip {
    padding-bottom: 7px;
    padding-left: 15px;
    font-size: var(--im-font-size);
    color: #fff;
  }
  .text-img {
    width: 30px;
    height: 30px;
  }
  .message-image {
    background-color: #3066ec;
    border-radius: 10px;
    display: flex;
    flex-direction: column !important;
    align-items: flex-start !important;
    padding: 10px;
    .message-image-tip {
      padding-left: 5px;
    }
  }
  .message-video {
    background-color: #3066ec;
    border-radius: 10px;
    display: flex;
    flex-direction: column !important;
    align-items: flex-start !important;
    padding: 10px;
    .send-video {
      min-width: 200px;
      max-width: 400px;
      border-radius: 8px;
      cursor: pointer;
    }
    .message-image-tip {
      padding-left: 5px;
    }
  }
  .message-file {
    background-color: #3066ec;
    border-radius: 10px;
    display: flex;
    flex-direction: column !important;
    align-items: flex-start !important;
    padding: 10px;
    .message-image-tip {
      padding-left: 5px;
    }
    .file-box {
      background-color: white;
    }
  }
</style>
