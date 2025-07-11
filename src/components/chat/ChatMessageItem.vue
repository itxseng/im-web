<template>
  <div class="chat-msg-item"
       :class="{ active: innerActive }"
       @click.prevent="onSelectMessage(msgInfo,!checked)">
    <el-checkbox v-if="isNormal && selected"
                 v-model="checked"
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
           v-if="isGroup"
           @click="openMamberInfo(msgInfo)"
           @contextmenu.prevent="showHeadMessageMenu($event,msgInfo)">
        <head-image :size="38"
                    :url="headImage"></head-image>
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
          <div ref="chatMsgBox"
               class="message-box">
            <!-- ? 文本消息 -->
            <div class="box-message"
                 v-if="msgInfo.type == $enums.MESSAGE_TYPE.TEXT">
              <span class="message-text"
                    v-html="htmlText"></span>
            </div>
            <!-- ? 图片消息 -->
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
            <!-- ? 视频消息 -->
            <div class="message-video"
                 v-if="msgInfo.type == $enums.MESSAGE_TYPE.VIDEO && contentData !== null">
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
            <!-- ? 文件消息 -->
            <div class="message-file"
                 v-if="msgInfo.type == $enums.MESSAGE_TYPE.FILE">
              <div class="file-box"
                   v-loading="loading">
                <div class="file-info">
                  <div class="file-icon">
                    <downloadFile :msgInfo="msgInfo"
                                  :chat="chat"
                                  :id="msgInfo.id" />
                  </div>
                  <div class="file-text">
                    <p class="file-text-name">{{ contentData.name}}</p>
                    <div class="file-size">
                      <span>{{ fileSize }}</span>
                      <!-- <span>{{filtrationTime(msgInfo.sendTime)}}</span> -->
                    </div>
                  </div>
                </div>
              </div>
              <span title="发送失败"
                    v-show="loadFail"
                    @click="onSendFail"
                    class="send-fail el-icon-warning"></span>
            </div>
            <!-- ? 语音消息 -->
            <div class="message-voice"
                 v-if="msgInfo.type == $enums.MESSAGE_TYPE.AUDIO"
                 @click="onPlayVoice()">
              <audio controls
                     :src="contentData.url.originUrl"></audio>
            </div>
            <!-- ? 会议邀请 -->
            <ChatConferenceCard v-if="msgInfo.type == $enums.MESSAGE_TYPE.CONFERENCE"
                                :sendUserId="msgInfo.sendId" />
            <!-- ? 转发消息 -->
            <ChatForwardMessage v-if="msgInfo.type == $enums.MESSAGE_TYPE.FORWARD && groupMembers"
                                :cardInfo="msgInfo"
                                :chat="chat"
                                :groupMembers="groupMembers" />
            <!-- ? 群组操作 -->
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
            <!-- ? 分享名片 -->
            <chat-user-card v-if="msgInfo.type == $enums.MESSAGE_TYPE.USER_CARD"
                            :cardInfo="contentData"></chat-user-card>
            <chat-group-card v-if="msgInfo.type == $enums.MESSAGE_TYPE.GROUP_CARD"
                             :cardInfo="contentData"></chat-group-card>
            <!-- ? 已读状态与时间 -->
            <div class="message-status"
                 v-if="!isAction"
                 :style="isFile">
              <div class="chat-readed"
                   @click="onShowReadedBox"
                   v-if="isGroup ? msgInfo.readedCount > 0 : msgInfo.status == $enums.MESSAGE_STATUS.READED">
                <div class="chat-readed-text">
                  {{ filtrationTime(msgInfo.sendTime) }} &nbsp;<span class="icon"
                        v-show="msgInfo.selfSend"></span>
                </div>
              </div>
              <div class="chat-unread"
                   @click="onShowReadedBox"
                   v-if="isGroup ? msgInfo.readedCount === 0  : msgInfo.status !== $enums.MESSAGE_STATUS.READED">
                <div class="chat-unread-text">
                  {{ filtrationTime(msgInfo.sendTime) }} &nbsp;<span class="icon"
                        v-show="msgInfo.selfSend"></span>
                </div>
              </div>
            </div>
          </div>
          <div class="quote-message"
               v-if="msgInfo.quoteMessage"
               @contextmenu.prevent.stop="showQuoteMenu($event)">
            <chat-quote-message :msgInfo="msgInfo.quoteMessage"
                                @click.native.stop="$emit('locateQuote', msgInfo)"
                                :showName="quoteShowName"></chat-quote-message>
          </div>
          <!-- <div class="message-time">{{ filtrationTime(msgInfo.sendTime) }}</div> -->
          <!-- <template v-if="isGroup && mine">
            <div class="chat-receipt"
                 v-if="msgInfo.receipt"
                 @click="onShowReadedBox">
              <span v-if="msgInfo.receiptOk">全体已读</span>
              <span v-else>{{ msgInfo.readedCount }}人已读</span>
            </div>
          </template> -->
        </div>
      </div>
    </div>
    <right-menu ref="rightMenu"
                @select="onSelectMenu"></right-menu>
    <chat-group-readed ref="chatGroupReadedBox"
                       :msgInfo="msgInfo"
                       :group="group"
                       :groupMembers="groupMembers"
                       v-if="isGroup"></chat-group-readed>
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
import ChatConferenceCard from "./ChatConferenceCard.vue";
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
    downloadFile,
    ChatConferenceCard
  },
  props: {
    isSelected: {
      type: Boolean,
      default: false
    },
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
    openMamberInfo (value) {
      this.groupStore.currentGroupMember.forEach(m => {
        if (m.userId == value.sendId) {
          this.$emit('openMemberInfo', m, '群成员')
          console.log('value', m);
        }
      })
    },
    onSendFail () {
      this.$message.error("该文件已发送失败，目前不支持自动重新发送，建议手动重新发送")
    },
    showFullImageBox () {
      if (!this.selected) {
        let imageUrl = this.contentData.originUrl;
        if (imageUrl) {
          this.$eventBus.$emit("openFullImage", imageUrl);
        }
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
    showHeadMessageMenu (e, msgInfo) {
      let memberInfo = this.groupMemberInfo(msgInfo.sendId)
      let menuItems = [
        {
          key: 'AT',
          name: '@一下'
        }
      ]
      if (this.isOwner || this.isManager) {
        if (memberInfo.isMuted) {
          menuItems.push({
            key: 'MUTE',
            name: '解除禁言'
          })
        } else {
          menuItems.push({
            key: 'MUTE',
            name: '禁言'
          })
        }
      }
      this.$refs.rightMenu.open(e, menuItems);
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
      if (this.msgInfo.type == this.$enums.MESSAGE_TYPE.TEXT || this.msgInfo.type == this.$enums.MESSAGE_TYPE.IMAGE || this.msgInfo.type == this.$enums.MESSAGE_TYPE.FILE || this.msgInfo.type == this.$enums.MESSAGE_TYPE.VIDEO) {
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
      if (this.msgInfo.selfSend && this.msgInfo.id > 0) {
        menuItems.push({
          key: 'RECALL',
          name: '撤回',
        });
      }
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
      if (this.isGroup && this.mine) {
        let rect = this.$refs.chatMsgBox.getBoundingClientRect();
        this.$refs.chatGroupReadedBox.open(rect);
      }
    },
    isGroupOwner (userId) {
      return this.group.ownerId == userId;
    },
    isGroupManager (userId) {
      let m = this.groupMembers.find(m => m.userId == userId);
      return m && m.isManager
    },
    onSelectMessage (item, status, type) {
      if (!this.selected) return
      this.checked = status;
      this.$emit('selectMessage', { type: this.checked, item });
      console.log("选择消息", item, this.checked);
    },
    filtrationTime (time) {
      const date = new Date(time);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');

      return `${hours}:${minutes}`;
    },
    activateHighlight () {
      this.innerActive = true;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.innerActive = false;
        this.$emit('cleared');
      }, 800);
    },
    groupMemberInfo (id) {
      return this.groupStore.currentGroupMember.find(m => m.userId == id)
    }
  },
  computed: {
    isFile () {
      if (this.msgInfo.type == this.$enums.MESSAGE_TYPE.FILE) {
        return {
          'position': 'absolute',
          'bottom': '15px',
          'right': '15px'
        }
      } else {
        return {}
      }
    },
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
    isManager () {
      let userId = this.userStore.userInfo.id;
      let m = this.groupMembers.find((m) => m.userId == userId);
      return m && m.isManager;
    },
    isOwner () {
      return this.groupStore.groupInfo.ownerId == this.userStore.userInfo.id
    },
    htmlText () {
      let text;
      if (this.msgInfo.content && this.msgInfo.content !== '') {
        let color = this.msgInfo.selfSend ? 'white' : '';
        text = this.$url.replaceURLWithHTMLLinks(this.msgInfo.content, color)
      }
      return this.$emo.transform(text, 'emoji-normal')
    },
    isFriend () {
      return this.friendStore.isFriend(this.msgInfo.sendId);
    },
  },
  watch: {
    activeSignal (newVal) {
      if (newVal !== this.lastTrigger) {
        this.lastTrigger = newVal; // 标记本次触发值
        this.activateHighlight();
      }
    },
    isSelected (newVal) {
      if (newVal === false) {
        this.checked = false
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
      cursor: pointer;
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
          .message-box {
            min-width: 80px;
            background-color: #fff;
            border-radius: 10px;
            position: relative;
          }
          .message-status {
            position: absolute;
            right: 1px;
            bottom: 0px;
            font-size: 12px !important;
          }
          .box-message {
            padding-bottom: 10px;
            border-radius: 10px;
          }
          .message-text {
            display: inline-block;
            position: relative;
            line-height: 20px;
            padding: 8px;
            background: white;
            border-radius: 10px;
            font-size: var(--im-font-size);
            text-align: left;
            white-space: pre-wrap;
            word-break: break-all;
            // padding-bottom: 10px;
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
            background: #ffffff !important;
            border-radius: 10px;
            .file-box {
              width: 210px;
              display: flex;
              flex-wrap: nowrap;
              align-items: center;
              min-height: 60px;
              box-shadow: var(--im-box-shadow-light);
              border-radius: 4px;
              padding: 10px 15px;
              // background: #3066ec !important;
              .file-info {
                flex: 1;
                height: 100%;
                font-size: 14px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                box-sizing: border-box;
                .file-text {
                  width: 155px;
                  height: 100%;
                  display: flex;
                  flex-direction: column;
                  align-items: flex-start;
                  box-sizing: border-box;
                  .file-text-name {
                    width: 100%;
                    margin: 0;
                    color: #000;
                    overflow: hidden;
                    display: block;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    text-align: left;
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
                  color: #000;
                  margin-top: 10px;
                }
              }

              .file-icon {
                width: 45px;
                height: 45px;
                background-color: #3066ec;
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

          .message-voice {
            height: 60px;
            background-color: #f1f3f4;
            border-radius: 10px;
            audio {
              height: 45px;
              cursor: pointer;
            }
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
            max-width: 400px;
            min-width: 50px;
            display: block;
            margin-top: 3px;
            cursor: pointer;
            padding: 6px;
            border-radius: 4px;
            background-color: #cccccc69;
          }

          .message-status {
            display: block;
            position: absolute;
            bottom: 0px;
            right: 1px;
            .chat-readed {
              font-size: 12px;
              color: #000000;
              display: flex;
              align-items: center;
              justify-content: flex-end;
              line-height: 16px;
              .chat-readed-text {
                // width: 80px;
                display: flex;
                align-items: center;
                justify-content: flex-end;
                // background-color: #0000001f;
                border-radius: 3px;
                padding: 0px 3px 3px 3px;
              }
              .icon {
                width: 15px;
                height: 15px;
                background: url("../../assets/chat/read-icon.png") no-repeat
                  center;
                background-size: 100%;
              }
            }

            .chat-unread {
              font-size: 12px;
              color: #000000;
              display: flex;
              align-items: center;
              justify-content: flex-end;
              .chat-unread-text {
                // width: 80px;
                display: flex;
                align-items: center;
                justify-content: flex-end;
                // background-color: #0000001f;
                border-radius: 3px;
                padding: 0px 3px 3px 3px;
                // margin-top: 4px;
                .icon {
                  width: 15px;
                  height: 15px;
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
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            .message-box {
              min-width: 80px;
              border-radius: 10px;
              position: relative;
            }
            .box-message {
              padding-bottom: 10px;
              background-color: #3066ec;
              border-radius: 10px;
            }
            .chat-readed {
              color: #fff !important;
            }
            .chat-unread {
              color: #fff !important;
            }
            .message-text {
              width: 100%;
              box-sizing: border-box;
              background-color: #3066ec;
              line-height: 20px;
              color: #fff !important;
              text-align: left;
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
              background-color: #3066ec !important;
              flex-direction: row-reverse;
            }
            .download-file {
              background-color: #fff !important;
            }
            .file-icon {
              background-color: #fff !important;
              color: #3066ec !important;
            }
            .file-size,
            .file-text-name {
              color: #fff !important;
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