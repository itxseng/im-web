<template>
  <div class="chat-forward-message">
    <div>
      <div class="message-text"
           v-if="content.type == $enums.MESSAGE_TYPE.TEXT"
           v-html="htmlText">
      </div>
      <div :class="['message-image',contentData.selfSend ? 'right-bg' : 'left-bg']"
           v-if="content.type == $enums.MESSAGE_TYPE.IMAGE">
        <div class="message-image-tip"
             v-html="forwardTip"></div>
        <div class="message-image-img">
          <img class="send-image"
               :src="JSON.parse(content.content).originUrl"
               @click="showFullImageBox()"
               loading="lazy" />
        </div>
      </div>
      <div :class="['message-video',contentData.selfSend ? 'right-bg' : 'left-bg']"
           v-if="content.type == $enums.MESSAGE_TYPE.VIDEO">
        <div class="message-image-tip"
             v-html="forwardTip"></div>
        <video class="send-video"
               controls
               preload="none"
               :poster="JSON.parse(content.content).coverUrl"
               :src="JSON.parse(content.content).videoUrl" />
      </div>
      <div :class="['message-file',contentData.selfSend ? 'right-bg' : 'left-bg']"
           v-if="content.type == $enums.MESSAGE_TYPE.FILE">
        <div class="message-image-tip"
             v-html="forwardTip"></div>
        <div class="file-box">
          <div class="file-info">
            <div class="file-icon">
              <!-- 使用转发消息本身作为 msgInfo，保持与文件消息一致的下载状态逻辑 -->
              <downloadFile :msgInfo="cardInfo"
                            :chat="chat" />
            </div>
            <div class="file-text">
              <p class="file-text-name">{{ JSON.parse(content.content).name}}</p>
              <div class="file-size">
                <span>{{ fileSize(JSON.parse(content.content).size) }}</span>
                <span>{{filtrationTime(content.sendTime)}}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="message-text"
           v-if="content.type == $enums.MESSAGE_TYPE.AUDIO"
           v-html="aideoHtml">
      </div>
    </div>
  </div>
</template>
<script>
import downloadFile from '@/components/common/downloadFile'
export default {
  components: {
    downloadFile
  },
  name: "ChatForwardMessage",
  props: {
    cardInfo: {
      type: Object
    },
    chat: { type: Object, default: () => { } },
    groupMembers: { type: Array, default: () => [] },
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
    },
    filtrationTime (time) {
      console.log(time);

      const date = new Date(time);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');

      return `${hours}:${minutes}:${seconds}`;
    },
    isSentIt () {
      if (this.userInfo.id == this.content.sendId) {
        return this.userInfo
      } else if (this.isFriend) {
        return this.friendInfo
      } else if (!this.isFriend) {
        return { nickName: this.groupMemberInfo.showNickName, headImage: this.groupMemberInfo.headImage }
      }
    },
  },
  computed: {
    contentData () {
      return this.cardInfo
    },
    content () {
      return JSON.parse(this.cardInfo.content)
    },
    userInfo () {
      return this.userStore.userInfo;
    },
    isFriend () {
      return this.friendStore.isFriend(this.content.sendId);
    },
    friendInfo () {
      return this.friendStore.findFriend(this.content.sendId)
    },
    groupMemberInfo () {
      return this.groupMembers.find((f) => f.userId == this.content.sendId);
    },
    forwardTip () {
      let html = `<div style="display: flex;justify-content: flex-start;align-items: center;">转发自用户<img style="width: 30px;height: 30px;border-radius: 15px;margin:0 3px;" src="${this.isSentIt().headImage}" />${this.isSentIt().nickName}</div>`
      return html
    },
    htmlText () {
      let text = this.$url.replaceURLWithHTMLLinks(this.content.content)
      let html = `${this.forwardTip}<div>${text}</div>`
      return this.$emo.transform(html, 'emoji-normal')
    },
    aideoHtml () {
      let text = JSON.parse(this.content.content).duration
      return `${this.forwardTip}<div>[语音] ${text}"</div>`
    }
  }
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
    padding: 10px 2px 2px 2px;
    .message-image-tip {
      padding-left: 5px;
    }
    .message-image-img {
      width: 100%;
      height: calc(100% - 20px);
      display: flex;
      align-items: center;
      justify-content: center;
      img {
        width: calc(100% - 5px);
        height: 100%;
      }
    }
  }
  .message-video {
    background-color: #3066ec;
    border-radius: 10px;
    display: flex;
    flex-direction: column !important;
    align-items: flex-start !important;
    padding: 10px 10px 17px 10px;
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
    background-color: #3066ec !important;
    border-radius: 10px;
    display: flex;
    flex-direction: column !important;
    align-items: flex-start !important;
    padding: 10px 10px 15px 10px;
    .message-image-tip {
      padding-left: 5px;
    }
    .file-box {
      box-shadow: inset 0 0px 15px rgb(0 0 0 / 13%) !important;
    }
    .download-file {
      color: #3066ec !important;
    }
  }
  .left-bg {
    background-color: white;
    .message-image-tip {
      color: #000 !important;
    }
  }
  .right-bg {
    background-color: #3066ec;
  }
</style>
