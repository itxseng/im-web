<template>
  <div class="chat-quote-message">
    <div v-if="isRecall"
         class="recall">{{ msgInfo.content }}</div>
    <div v-if="!isRecall"
         class="send-user">
      {{ showName + ":" }}
    </div>
    <div v-if="!isRecall"
         class="quote-content">
      <span v-if="msgInfo.type == $enums.MESSAGE_TYPE.TEXT"
            v-html="$emo.transform(msgInfo.content, 'emoji-small')"></span>
      <div v-if="msgInfo.type == $enums.MESSAGE_TYPE.IMAGE"
           class="quote-content-img">
        <img class="quote-image"
             :src="contentData.thumbUrl" />
      </div>
      <div v-if="msgInfo.type == $enums.MESSAGE_TYPE.VIDEO">
        <video ref="videoPlayer"
               class="quote-video"
               controls
               preload="none"
               :poster="contentData.coverUrl"
               :src="contentData.videoUrl" />
      </div>
      <div v-if="msgInfo.type == $enums.MESSAGE_TYPE.AUDIO">
        <audio class="quote-audio"
               controls
               :src="contentData.url"></audio>
      </div>
      <div class="quote-file"
           v-if="msgInfo.type == $enums.MESSAGE_TYPE.FILE">
        <div class="quote-file-info">
          <div class="quote-file-name">{{ contentData.name }}</div>
        </div>
        <div class="quote-file-icon">
          <span type="primary"
                class="el-icon-document"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "chatQuoteMessage",
  props: {
    showName: {
      type: String,
      required: true
    },
    msgInfo: {
      type: Object,
      required: true
    }
  },
  data () {
    return {

    }
  },
  methods: {
    showFullImageBox () {
      let imageUrl = this.contentData.originUrl;
      if (imageUrl) {
        this.$eventBus.$emit("openFullImage", imageUrl);
      }
    },
  },
  computed: {
    quoteMessageText () {
      return this.msgInfo.content + "hello";
    },
    contentData () {
      return JSON.parse(this.msgInfo.content)
    },
    fileSize () {
      let size = this.contentData.size;
      if (size > 1024 * 1024) {
        return Math.round(size / 1024 / 1024) + "M";
      }
      if (size > 1024) {
        return Math.round(size / 1024) + "KB";
      }
      return size + "B";
    },
    isRecall () {
      return this.msgInfo.status == this.$enums.MESSAGE_STATUS.RECALL
    }
  }
}
</script>

<style lang="scss">
  .chat-quote-message {
    height: 100%;
    display: flex;
    align-items: center;
    border-radius: 8px;
    font-size: var(--im-font-size-smaller);
    color: var(--im-text-color-light);
    .send-user {
      margin-right: 10px;
      font-weight: 600;
    }

    .quote-content {
      height: 100%;
      display: flex;
      align-items: center;
      .quote-content-img {
        height: 100%;
        display: flex;
        align-items: center;
      }
      .quote-image {
        min-width: 40px;
        min-height: 30px;
        max-width: 80px;
        max-height: 40px;
        cursor: pointer;
      }

      .quote-video {
        min-width: 40px;
        min-height: 30px;
        max-width: 80px;
        max-height: 40px;
        cursor: pointer;
      }

      .quote-audio {
        height: 38px;
      }

      .quote-file {
        display: flex;
        flex-wrap: nowrap;
        flex-direction: row;
        align-items: center;
        cursor: pointer;
        padding: 2px 10px;
        background: #f5f5f5;
        border-radius: 4px;
        .quote-file-info {
          flex: 1;
          height: 100%;
          text-align: left;
          font-size: 14px;
          margin-right: 10px;

          .quote-file-name {
            display: inline-block;
            min-width: 50px;
            max-width: 220px;
            font-size: 14px;
            margin-bottom: 4px;
            white-space: pre-wrap;
            word-break: break-all;
          }

          .quote-file-size {
            font-size: var(--im-font-size-smaller);
            color: var(--im-text-color-light);
          }
        }

        .quote-file-icon {
          font-size: 32px;
          color: #3065ec;
        }
      }
    }
  }
</style>
