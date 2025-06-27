<template>
  <div class="chat-msg-item"
       :class="{ active: innerActive }">
    <el-checkbox v-if="isNormal && selected"
                 v-model="checked"
                 @change="onSelectMessage(msgInfo)"
                 :disabled="!isNormal"
                 class="chat-msg-item-checkbox" />
    <div class="message-tip"
         v-if="msgInfo.type == $enums.MESSAGE_TYPE.TIP_TEXT">
      {{ msgInfo.content }}
    </div>
    <div class="message-tip"
         v-else-if="msgInfo.type == $enums.MESSAGE_TYPE.TIP_TIME">
      <span>{{ $date.toTimeText(msgInfo.sendTime) }}</span>
    </div>
    <div class="message-normal"
         v-else-if="isNormal"
         :class="[{ 'message-mine': mine },selected ? 'mr' : '', isGroup ? '' : 'left-set']">
      <div class="avatar"
           v-if="isGroup">
        <head-image :size="38"
                    :url="headImage"
                    :id="msgInfo.sendId"></head-image>
      </div>
      <div class="content">
        <div v-if="msgInfo.groupId && !msgInfo.selfSend"
             class="top">
          <div>{{ showName }}</div>
          <el-tag v-if="isGroupOwner(msgInfo.sendId)"
                  class="tag"
                  size="mini"
                  type="danger">群主</el-tag>
          <el-tag v-if="isGroupManager(msgInfo.sendId)"
                  class="tag"
                  size="mini"
                  type="primary">管理员</el-tag>
        </div>
        <div class="bottom"
             @contextmenu.prevent="showMessageMenu($event)">
          <div ref="chatMsgBox">
            <div class="box-message">
              <span class="message-text"
                    v-if="msgInfo.type == $enums.MESSAGE_TYPE.TEXT"
                    v-html="htmlText"></span>
            </div>
            <div class="message-image"
                 v-if="msgInfo.type == $enums.MESSAGE_TYPE.IMAGE">
              <div v-loading="loading"
                   element-loading-text="上传中.."
                   element-loading-background="rgba(0, 0, 0, 0.4)">
                <img class="send-image"
                     :src="contentData.thumbUrl"
                     @click="showFullImageBox()"
                     loading="lazy" />
              </div>
              <span title="发送失败"
                    v-show="loadFail"
                    @click="onSendFail"
                    class="send-fail el-icon-warning"></span>
            </div>
            <div class="message-video"
                 v-if="msgInfo.type == $enums.MESSAGE_TYPE.VIDEO">
              <video class="send-video"
                     controls
                     preload="none"
                     :poster="contentData.coverUrl"
                     :src="contentData.videoUrl" />
              <span title="发送失败"
                    v-show="loadFail"
                    @click="onSendFail"
                    class="send-fail el-icon-warning"></span>
            </div>
            <div class="message-file"
                 v-if="msgInfo.type == $enums.MESSAGE_TYPE.FILE">
              <div class="file-box"
                   v-loading="loading">
                <div class="file-info">
                  <!-- <el-link class="file-name"
                           :underline="true"
                           target="_blank"
                           type="primary"
                           :href="contentData.url.originUrl"
                           :download="contentData.name">{{ contentData.name
										}}</el-link> -->
                  <div class="file-icon">
                    <downloadFile :msgInfo="msgInfo"
                                  :chat="chat"
                                  :id="msgInfo.id" />
                  </div>
                  <div class="file-text">
                    <p>{{ contentData.name}}</p>
                    <div class="file-size">
                      <span>{{ fileSize }}</span>
                      <span>{{filtrationTime(msgInfo.sendTime)}}</span>
                    </div>
                  </div>
                </div>
              </div>
              <span title="发送失败"
                    v-show="loadFail"
                    @click="onSendFail"
                    class="send-fail el-icon-warning"></span>
            </div>
          </div>
          <div class="message-voice"
               v-if="msgInfo.type == $enums.MESSAGE_TYPE.AUDIO"
               @click="onPlayVoice()">
            <audio controls
                   :src="contentData.url.originUrl"></audio>
          </div>
          <ChatForwardMessage v-if="msgInfo.type == $enums.MESSAGE_TYPE.FORWARD"
                              :cardInfo="contentData" />
          <chat-user-card v-if="msgInfo.type == $enums.MESSAGE_TYPE.USER_CARD"
                          :cardInfo="contentData"></chat-user-card>
          <chat-group-card v-if="msgInfo.type == $enums.MESSAGE_TYPE.GROUP_CARD"
                           :cardInfo="contentData"></chat-group-card>
          <div class="chat-action message-text"
               v-if="isAction">
            <span v-if="msgInfo.type == $enums.MESSAGE_TYPE.ACT_RT_VOICE"
                  title="重新呼叫"
                  @click="$emit('call')"
                  class="iconfont icon-chat-voice"></span>
            <span v-if="msgInfo.type == $enums.MESSAGE_TYPE.ACT_RT_VIDEO"
                  title="重新呼叫"
                  @click="$emit('call')"
                  class="iconfont icon-chat-video"></span>
            <span>{{ msgInfo.content }}</span>
          </div>
          <div class="quote-message"
               v-if="msgInfo.quoteMessage"
               @contextmenu.prevent.stop="showQuoteMenu($event)">
            <chat-quote-message :msgInfo="msgInfo.quoteMessage"
                                @click.native.stop="$emit('locateQuote', msgInfo)"
                                :showName="quoteShowName"></chat-quote-message>
          </div>
          <!-- <div class="message-time">{{ filtrationTime(msgInfo.sendTime) }}</div> -->
          <div class="message-status"
               v-if="!isAction">
            <div class="chat-readed"
                 v-show="msgInfo.selfSend && !msgInfo.groupId
							&& msgInfo.status == $enums.MESSAGE_STATUS.READED">
              <div class="chat-readed-text">
                {{ filtrationTime(msgInfo.sendTime) }} &nbsp;<span class="icon"></span>
              </div>
            </div>
            <div class="chat-unread"
                 v-show="msgInfo.selfSend && !msgInfo.groupId
							&& msgInfo.status != $enums.MESSAGE_STATUS.READED">
              <div class="chat-unread-text">
                {{ filtrationTime(msgInfo.sendTime) }} &nbsp;<span class="icon"></span>
              </div>
            </div>
          </div>
          <div class="chat-receipt"
               v-if="msgInfo.receipt"
               @click="onShowReadedBox">
            <span v-if="msgInfo.receiptOk"
                  class="icon iconfont icon-ok"
                  title="全体已读"></span>
            <span v-else>{{ msgInfo.readedCount }}人已读</span>
          </div>
        </div>
      </div>
    </div>
    <right-menu ref="rightMenu"
                @select="onSelectMenu"></right-menu>
    <chat-group-readed ref="chatGroupReadedBox"
                       :msgInfo="msgInfo"
                       :group="group"
                       :groupMembers="groupMembers"></chat-group-readed>
  </div>
</template>

<script>
import HeadImage from "../common/HeadImage.vue";
import RightMenu from '../common/RightMenu.vue';
import ChatGroupReaded from './ChatGroupReaded.vue';
import ChatQuoteMessage from "./ChatQuoteMessage.vue";
import ChatUserCard from "./ChatUserCard.vue";
import ChatGroupCard from "./ChatGroupCard.vue";
import ChatForwardMessage from "./ChatForwardMessage.vue";
import downloadFile from '@/components/common/downloadFile'
export default {
  name: "messageItem",
  components: {
    HeadImage,
    RightMenu,
    ChatGroupReaded,
    ChatQuoteMessage,
    ChatUserCard,
    ChatGroupCard,
    ChatForwardMessage,
    downloadFile
  },
  props: {
    mode: {
      type: Number,
      default: 1
    },
    active: {
      type: Boolean,
      default: false
    },
    mine: {
      type: Boolean,
      required: true
    },
    headImage: {
      type: String,
      default: ''
    },
    showName: {
      type: String,
      required: true
    },
    quoteShowName: {
      type: String,
      default: ''
    },
    msgInfo: {
      type: Object,
      required: true
    },
    group: {
      type: Object,
    },
    groupMembers: {
      type: Array
    },
    selected: {
      type: Boolean,
      default: false
    },
    isGroup: {
      type: Boolean,
      default: false
    },
    chat: {
      type: Object,
      default: () => { }
    },
    activeSignal: {
      default: 0
    }
  },
  data () {
    return {
      checked: false,
      innerActive: false,
      timer: null,
      lastTrigger: 0 // 用于防止同值不触发 watch
    }
  },
  methods: {
    // fileSendTime (time) {
    //   return filtrationTime(time);
    // },
    onSendFail () {
      this.$message.error("该文件已发送失败，目前不支持自动重新发送，建议手动重新发送")
    },
    showFullImageBox () {
      let imageUrl = this.contentData.originUrl;
      if (imageUrl) {
        this.$eventBus.$emit("openFullImage", imageUrl);
      }
    },
    onPlayVoice () {
      if (!this.audio) {
        this.audio = new Audio();
      }
      this.audio.src = this.contentData.url;
      this.audio.play();
      this.onPlayVoice = 'RUNNING';
    },
    showMessageMenu (e) {
      console.log("showMessageMenu", this.msgInfo);

      let menuItems = [];
      if (this.$msgType.isNormal(this.msgInfo.type)) {
        menuItems.push({
          key: 'QUOTE',
          name: '回复'
        });
      }
      if (this.msgInfo.selfSend && this.msgInfo.id > 0 && this.msgInfo.type == this.$enums.MESSAGE_TYPE.TEXT) {
        menuItems.push({
          key: 'EDIT',
          name: '编辑'
        });
      }
      if (this.msgInfo.type == this.$enums.MESSAGE_TYPE.TEXT) {
        menuItems.push({
          key: 'COPY',
          name: '复制文字'
        });
      }
      if (this.msgInfo.type == this.$enums.MESSAGE_TYPE.TEXT || this.msgInfo.type == this.$enums.MESSAGE_TYPE.IMAGE || this.msgInfo.type == this.$enums.MESSAGE_TYPE.FILE || this.msgInfo.type == this.$enums.MESSAGE_TYPE.VIDEO || this.msgInfo.type == this.$enums.MESSAGE_TYPE.AUDIO) {
        menuItems.push({
          key: 'COLLECT',
          name: '收藏'
        });
        menuItems.push({
          key: 'TRANSMIT',
          name: '转发消息'
        });
        menuItems.push({
          key: 'SELECT',
          name: '选择消息'
        });
        menuItems.push({
          key: 'COMPLAINT',
          name: '投诉'
        });
        if (this.msgInfo.selfSend && this.msgInfo.id > 0) {
          menuItems.push({
            key: 'RECALL',
            name: '撤回',
          });
        }
        if ((this.isOwner || this.isManager) && this.$msgType.isNormal(this.msgInfo.type)) {
          menuItems.push({
            key: 'TOP',
            name: '置顶'
          });
        }
      }
      // menuItems.push({
      //   key: 'DELETE',
      //   name: '删除消息'
      // });
      menuItems.push({
        key: 'DELETEALL',
        name: '删除消息'
      });
      this.$refs.rightMenu.open(e, menuItems);
    },
    showQuoteMenu (e) {
      let menuItems = [];
      if (this.msgInfo.quoteMessage &&
        this.msgInfo.quoteMessage.status != this.$enums.MESSAGE_STATUS.RECALL) {
        menuItems.push({
          key: 'LOCATE_QUOTE',
          name: '定位到原消息'
        });
      }
      this.$refs.rightMenu.open(e, menuItems);
    },
    onSelectMenu (item) {
      // 菜单id转驼峰作为事件key
      let eventKey = item.key.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      console.log(eventKey, this.msgInfo);
      this.$emit(eventKey, this.msgInfo);
    },
    onShowReadedBox () {
      let rect = this.$refs.chatMsgBox.getBoundingClientRect();
      this.$refs.chatGroupReadedBox.open(rect);
    },
    isGroupOwner (userId) {
      return this.group.ownerId == userId;
    },
    isGroupManager (userId) {
      let m = this.groupMembers.find(m => m.userId == userId);
      return m && m.isManager
    },
    onSelectMessage (item) {
      this.$emit('selectMessage', { type: this.checked, item });
      console.log("选择消息", item, this.checked);
    },
    filtrationTime (time) {
      const date = new Date(time);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');

      return `${hours}:${minutes}:${seconds}`;
    },
    activateHighlight () {
      this.innerActive = true;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.innerActive = false;
        this.$emit('cleared');
      }, 800);
    }
  },
  computed: {
    contentData () {
      return JSON.parse(this.msgInfo.content)
    },
    loading () {
      return this.msgInfo.loadStatus && this.msgInfo.loadStatus === "loading";
    },
    loadFail () {
      return this.msgInfo.loadStatus && this.msgInfo.loadStatus === "fail";
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
    isAction () {
      return this.$msgType.isAction(this.msgInfo.type);
    },
    isNormal () {
      const type = this.msgInfo.type;
      return this.$msgType.isNormal(type) || this.$msgType.isAction(type)
    },
    isOwner () {
      let userId = this.userStore.userInfo.id;
      return this.group && userId == this.group.ownerId
    },
    isManager () {
      let userId = this.userStore.userInfo.id;
      let m = this.groupMembers.find((m) => m.userId == userId);
      return m && m.isManager;
    },
    htmlText () {
      let color = this.msgInfo.selfSend ? 'white' : '';
      let text = this.$url.replaceURLWithHTMLLinks(this.msgInfo.content, color)
      return this.$emo.transform(text, 'emoji-normal')
    }
  },
  watch: {
    activeSignal (newVal) {
      if (newVal !== this.lastTrigger) {
        this.lastTrigger = newVal; // 标记本次触发值
        this.activateHighlight();
      }
    }
  },
  beforeDestroy () {
    clearTimeout(this.timer);
  }
}
</script>

<style lang="scss">
  .chat-msg-item {
    padding: 2px 10px;
    border-radius: 10px;
    position: relative;
    transition: 0.5s;
    .chat-msg-item-checkbox {
      position: absolute;
      top: 19px;
      right: 13px;
    }
    .mr {
      margin-right: 30px !important;
    }

    .message-tip {
      line-height: 50px;
      font-size: var(--im-font-size-small);
      color: var(--im-text-color-light);
      word-break: break-all;
      display: flex;
      justify-content: center;
      align-items: center;
      span {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 30px;
        // background-color: #00000027;
        padding: 0 10px;
        border-radius: 8px;
        color: #8c8c8c;
      }
    }

    .message-normal {
      position: relative;
      font-size: 0;
      padding-left: 48px;
      min-height: 50px;
      margin: 5px 0;

      .avatar {
        position: absolute;
        width: 40px;
        height: 40px;
        top: 0;
        left: 0;
      }

      .content {
        text-align: left;

        .send-fail {
          color: #e60c0c;
          font-size: 30px;
          cursor: pointer;
          margin: 0 20px;
        }

        .top {
          display: flex;
          flex-wrap: nowrap;
          color: #888;
          font-size: var(--im-font-size);
          line-height: 20px;
          align-items: center;

          .tag {
            margin: 0 5px;
            padding: 0 5px;
            font-size: 10px;
            border: 0;
            border-radius: 3px;
          }
        }

        .bottom {
          display: inline-block;
          padding-right: 220px;
          margin-top: 2px;

          .message-text {
            display: inline-block;
            position: relative;
            max-width: 100%;
            line-height: 26px;
            padding: 6px 15px 6px 15px;
            background: white;
            border-radius: 10px;
            font-size: var(--im-font-size);
            text-align: left;
            white-space: pre-wrap;
            word-break: break-all;

            &:after {
              content: "";
              position: absolute;
              left: -10px;
              top: -8.2px;
              width: 20px;
              height: 25px;
              background: url("../../assets/chat/bubble-left.png") no-repeat
                center;
              background-size: 100%;
              overflow: hidden;
              z-index: 0;
            }
          }

          .message-image {
            display: flex;
            flex-wrap: nowrap;
            flex-direction: row;
            align-items: center;

            .send-image {
              min-width: 200px;
              max-width: 400px;
              border-radius: 8px;
              cursor: pointer;
            }
          }

          .message-video {
            display: flex;
            flex-wrap: nowrap;
            flex-direction: row;
            align-items: center;

            .send-video {
              min-width: 200px;
              max-width: 300px;
              max-height: 300px;
              border-radius: 10px;
              overflow: hidden;
              cursor: pointer;
              object-fit: contain;
            }
          }

          .message-file {
            display: flex;
            flex-wrap: nowrap;
            flex-direction: row;
            align-items: center;
            cursor: pointer;
            margin-bottom: 2px;

            .file-box {
              display: flex;
              flex-wrap: nowrap;
              align-items: center;
              min-height: 60px;
              box-shadow: var(--im-box-shadow-light);
              border-radius: 4px;
              padding: 10px 15px;

              .file-info {
                flex: 1;
                height: 100%;
                font-size: 14px;
                margin-right: 10px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                .file-text {
                  width: calc(100% - 55px);
                  height: 100%;
                  margin-left: 10px;
                  display: flex;
                  flex-direction: column;
                  align-items: flex-start;
                  p {
                    margin: 0;
                  }
                }
                .file-name {
                  display: inline-block;
                  min-width: 160px;
                  max-width: 220px;
                  font-size: 14px;
                  margin-bottom: 4px;
                  white-space: pre-wrap;
                  word-break: break-all;
                }

                .file-size {
                  width: 100%;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  font-size: var(--im-font-size-smaller);
                  color: var(--im-text-color-light);
                  margin-top: 10px;
                }
              }

              .file-icon {
                width: 45px;
                height: 45px;
                background-color: #3065ec;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 25px;
                color: #fff;
              }
            }

            .send-fail {
              color: #e60c0c;
              font-size: 30px;
              cursor: pointer;
              margin: 0 20px;
            }
          }

          .message-voice audio {
            height: 45px;
            cursor: pointer;
          }

          .chat-action {
            display: flex;
            align-items: center;

            .iconfont {
              cursor: pointer;
              font-size: 22px;
              padding-right: 8px;
            }
          }

          .quote-message {
            display: block;
            margin-top: 3px;
            cursor: pointer;
            padding: 7px;
            border-radius: 4px;
            background-color: #cccccc69;
          }

          .message-status {
            display: block;

            .chat-readed {
              font-size: 13px;
              color: #8c8c8c;
              display: flex;
              align-items: center;
              justify-content: flex-end;
              .chat-readed-text {
                width: 80px;
                display: flex;
                align-items: center;
                justify-content: flex-end;
                background-color: #0000001f;
                border-radius: 3px;
                padding: 3px 3px;
                margin-top: 4px;
              }
              .icon {
                width: 20px;
                height: 20px;
                background: url("../../assets/chat/read-icon.png") no-repeat
                  center;
                background-size: 100%;
              }
            }

            .chat-unread {
              font-size: 13px;
              color: #8c8c8c;
              display: flex;
              align-items: center;
              justify-content: flex-end;
              .chat-unread-text {
                width: 80px;
                display: flex;
                align-items: center;
                justify-content: flex-end;
                background-color: #0000001f;
                border-radius: 3px;
                padding: 3px 3px;
                margin-top: 4px;
                .icon {
                  width: 20px;
                  height: 20px;
                  background: url("../../assets/chat/unread-icon.png") no-repeat
                    center;
                  background-size: 100%;
                }
              }
            }
          }

          .chat-receipt {
            font-size: var(--im-font-size-smaller);
            cursor: pointer;
            color: var(--im-text-color-light);

            .icon-ok {
              font-size: 20px;
              color: var(--im-color-sucess);
            }
          }

          .chat-at-user {
            padding: 2px 5px;
            border-radius: 3px;
            cursor: pointer;
          }
        }
      }
      &.message-mine {
        text-align: right;
        padding-left: 0;
        padding-right: 48px;

        .avatar {
          left: auto;
          right: 0;
        }

        .content {
          text-align: right;
          .top {
            flex-direction: row-reverse;
          }

        .bottom {
          padding-left: 170px;
          padding-right: 5px;
          .message-text {
            background-color: #3066ec;
            margin-left: 10px;
            color: #fff;
            max-width: 100%;

              &:after {
                left: auto;
                right: -7px;
                background: url("../../assets/chat/bubble-right.png") no-repeat
                  center;
                background-size: 100%;
              }
            }

            .message-image {
              flex-direction: row-reverse;
            }

            .message-video {
              flex-direction: row-reverse;
            }

            .message-file {
              flex-direction: row-reverse;
            }

            .chat-action {
              flex-direction: row-reverse;

              .iconfont {
                transform: rotateY(180deg);
              }
            }
          }
        }
      }
    }
    .left-set {
      padding: 0px !important;
    }
  }
  .active {
    background: #e1eaf7;
    transition: 0.3s;
  }
  .icon-chat-phone {
    width: 20px;
    height: 20px;
    background: url("../../assets/chat/phone-icon.png") no-repeat center;
    background-size: 80%;
  }
  .bg {
    background-color: #3066ec;
  }
</style>