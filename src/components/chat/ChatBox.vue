<template v-if="chat && msgInfo">
  <div class="chat-box-item"
       @click="onClickChatBox()"
       @mousemove="readedMessage()">
    <el-container>
      <el-header height="38px"
                 style="padding: 0px;"
                 v-if="isSelected">
        <div class="header-selected">
          <div class="header-selected-btn">
            <el-button type="primary"
                       size="medium"
                       @click="messageTranspond">转发</el-button>
            <el-button type="primary"
                       size="medium"
                       @click="delMessage">删除</el-button>
          </div>
          <el-button type="text"
                     @click="onCloseSelected"
                     size="medium">取消</el-button>
        </div>
      </el-header>
      <el-header height="38px"
                 v-else>
        <div class="header-title"
             @click="showFriendInfo"
             v-show="isPrivate">
          <span>{{ title }}</span>
          <span class="last-login"
                v-show="showTime">{{ showTime }}</span>
        </div>
        <div class="header-title"
             @click="showGroupInfo"
             v-show="isGroup">
          <span>{{ title }}</span>
          <span class="last-login">{{`${groupInfo.membersCount}位成员`}}</span>
          <span class="last-login">{{`${groupInfo.onlineCount}位在线`}}</span>
        </div>
        <span title="群聊信息"
              v-if="isGroup"
              class="btn-side el-icon-more"
              @click="onClickMore($event,1)"></span>
        <span title="用户消息"
              v-if="isPrivate"
              class="btn-side el-icon-more"
              @click="onClickMore($event,2)"></span>
      </el-header>
      <el-main style="padding: 0;">
        <el-container>
          <el-container class="content-box">
            <ChatTopAnnouncement v-if="isGroup && group.notice.trim() !== '' && showAnnouncement"
                                 @openAnnouncement="openAnnouncement"
                                 @announcementClose="announcementClose"
                                 style="height: 50px !important;margin-bottom: 5px;line-height: 50px;" />
            <div v-if="isGroup && group.topMessages && group.topMessages.length > 0"
                 class="chat-top-message">
              <chat-top-message :group="group"
                                :groupMembers="groupMembers"
                                :msgInfo="group.topMessage"
                                :showName="showName(group.topMessages)"
                                @locate="locateMessage">
              </chat-top-message>
            </div>
            <el-main class="im-chat-main"
                     id="chatScrollBox"
                     @scroll="onScroll">
              <div class="im-chat-box">
                <div v-for="(msgInfo, idx) in chat.messages"
                     :key="showMinIdx + idx">
                  <chat-message-item v-if="idx >= showMinIdx && (showMaxIdx < 0 || idx < showMaxIdx)"
                                     :id="msgInfo.id"
                                     @call="onCall(msgInfo.type)"
                                     :active="activeMessageIdx === idx"
                                     :activeSignal="activeMessageIdx === idx ? activeSignal : 0"
                                     :mine="msgInfo.sendId === mine.id"
                                     :headImage="headImage(msgInfo)"
                                     :showName="showName(msgInfo)"
                                     :msgInfo="msgInfo"
                                     :chat="chat"
                                     :quoteShowName="showName(msgInfo.quoteMessage)"
                                     :group="group"
                                     :isGroup="isGroup"
                                     :groupMembers="groupMembers"
                                     @openMemberInfo="openMemberInfo"
                                     @locateQuote="onLocateQuoteMessage"
                                     @delete="onDeleteMessage"
                                     @deleteall="onDeleteAllMessage"
                                     @recall="onRecallMessage"
                                     @select="onSelectMessage"
                                     @quote="onQuoteMessage"
                                     @edit="onEditMessage"
                                    @top="onTopMessage"
                                    @at="onAtMessage"
                                    @selectMessage="selectMessage"
                                    @copy="copyMessage"
                                    @transmit="transmitMessage"
                                     @complaint="complaintOpen()"
                                     @cleared="cleared"
                                     :selected="isSelected">
                  </chat-message-item>
                </div>
              </div>
            </el-main>
            <el-footer :height="quoteMessage || editMessage ? '276px' : '220px'"
                       class="im-chat-footer">
              <div v-if="quoteMessage || editMessage"
                   class="quote-message">
                <div class="quote-message-icon"
                     v-if="quoteMessage">
                  <sapn class="icon"></sapn>
                </div>
                <div class="edit-message-icon"
                     v-if="editMessage">
                  <sapn class="icon"></sapn>
                </div>
                <chat-quote-message :showName="showName(quoteMessage || editMessage)"
                                    :msgInfo="quoteMessage || editMessage">
                </chat-quote-message>
                <div class="quote-remove"
                     @click="onRemoveMessage(null)"><i class="el-icon-close"></i></div>
              </div>
              <div class="chat-tool-bar">
                <div class="left">
                  <div title="表情"
                       class="icon iconfont emoji-bar-icon"
                       ref="emotion"
                       @click.stop="showEmotionBox()">
                  </div>
                  <div title="发送图片">
                    <file-upload :action="'/image/upload'"
                                 :maxSize="10 * 1024 * 1024"
                                 :fileTypes="['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif']"
                                 @before="onImageBefore"
                                 @success="onImageSuccess"
                                 @fail="onImageFail">
                      <div class="icon iconfont image-bar-icon"></div>
                    </file-upload>
                  </div>
                  <div title="发送视频">
                    <file-upload :action="'/video/upload'"
                                 :maxSize="50 * 1024 * 1024"
                                 :fileTypes="['video/mp4', 'video/ogg', 'video/webm']"
                                 @before="onVideoBefore"
                                 @success="onVideoSuccess"
                                 @fail="onVideoFail">
                      <div class="icon iconfont video-bar-icon"></div>
                    </file-upload>
                  </div>
                  <div title="发送文件">
                    <file-upload ref="fileUpload"
                                 :action="'/file/upload'"
                                 :maxSize="configStore.sendSize.file"
                                 @before="onFileBefore"
                                 @success="onFileSuccess"
                                 @fail="onFileFail">
                      <div class="icon iconfont file-bar-icon"></div>
                    </file-upload>
                  </div>
                  <div title="发送语音"
                       class="microphone-bar-icon"
                       @click="showRecordBox()">
                  </div>
                  <div title="语音通话"
                       v-show="isPrivate"
                       class="phone-outline-bar-icon"
                       @click="showPrivateVideo('voice')">
                  </div>
                  <div title="语音通话"
                       v-show="isGroup"
                       class="phone-outline-bar-icon"
                       @click="onGroupVideo()">
                  </div>
                  <div title="视频通话"
                       v-show="isPrivate"
                       class="video-camera-bar-icon"
                       @click="showPrivateVideo('video')">
                  </div>
                  <div title="会议"
                       v-show="isGroup"
                       class="meeting-bar-icon"
                       @click="playRtcGroupJoin()">
                  </div>
                  <div title="回执消息"
                       v-show="isGroup"
                       class="icon iconfont icon-receipt"
                       :class="isReceipt ? 'chat-tool-active' : ''"
                       @click="onSwitchReceipt">
                  </div>
                </div>
                <div title="聊天记录"
                     class="record-bar-icon"
                     @click="showHistoryBox()"></div>
              </div>
              <div class="send-content-area"
                   :style="{height: quoteMessage ? '241px' : '185px'}">
                <ChatInput :group="group"
                           ref="chatInputEditor"
                           :group-members="groupMembers"
                           @submit="sendMessage" />
                <div class="send-btn-area">
                  <el-button type="primary"
                             icon="el-icon-s-promotion"
                             @click="notifySend()">发送</el-button>
                </div>
              </div>
            </el-footer>
          </el-container>
          <el-aside class="chat-group-side-box"
                    width="320px"
                    v-if="showSide">
            <chat-group-side :groupId="group.id"
                             :groupMembers="groupMembers"
                             @reload="loadGroup(group.id)">
            </chat-group-side>
          </el-aside>
        </el-container>
      </el-main>
      <emotion ref="emoBox"
               @emotion="onEmotion"></Emotion>
      <chat-record :visible="showRecord"
                   @close="closeRecordBox"
                   @send="onSendRecord"></chat-record>
      <group-member-selector v-if="isGroup"
                             ref="rtcSel"
                             :group="group"
                             @complete="onInviteOk"></group-member-selector>
      <chat-selector ref="chatSel"
                     title="转发消息"></chat-selector>
      <rtc-group-join v-if="isGroup"
                      ref="rtcJoin"
                      :groupId="group.id"></rtc-group-join>
      <chat-history ref="chatHistory"
                    :chat="chat"
                    :friend="friend"
                    :group="group"
                    @locateQuote="locateMessage"
                    :groupMembers="groupMembers"></chat-history>
    </el-container>
    <el-dialog :visible.sync="dialogShow"
               width="450px"
               class="dialog-box-info"
               :before-close="infoModalClose">
      <FriendInfo ref="friendInfoRef"
                  v-if="dialogShow && dialogType === '个人信息'"
                  :userInfo="userInfo"
                  :isFriend="isFriend"
                  :isBanned="isBanned"
                  :friend="friend"
                  :chat="chat"
                  :itemIndex="itemIndex"
                  @openCode="openCode"
                  @updateInfo="updateInfo"
                  @infoClose="infoClose"
                  @openDialog="openDialog" />
      <GroupInfoModal ref="groupInfoModalRef"
                      v-if="dialogShow && dialogType === '群组信息'"
                      :chat="chat"
                      :groupMembers="groupMembers"
                      @openCode="openCode"
                      @updateMembers="updateMembers"
                      @updateInfo="updateInfo"
                      @openDialog="openDialog"
                      @showMemberInfo="showMemberInfo" />
      <GroupMemberModal v-if="dialogShow && dialogType === '群成员'"
                        :chat="chat"
                        :groupInfo="groupInfo"
                        :groupMembers="groupMembers"
                        @showMemberInfo="showMemberInfo"
                        @updateMembers="updateMembers"
                        @returnInfo="returnInfo"
                        @infoClose="infoClose" />
      <GroupMemberInfoModal ref="groupMemberInfoRef"
                            v-if="dialogShow && dialogType === '群成员信息'"
                            :currentEntrance="currentEntrance"
                            @openCode="openCode"
                            @returnInfo="returnInfo"
                            @updateInfo="updateInfo"
                            @infoClose="infoClose"
                            @openDialog="openDialog" />
      <ChatCommonGroup v-if="dialogType === '共同加入的群'"
                       :commonGroupList="commonGroupList"
                       @returnInfo="returnInfo"
                       @infoClose="infoClose" />
      <ComplaintBox v-if="dialogShow && dialogType === '投诉'"
                    @returnInfo="returnInfo"
                    @infoClose="infoClose" />
      <ChatImg v-if="dialogType === '图片'"
               @returnInfo="returnInfo"
               @infoClose="infoClose"
               :currentEntrance="currentEntrance"
               :chat="currentEntrance === '群成员信息' ? groupMemberChat :chat" />
      <ChatFile v-if="dialogType === '文件'"
                @returnInfo="returnInfo"
                @infoClose="infoClose"
                :currentEntrance="currentEntrance"
                :chat="currentEntrance === '群成员信息' ? groupMemberChat :chat" />
      <ChatVideo v-if="dialogType === '视频'"
                 @returnInfo="returnInfo"
                 @infoClose="infoClose"
                 :currentEntrance="currentEntrance"
                 :chat="currentEntrance === '群成员信息' ? groupMemberChat :chat" />
      <Qrcode ref="qrcodeRef"
              v-if="dialogType === '二维码'"
              :currentEntrance="currentEntrance"
              @returnInfo="returnInfo" />
      <div class="delete-all"
           v-if="dialogType === '远程删除'">
        <p>你确定要删除此条消息？</p>
        <el-checkbox v-model="deleteAllCheck">同时为对方删除</el-checkbox>
        <div class="btn-box">
          <el-button @click="deleteAllClose">取消</el-button>
          <el-button type="primary"
                     @click="deleteAllSbm">确定</el-button>
        </div>
      </div>
    </el-dialog>
    <right-menu ref="rightMenu"
                @select="onSelectMenu"></right-menu>
    <GroupAnnouncementModal ref="groupAnnouncementModal"
                            :title="'群公告'"
                            @groupAnnouncementClose="groupAnnouncementClose"
                            @updateInfo="updateInfo" />
  </div>
</template>

<script>
import ChatGroupSide from "./ChatGroupSide.vue";
import ChatMessageItem from "./ChatMessageItem.vue";
import FileUpload from "../common/FileUpload.vue";
import Emotion from "../common/Emotion.vue";
import ChatRecord from "./ChatRecord.vue";
import ChatHistory from "./ChatHistory.vue";
import ChatAtBox from "./ChatAtBox.vue"
import GroupMemberSelector from "../group/GroupMemberSelector.vue"
import ChatSelector from "./ChatSelector.vue";
import RtcGroupJoin from "../rtc/RtcGroupJoin.vue"
import ChatInput from "./ChatInput.vue";
import ChatTopAnnouncement from "./ChatTopAnnouncement.vue";
import ChatQuoteMessage from "./ChatQuoteMessage.vue";
import ChatTopMessage from "./ChatTopMessage.vue";
import FriendInfo from '../friend/FriendInfo.vue'
import ChatCommonGroup from "./ChatCommonGroup.vue";
import ComplaintBox from '@/components/common/ComplaintBox.vue';
import ChatFile from "./ChatFile.vue";
import ChatImg from "./ChatImg.vue";
import ChatVideo from "./ChatVideo.vue";
import RightMenu from '@/components/common/RightMenu.vue';
import GroupInfoModal from "../group/GroupInfoModal.vue";
import GroupMemberModal from "../group/GroupMemberModal.vue";
import GroupMemberInfoModal from "../group/GroupMemberInfoModal.vue";
import Qrcode from '../common/Qrcode.vue'
import GroupAnnouncementModal from "../group/GroupAnnouncementModal.vue";
export default {
  name: "chatPrivate",
  components: {
    ChatInput,
    ChatMessageItem,
    FileUpload,
    ChatGroupSide,
    Emotion,
    ChatRecord,
    ChatHistory,
    ChatAtBox,
    GroupMemberSelector,
    RtcGroupJoin,
    ChatQuoteMessage,
    ChatTopMessage,
    FriendInfo,
    ChatSelector,
    ChatCommonGroup,
    ComplaintBox,
    ChatImg,
    ChatFile,
    ChatVideo,
    RightMenu,
    GroupInfoModal,
    GroupMemberModal,
    GroupMemberInfoModal,
    Qrcode,
    ChatTopAnnouncement,
    GroupAnnouncementModal
  },
  props: {
    chat: {
      type: Object
    },
    itemIndex: {
      type: Number
    },
    showUserInfo: {
      type: Boolean,
      default: false
    },
    showComplaint: {
      type: Boolean,
      default: false
    },
    editRemarkModal: {
      type: Boolean,
      default: false
    },
    updateNotifyExpireTs: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      userInfo: {},
      groupId: null,
      groupMembers: [],
      groupInfo: {},
      sendImageUrl: "",
      sendImageFile: "",
      placeholder: "",
      isReceipt: true, // 是否回执消息
      showRecord: false, // 是否显示语音录制弹窗
      showSide: false, // 是否显示群聊信息栏
      lockMessage: false, // 是否锁定发送，
      showMinIdx: 0, // 下标低于showMinIdx的消息不显示，否则页面会很卡
      showMaxIdx: -1, // 下标大于showMaxIdx的消息不显示，否则可能很卡
      activeMessageIdx: -1, //选择消息idx
      quoteMessage: null, // 被引用的消息
      reqQueue: [], // 等待发送的请求队列
      isSending: false, // 是否正在发
      dialogShow: false,
      editRemarkState: false,
      editMessage: null,// 需要被修改的消息
      isSelected: false,
      selectMessageList: [],
      dialogType: '',
      commonGroupList: [],
      activeSignal: 0,
      deleteAllCheck: false,
      deleteAllObj: {},
      menuItems: [
        {
          key: 'CHAKANGERENXINXI',
          name: '查看个人信息',
          icon: 'el-icon-delete'
        },
        {
          key: 'XIAOXITONGZHI',
          name: '关闭消息通知',
          icon: 'el-icon-delete'
        },
        {
          key: 'BIANJILIANXIREN',
          name: '编辑联系人',
        },
        {
          key: 'SHANCHULIANXIREN',
          name: '删除联系人'
        },
        {
          key: 'BIAOWEIWEIDU',
          name: '标为未读',
          icon: 'el-icon-delete'
        },
        {
          key: 'DELETE',
          name: '删除对话',
          icon: 'el-icon-delete'
        }, {
          key: 'QINGCHU',
          name: '清除历史记录',
          icon: 'el-icon-delete'
        }, {
          key: 'HEIMINGDAN',
          name: '加入黑名单',
          icon: 'el-icon-delete'
        }, {
          key: 'TOUSU',
          name: '投诉',
          icon: 'el-icon-delete'
        },
        // {
        //   key: 'INFO',
        //   name: '查看资料'
        // }
      ],
      groupInfoModalShow: false,
      currentEntrance: '',
      memberInfo: {},
      backModal: '',
      showAnnouncement: true
    }
  },
  methods: {
    announcementClose () {
      this.showAnnouncement = false
    },
    groupAnnouncementClose () {
      console.log('关闭');
    },
    // 打开群公告modal
    openAnnouncement () {
      console.log('666');

      this.$nextTick(() => {
        this.$refs.groupAnnouncementModal.open()
      })
    },
    // 打开二维码
    openCode (id, type) {
      this.dialogType = '二维码'
      this.dialogShow = true
      console.log('打开二维码');
      this.$nextTick(() => {
        this.$refs.qrcodeRef.open(id, type);
      })
    },
    openMemberInfo (member, type) {
      this.dialogType = '群成员信息'
      this.currentEntrance = '群成员信息'
      this.backModal = type
      this.memberInfo = member
      this.dialogShow = true
      this.$nextTick(() => {
        this.$refs.groupMemberInfoRef.open(member)
      })
    },
    showMemberInfo (member, type) {
      this.dialogType = '群成员信息'
      this.currentEntrance = '群成员信息'
      this.backModal = type
      this.memberInfo = member
      this.$nextTick(() => {
        this.$refs.groupMemberInfoRef.open(member)
      })
    },
    updateMembers () {
      this.loadGroup(this.chat.targetId)
    },
    onSelectMenu (item) {
      const isPrivate = this.chat.type === 'PRIVATE';
      console.log(item.key.toLowerCase(), isPrivate, this.groupMembers);
      if (isPrivate) {
        this.$emit(item.key.toLowerCase());
      } else {
        console.log('群聊', this.groupMembers);

        this.$emit(item.key.toLowerCase(), this.groupInfo, this.groupMembers);
      }
    },
    cleared () {
      this.activeMessageIdx = -1
    },
    returnInfo (type) {
      if (type === '群成员信息') {
        this.dialogType = '群成员信息'
        this.$nextTick(() => {
          this.$refs.groupMemberInfoRef.open(this.memberInfo)
        })
      } else {
        if (type === 'GROUP') {
          this.dialogType = this.backModal
          if (this.dialogType === '群组信息') {
            this.$nextTick(() => {
              this.$refs.groupInfoModalRef.open(this.groupInfo)
            })
          }
        } else {
          const isPrivate = this.chat.type === 'PRIVATE';
          if (isPrivate) {
            this.dialogType = '个人信息'
          } else {
            this.dialogType = '群组信息'
            this.$nextTick(() => {
              this.$refs.groupInfoModalRef.open(this.groupInfo)
            })
          }
        }
      }
    },
    returnGroupInfo () {
      this.dialogType = '群组信息'
    },
    openDialog (title, list) {
      console.log('openDialog', this.chat);
      this.commonGroupList = list ? list : []
      this.dialogType = title
    },
    infoClose (type) {
      this.dialogType = ''
      this.currentEntrance = ''
      this.memberInfo = {}
      this.dialogShow = type
      this.$emit('updateInfo', type)
    },
    infoModalClose () {
      this.dialogType = ''
      this.currentEntrance = ''
      this.memberInfo = {}
      this.dialogShow = false
      this.$emit('updateInfo', false)
    },
    updateInfo (state) {
      const isPrivate = this.chat.type === 'PRIVATE';
      if (isPrivate) {
        this.loadFriend(this.chat.targetId)
      } else {
        this.loadGroup(this.chat.targetId)
      }
      this.editRemarkState = state
    },
    handleClose (done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          this.dialogType = ''
          this.loadFriend(this.chat.targetId)
          done();
        })
        .catch(_ => { });
    },
    showGroupInfo () {
      this.dialogType = '群组信息'
      this.editRemarkState = false
      this.dialogShow = true
      console.log('groupInfo', this.groupInfo);
      this.$nextTick(() => {
        this.$refs.groupInfoModalRef.open(this.groupInfo)
      })
    },
    showFriendInfo () {
      this.dialogType = '个人信息'
      this.editRemarkState = false
      this.dialogShow = true
      console.log('userInfo', this.userInfo);
    },
    moveChatToTop () {
      let chatIdx = this.chatStore.findChatIdx(this.chat);
      this.chatStore.sortChats(chatIdx);
    },
    onClickChatBox () {
      // 关闭表情窗口
      this.$refs.emoBox.close();
      // 取消消息选中
      this.activeMessageIdx = -1;
    },
    onCall (type) {
      if (type == this.$enums.MESSAGE_TYPE.ACT_RT_VOICE) {
        this.showPrivateVideo('voice');
      } else if (type == this.$enums.MESSAGE_TYPE.ACT_RT_VIDEO) {
        this.showPrivateVideo('video');
      }
    },
    onSwitchReceipt () {
      this.isReceipt = !this.isReceipt;
      this.refreshPlaceHolder();
    },
    onImageSuccess (data, file) {
      let msgInfo = JSON.parse(JSON.stringify(file.msgInfo));
      msgInfo.content = JSON.stringify(data);
      msgInfo.receipt = this.isReceipt;
      console.log('msgInfo', msgInfo);

      this.sendMessageRequest(msgInfo).then((m) => {
        msgInfo.loadStatus = 'ok';
        msgInfo.id = m.id;
        this.isReceipt = false;
        this.chatStore.insertMessage(msgInfo, file.chat);
      })
    },
    onImageFail (e, file) {
      let msgInfo = JSON.parse(JSON.stringify(file.msgInfo));
      msgInfo.loadStatus = 'fail';
      this.chatStore.insertMessage(msgInfo, file.chat);
    },
    onImageBefore (file) {
      // 被封禁提示
      if (this.isBanned) {
        this.showBannedTip();
        return;
      }
      let url = URL.createObjectURL(file);
      let data = {
        originUrl: url,
        thumbUrl: url
      }

      let msgInfo = {
        clientMsgId: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        id: 0,
        tmpId: this.generateId(),
        fileId: file.uid,
        sendId: this.mine.id,
        content: JSON.stringify(data),
        sendTime: new Date().getTime(),
        selfSend: true,
        type: this.$enums.MESSAGE_TYPE.IMAGE,
        readedCount: 0,
        loadStatus: "loading",
        status: this.$enums.MESSAGE_STATUS.UNSEND
      }
      // 填充对方id
      this.fillTargetId(msgInfo, this.chat.targetId);
      // 插入消息
      this.chatStore.insertMessage(msgInfo, this.chat);
      // 会话置顶
      this.moveChatToTop();
      // 滚动到底部
      this.scrollToBottom();
      // 借助file对象保存
      file.msgInfo = msgInfo;
      file.chat = this.chat;
    },
    onFileSuccess (url, file) {
      console.log('file', file);

      let data = {
        name: file.name,
        size: file.size,
        url: url,
        localPath: file.path
      }
      let msgInfo = JSON.parse(JSON.stringify(file.msgInfo));
      msgInfo.content = JSON.stringify(data);
      msgInfo.receipt = this.isReceipt
      this.sendMessageRequest(msgInfo).then((m) => {
        msgInfo.loadStatus = 'ok';
        msgInfo.isDownload = true;
        msgInfo.id = m.id
        this.isReceipt = false;
        this.refreshPlaceHolder();
        console.log('sendMessageRequest', msgInfo);

        this.chatStore.insertMessage(msgInfo, file.chat);
      })
    },
    onFileFail (e, file) {
      let msgInfo = JSON.parse(JSON.stringify(file.msgInfo));
      msgInfo.loadStatus = 'fail';
      this.chatStore.insertMessage(msgInfo, file.chat);
    },
    onFileBefore (file) {
      console.log(file);

      // 被封禁提示
      if (this.isBanned) {
        this.showBannedTip();
        return;
      }
      let url = URL.createObjectURL(file);
      let data = {
        name: file.name,
        size: file.size,
        url: url,
        localPath: file.path,
      }
      let msgInfo = {
        clientMsgId: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        id: 0,
        tmpId: this.generateId(),
        sendId: this.mine.id,
        content: JSON.stringify(data),
        sendTime: new Date().getTime(),
        selfSend: true,
        type: this.$enums.MESSAGE_TYPE.FILE,
        loadStatus: "loading",
        readedCount: 0,
        status: this.$enums.MESSAGE_STATUS.UNSEND
      }
      // 填充对方id
      this.fillTargetId(msgInfo, this.chat.targetId);
      // 插入消息
      this.chatStore.insertMessage(msgInfo, this.chat);
      // 会话置顶
      this.moveChatToTop();
      // 滚动到底部
      this.scrollToBottom();
      // 借助file对象透传
      file.msgInfo = msgInfo;
      file.chat = this.chat;
    },
    onVideoSuccess (data, file) {
      let msgInfo = JSON.parse(JSON.stringify(file.msgInfo));
      msgInfo.content = JSON.stringify(data);
      msgInfo.receipt = this.isReceipt;
      this.sendMessageRequest(msgInfo).then((m) => {
        msgInfo.loadStatus = 'ok';
        msgInfo.id = m.id;
        this.isReceipt = false;
        this.chatStore.insertMessage(msgInfo, file.chat);
      })
    },
    onVideoFail (e, file) {
      let msgInfo = JSON.parse(JSON.stringify(file.msgInfo));
      msgInfo.loadStatus = 'fail';
      this.chatStore.insertMessage(msgInfo, file.chat);
    },
    onVideoBefore (file) {
      // 检查是否被封禁
      if (this.isBanned) {
        this.showBannedTip();
        return;
      }
      let url = URL.createObjectURL(file);
      let data = {
        videoUrl: url
      }
      let msgInfo = {
        clientMsgId: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        id: 0,
        tmpId: this.generateId(),
        sendId: this.mine.id,
        content: JSON.stringify(data),
        sendTime: new Date().getTime(),
        selfSend: true,
        type: this.$enums.MESSAGE_TYPE.VIDEO,
        loadStatus: "loading",
        readedCount: 0,
        status: this.$enums.MESSAGE_STATUS.UNSEND
      }
      // 填充对方id
      this.fillTargetId(msgInfo, this.chat.targetId);
      // 插入消息
      this.chatStore.insertMessage(msgInfo, this.chat);
      // 会话置顶
      this.moveChatToTop();
      // 滚动到底部
      this.scrollToBottom();
      // 借助file对象透传
      file.msgInfo = msgInfo;
      file.chat = this.chat;
    },
    onClickMore (e, type) {
      if (type == 1) {
        // this.showSide = !this.showSide;
        // if (this.showSide) {
        //   // 刷新一下群和成员信息
        //   this.loadGroup(this.group.id);
        // }
        let groupMenuList = [
          {
            key: 'MESSAGEINFORM',
            name: '关闭消息通知',
            icon: 'el-icon-delete'
          },
          {
            key: 'ADDMEMBER',
            name: '添加成员'
          },
          // {
          //   key: 'SAVEGROUP',
          //   name: '保存到群组'
          // },
          {
            key: 'ISUNREAD',
            name: '标为未读'
          },
          {
            key: 'DELETEGROUP',
            name: '删除并退出'
          },
          {
            key: 'CLEARRECORD',
            name: '清空历史记录'
          },
          {
            key: 'COMPLAINT',
            name: '投诉'
          }
        ]
        if (this.groupInfo.ownerId == this.mine.id) {
          groupMenuList.forEach(item => {
            if (item.key === 'DELETEGROUP') {
              item.name = '解散群组'
              item.icon = 'el-icon-remove-outline'
            }
          })
        }
        if (this.groupInfo.ownerId == this.mine.id || this.isManager) {
          groupMenuList.splice(1, 0, {
            key: 'MANAGEGROUP',
            name: '管理群组',
          });
        }
        if (this.chat.notifyExpireTs) {
          groupMenuList.forEach(item => {
            if (item.key === 'MESSAGEINFORM') {
              item.name = '开启消息通知'
              item.icon = 'el-icon-remove-outline'
            }
          })
        } else {
          this.menuItems.forEach(item => {
            if (item.key === 'MESSAGEINFORM') {
              item.name = '关闭消息通知'
              item.icon = 'el-icon-circle-plus-outline'
            }
          })
        }
        if (this.groupInfo.dissolve || this.groupInfo.quit) {
          const list = [
            {
              key: 'DELETE',
              name: '删除会话',
            },
          ]
          this.$refs.rightMenu.open(e, list);
        } else {
          this.$refs.rightMenu.open(e, groupMenuList);
        }
      } else if (type == 2) {
        if (this.chat.blacklist) {
          this.menuItems.forEach(item => {
            if (item.key === 'HEIMINGDAN') {
              item.name = '移出黑名单'
              item.icon = 'el-icon-remove-outline'
            }
          })
        } else {
          this.menuItems.forEach(item => {
            if (item.key === 'HEIMINGDAN') {
              item.name = '加入黑名单'
              item.icon = 'el-icon-circle-plus-outline'
            }
          })
        }
        if (this.chat.notifyExpireTs) {
          this.menuItems.forEach(item => {
            if (item.key === 'XIAOXITONGZHI') {
              item.name = '开启消息通知'
              item.icon = 'el-icon-remove-outline'
            }
          })
        } else {
          this.menuItems.forEach(item => {
            if (item.key === 'XIAOXITONGZHI') {
              item.name = '关闭消息通知'
              item.icon = 'el-icon-circle-plus-outline'
            }
          })
        }
        this.$refs.rightMenu.open(e, this.menuItems);
      }
    },
    onScroll (e) {
      let scrollElement = e.target
      let scrollTop = scrollElement.scrollTop
      if (scrollTop < 30) { // 在顶部,不滚动的情况
        // 多展示20条信息
        this.showMinIdx = this.showMinIdx > 20 ? this.showMinIdx - 20 : 0;
      }
      // 滚到底部
      if (scrollTop + scrollElement.clientHeight >= scrollElement.scrollHeight - 30) {
        if (this.showMaxIdx > 0) {
          // 多展示20条信息
          this.showMaxIdx += 20;
        }
      }
    },
    showEmotionBox () {
      let width = this.$refs.emotion.offsetWidth;
      let left = this.$elm.fixLeft(this.$refs.emotion);
      let top = this.$elm.fixTop(this.$refs.emotion);
      this.$refs.emoBox.open({
        x: left + width / 2,
        y: top
      })
    },
    onEmotion (emoText) {
      this.$refs.chatInputEditor.insertEmoji(emoText);
    },
    showRecordBox () {
      this.showRecord = true;
    },
    closeRecordBox () {
      this.showRecord = false;
    },
    showPrivateVideo (mode) {
      if (!this.isFriend) {
        this.$message.error("你已不是对方好友,无法呼叫");
        return
      }
      // 检查是否被封禁
      if (this.isBanned) {
        this.showBannedTip();
        return;
      }
      let rtcInfo = {
        mode: mode,
        isHost: true,
        friend: this.friend,
      }
      // 通过home.vue打开单人视频窗口
      this.$eventBus.$emit("openPrivateVideo", rtcInfo);
    },
    playRtcGroupJoin () {
      this.$message.warning("开发中...");
    },
    onGroupVideo () {
      // 检查是否被封禁
      if (this.isBanned) {
        this.showBannedTip();
        return;
      }
      this.$http({
        url: "/webrtc/group/info?groupId=" + this.group.id,
        method: 'GET'
      }).then((rtcInfo) => {
        if (rtcInfo.isChating) {
          // 已在通话中，可以直接加入通话
          this.$refs.rtcJoin.open(rtcInfo);
        } else {
          // 邀请成员发起通话
          let ids = [this.mine.id];
          let maxChannel = this.configStore.webrtc.maxChannel;
          this.$refs.rtcSel.open(maxChannel, ids, ids, []);
        }
      })

    },
    onInviteOk (members) {
      if (members.length < 2) {
        return;
      }
      let userInfos = [];
      members.forEach(m => {
        userInfos.push({
          id: m.userId,
          nickName: m.showNickName,
          headImage: m.headImage,
          isCamera: false,
          isMicroPhone: true
        })
      })
      let rtcInfo = {
        isHost: true,
        groupId: this.group.id,
        inviterId: this.mine.id,
        userInfos: userInfos
      }
      // 通过home.vue打开多人视频窗口
      this.$eventBus.$emit("openGroupVideo", rtcInfo);
    },
    showHistoryBox () {
      this.$refs.chatHistory.open();
    },
    onSendRecord (data) {
      // 检查是否被封禁
      if (this.isBanned) {
        this.showBannedTip();
        return;
      }
      let msgInfo = {
        content: JSON.stringify(data),
        type: 3,
        receipt: this.isReceipt
      }
      // 填充对方id
      this.fillTargetId(msgInfo, this.chat.targetId);
      this.sendMessageRequest(msgInfo).then((m) => {
        m.selfSend = true;
        this.chatStore.insertMessage(m, this.chat);
        // 会话置顶
        this.moveChatToTop();
        // 保持输入框焦点
        this.$refs.chatInputEditor.focus();
        // 滚动到底部
        this.scrollToBottom();
        // 关闭录音窗口
        this.showRecord = false;
        this.isReceipt = false;
        this.refreshPlaceHolder();
      })
    },
    fillTargetId (msgInfo, targetId) {
      if (this.isGroup) {
        msgInfo.groupId = targetId;
      } else {
        msgInfo.recvId = targetId;
      }
    },
    notifySend () {
      this.$refs.chatInputEditor.submit();
    },
    async sendMessage (fullList) {
      this.resetEditor();
      this.readedMessage();
      // 检查是否被封禁
      if (this.isBanned) {
        this.showBannedTip();
        return;
      }
      let sendText = this.isReceipt ? "【回执消息】" : "";
      for (let i = 0; i < fullList.length; i++) {
        let msg = fullList[i];
        switch (msg.type) {
          case "text":
            await this.sendTextMessage(sendText + msg.content, msg.atUserIds);
            break;
          case "image":
            await this.sendImageMessage(msg.content.file);
            break;
          case "file":
            await this.sendFileMessage(msg.content.file);
            break;
        }
      }
    },
    sendImageMessage (file) {
      return new Promise((resolve, reject) => {
        this.onImageBefore(file);
        let formData = new FormData()
        formData.append('file', file)
        this.$http.post("/image/upload", formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then((data) => {
          this.onImageSuccess(data, file);
          resolve();
        }).catch((res) => {
          this.onImageFail(res, file);
          reject();
        })
        this.$nextTick(() => this.$refs.chatInputEditor.focus());
        this.scrollToBottom();
      });
    },
    sendTextMessage (sendText, atUserIds) {
      return new Promise((resolve, reject) => {
        if (!sendText.trim()) {
          reject();
        }
        let msgInfo = {
          content: sendText,
          type: 0
        }
        // 填充对方id
        this.fillTargetId(msgInfo, this.chat.targetId);
        // 被@人员列表
        if (this.isGroup) {
          msgInfo.atUserIds = atUserIds;
          msgInfo.receipt = this.isReceipt;
        }
        // 引用消息
        if (this.quoteMessage) {
          msgInfo.quoteMessageId = this.quoteMessage.id
        }
        // 修改消息
        if (this.editMessage) {
          msgInfo.quoteMessageId = this.editMessage.id
        }
        this.lockMessage = true;
        this.sendMessageRequest(msgInfo).then((m) => {
          m.selfSend = true;
          this.chatStore.insertMessage(m, this.chat);
          // 会话置顶
          this.moveChatToTop();
        }).finally(() => {
          // 解除锁定
          this.scrollToBottom();
          this.isReceipt = false;
          this.quoteMessage = null;
          this.editMessage = null;
          resolve();
        });
      });
    },
    // 发送文件消息
    sendFileMessage (file) {
      return new Promise((resolve, reject) => {
        let check = this.$refs.fileUpload.beforeUpload(file);
        if (check) {
          this.$refs.fileUpload.onFileUpload({ file });
        }
      })
    },
    // 删除消息
    onDeleteMessage (msgInfo) {
      this.$confirm('确认删除消息?', '删除消息', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.chatStore.deleteMessage(msgInfo, this.chat);
      });
    },
    // 删除远程消息
    onDeleteAllMessage (msgInfo) {
      this.deleteAllObj = msgInfo
      this.dialogType = '远程删除'
      this.dialogShow = true
    },
    deleteAllClose () {
      this.dialogType = ''
      this.dialogShow = false
    },
    deleteAllSbm () {
      let data = {
        peerId: this.chat.targetId,
        ids: [this.deleteAllObj.id],
        action: 'DELETE',
        deleteBoth: this.deleteAllCheck
      }
      this.$http({
        url: `/message/private/operate`,
        method: 'post',
        data
      }).then(() => {
        this.chatStore.deleteMessage(this.deleteAllObj, this.chat);
        this.deleteAllObj = {}
        this.deleteAllCheck = false
        this.$message.success('删除成功');
        this.deleteAllClose()
      });
    },
    // 复制消息
    copyMessage (msgInfo) {
      const textarea = document.createElement('textarea');
      textarea.value = JSON.parse(JSON.stringify(msgInfo.content));
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();

      const success = document.execCommand('copy');
      document.body.removeChild(textarea);

      if (success) {
        this.$message?.success('复制成功');
      } else {
        this.$message?.error('复制失败');
      }
    },
    // 转发消息
    transmitMessage (msgInfo) {
      this.$refs.chatSel.open(chats => {
        // 逐个会话发送消息
        let idx = 0;
        chats.forEach(chat => {
          let message = {
            content: JSON.stringify(msgInfo),
            type: this.$enums.MESSAGE_TYPE.FORWARD
          }

          if (chat.type == 'GROUP') {
            message.groupId = chat.targetId
          } else {
            message.recvId = chat.targetId;
          }
          this.$http({
            url: `/message/${chat.type.toLowerCase()}/send`,
            method: 'post',
            data: message
          }).then((m) => {
            m.selfSend = true;
            this.chatStore.openChat(chat);
            this.chatStore.insertMessage(m, chat);
            if (++idx == chats.length) {
              this.$message.success("转发成功")
            }
          })
        })
      });
    },
    complaintOpen () {
      this.dialogType = '投诉';
      this.dialogShow = true;
    },
    // 取消选择
    onCloseSelected () {
      this.selectMessageList = []
      this.isSelected = false;
    },
    // 选择消息
    onSelectMessage (msgInfo) {
      if (msgInfo) {
        this.isSelected = true
      }
    },
    selectMessage (msgInfo) {
      const item = msgInfo.item;
      const type = msgInfo.type;
      // 添加
      if (type === true) {
        // 判断是否已存在（通过 id 判断）
        const exists = this.selectMessageList.some(msg => msg.id === item.id);
        if (!exists) {
          this.selectMessageList.push(item);
        }
      }
      // 移除
      else {
        this.selectMessageList = this.selectMessageList.filter(msg => msg.id !== item.id);
      }
      console.log('当前已选消息列表:', this.selectMessageList);
    },
    // 转发按钮
    messageTranspond () {
      if (!this.selectMessageList.length) {
        return
      }
      const msgs = this.selectMessageList
      this.$refs.chatSel.open(chats => {
        // 需要发送的总次数 = 选择的会话数 * 消息数
        let finish = 0
        const total = chats.length * msgs.length
        chats.forEach(chat => {
          msgs.forEach(msgInfo => {
            const message = {
              content: JSON.stringify(msgInfo),
              type: this.$enums.MESSAGE_TYPE.FORWARD
            }
            if (chat.type == 'GROUP') {
              message.groupId = chat.targetId
            } else {
              message.recvId = chat.targetId
            }
            this.$http({
              url: `/message/${chat.type.toLowerCase()}/send`,
              method: 'post',
              data: message
            }).then((m) => {
              m.selfSend = true
              this.chatStore.openChat(chat)
              this.chatStore.insertMessage(m, chat)
              if (++finish === total) {
                this.onCloseSelected()
                this.$message.success('转发成功')
              }
            })
          })
        })
      })
    },
    // 多选删除消息
    delMessage () {
      if (!this.selectMessageList.length) {
        return
      }
      const msgs = this.selectMessageList
      console.log(msgs);

    },
    // 撤回消息
    onRecallMessage (msgInfo) {
      this.$confirm('确认撤回消息?', '撤回消息', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let url = `/message/${this.chat.type.toLowerCase()}/recall/${msgInfo.id}`
        this.$http({
          url: url,
          method: 'delete'
        }).then((m) => {
          this.$message.success("消息已撤回");
          m.selfSend = true;
          this.chatStore.recallMessage([m, this.chat]);
        })
      });
    },
    onRemoveMessage (msgInfo) {
      this.onQuoteMessage(msgInfo)
      this.onEditMessage(msgInfo)
    },
    // 引用消息
    onQuoteMessage (msgInfo) {
      this.editMessage = null
      this.quoteMessage = msgInfo;
    },
    // 编辑消息
    onEditMessage (msgInfo) {
      this.quoteMessage = null
      this.editMessage = msgInfo
    },
    // 置顶消息
    onTopMessage (msgInfo) {
      if (!msgInfo.id) {
        this.$message.warning("请等待该消息发送成功后操作");
        return;
      }
      this.$http({
        url: `/group/setTopMessage/${msgInfo.groupId}?messageId=${msgInfo.id}`,
        method: 'post'
      }).then(() => { })
    },
    onAtMessage (msgInfo) {
      if (!this.isGroup) {
        return
      }
      const member = this.groupMembers.find(m => m.userId == msgInfo.sendId)
      if (member) {
        this.$refs.chatInputEditor.insertAtMember(member)
      }
    },
    onLocateQuoteMessage (msgInfo) {
      this.locateMessage(msgInfo.quoteMessage);
    },
    locateMessage (msgInfo) {
      // 寻找消息位置
      const idx = this.findMessageIdx(msgInfo);
      console.log(idx);

      if (idx < 0) {
        this.$message.error("无法定位原消息");
        return;
      }
      console.log(this.showMinIdx);

      // 要定位到消息，首先要渲染这条消息
      if (this.showMinIdx > idx) {
        this.showMinIdx = Math.min(this.showMinIdx, Math.max(idx - 10, 0));
        this.showMaxIdx = this.showMinIdx + 20;
      }
      this.$nextTick(() => {
        document.getElementById(msgInfo.id).scrollIntoView({ behavior: 'smooth' });
        this.activeMessageIdx = idx;
        this.activeSignal = Date.now();
      })
      this.$refs.chatHistory.close();
    },
    resetShowMessages () {
      // 初始状态仅渲染最后30条数据
      this.showMinIdx = this.messageSize > 30 ? this.messageSize - 30 : 0;
      this.showMaxIdx = -1;
    },
    findMessageIdx (msgInfo) {
      for (let idx in this.chat.messages) {
        const message = this.chat.messages[idx];
        // 通过id判断
        if (msgInfo.id && message.id && message.id == msgInfo.id) {
          return idx;
        }
        // 正在发送中的消息可能没有id,只有tmpId
        if (msgInfo.tmpId && message.tmpId && message.tmpId == msgInfo.tmpId) {
          return idx;
        }
      }
      return -1;
    },
    readedMessage () {
      if (this.chat.unreadCount == 0) {
        return;
      }
      this.chatStore.resetUnreadCount(this.chat)
      if (this.isGroup) {
        var url = `/message/group/readed?groupId=${this.chat.targetId}`
      } else {
        url = `/message/private/readed?friendId=${this.chat.targetId}`
      }
      this.$http({
        url: url,
        method: 'put'
      }).then(() => { })
    },
    loadReaded (fId) {
      this.$http({
        url: `/message/private/maxReadedId?friendId=${fId}`,
        method: 'get'
      }).then((id) => {
        this.chatStore.readedMessage({
          friendId: fId,
          maxId: id
        });
      });
    },
    loadGroup (groupId) {
      this.groupId = groupId;
      this.$http({
        url: `/group/find/${groupId}`,
        method: 'get'
      }).then((group) => {
        this.$emit('updateGroupInfo', group)
        this.groupInfo = group
        this.groupStore.setGroupInfo(group)
        this.chatStore.updateChatFromGroup(group);
        this.chatStore.addNotify(group.id, group.notifyExpireTs)
        this.groupStore.updateGroup(group);
      });
      this.$http({
        url: `/group/members/${groupId}`,
        method: 'get'
      }).then((groupMembers) => {
        this.$emit('updateGroupMembers', groupMembers)
        this.groupStore.setCurrentGroupMember(groupMembers);
        this.groupMembers = groupMembers;
        groupMembers.forEach((member) => {
          // 群主权限
          if (this.mine.id == this.groupInfo.ownerId && member.userId == this.mine.id) {
            this.groupStore.setGroupPermission(member);
          }
          // 管理员权限
          if (this.mine.id != this.groupInfo.ownerId && member.isManager) {
            this.groupStore.setGroupPermission(member);
          }
        });
      });
    },
    updateFriendInfo () {
      if (this.isFriend) {
        // store的数据不能直接修改，深拷贝一份store的数据
        let friend = JSON.parse(JSON.stringify(this.friend));
        friend.headImage = this.userInfo.headImageThumb;
        friend.nickName = this.userInfo.nickName;
        friend.showNickName = this.userInfo.remarkNickName ? this.userInfo.remarkNickName : this.userInfo.nickName;
        this.chatStore.updateChatFromFriend(friend);
        this.friendStore.updateFriend(friend);
      } else {
        this.chatStore.updateChatFromUser(this.userInfo);
      }
    },
    loadFriend (friendId) {
      // 获取好友信息
      this.$http({
        url: `/friend/find/${friendId}`,
        method: 'GET'
      }).then((userInfo) => {
        this.friendStore.setFriendInfo(userInfo)
        this.userInfo = userInfo;
        this.chatStore.addNotify(userInfo.id, userInfo.notifyExpireTs)
        this.updateFriendInfo();
      })
    },
    showName (msgInfo) {
      if (!msgInfo) {
        return ""
      }
      if (this.isGroup) {
        let member = this.groupMembers.find((m) => m.userId == msgInfo.sendId);
        return member ? member.showNickName : msgInfo.sendNickName || "";
      } else {
        if (msgInfo.sendId == this.mine.id) {
          return this.mine.nickName;
        }
        if (msgInfo.sendId == this.chat.targetId) {
          return this.chat.showName;
        }
        return msgInfo.selfSend ? this.mine.nickName : this.chat.showName
      }
    },
    headImage (msgInfo) {
      // console.log(msgInfo);
      if (msgInfo) {
        if (this.isGroup) {
          let member = this.groupMembers.find((m) => m.userId == msgInfo.sendId);
          return member ? member.headImage : "";
        } else {
          return msgInfo.selfSend ? this.mine.headImageThumb : this.chat.headImage
        }
      }
    },
    onAtMember (member) {
      if (!this.isGroup) {
        return
      }
      this.$refs.chatInputEditor.insertAtMember(member)
    },
    resetEditor () {
      this.$nextTick(() => {
        this.$refs.chatInputEditor.clear();
        this.$refs.chatInputEditor.focus();
      });
    },
    scrollToBottom () {
      this.resetShowMessages();
      this.$nextTick(() => {
        let div = document.getElementById("chatScrollBox");
        div.scrollTop = div.scrollHeight;
      });
    },
    refreshPlaceHolder () {
      if (this.isReceipt) {
        this.placeholder = "【回执消息】"
      } else if (this.$refs.editBox && this.$refs.editBox.innerHTML) {
        this.placeholder = ""
      } else {
        this.placeholder = "聊点什么吧~";
      }
    },
    sendMessageRequest (msgInfo) {
      return new Promise((resolve, reject) => {
        // 请求入队列，防止请求"后发先至"，导致消息错序
        this.reqQueue.push({ msgInfo, resolve, reject });
        this.processReqQueue();
      })
    },
    processReqQueue () {
      if (this.reqQueue.length && !this.isSending) {
        this.isSending = true;
        const reqData = this.reqQueue.shift();
        console.log('processReqQueue', reqData);

        this.$http({
          url: this.editMessage ? `/message/private/edit` : this.messageAction,
          method: this.editMessage ? 'put' : 'post',
          data: reqData.msgInfo
        }).then((res) => {
          reqData.resolve(res)
        }).catch((e) => {
          reqData.reject(e)
        }).finally(() => {
          this.isSending = false;
          // 发送下一条请求
          this.processReqQueue();
        })
      }
    },
    showBannedTip () {
      let msgInfo = {
        tmpId: this.generateId(),
        sendId: this.mine.id,
        sendTime: new Date().getTime(),
        type: this.$enums.MESSAGE_TYPE.TIP_TEXT
      }
      if (this.chat.type == "PRIVATE") {
        msgInfo.recvId = this.mine.id
        msgInfo.content = "该用户已被管理员封禁,原因:" + this.userInfo.reason
      } else {
        msgInfo.groupId = this.group.id;
        msgInfo.content = "本群聊已被管理员封禁,原因:" + this.group.reason
      }
      this.chatStore.insertMessage(msgInfo, this.chat);
    },
    generateId () {
      // 生成临时id
      return String(new Date().getTime()) + String(Math.floor(Math.random() * 1000));
    }
  },
  computed: {
    mine () {
      return this.userStore.userInfo;
    },
    friend () {
      return this.friendStore.findFriend(this.userInfo.id)
    },
    showTime () {
      return this.userInfo.online ? '在线' : this.$date.toTimeText(this.userInfo.lastLoginTime, true, true);
    },
    isFriend () {
      console.log('isFriend', this.friendStore.isFriend(this.userInfo.id));

      return this.friendStore.isFriend(this.userInfo.id);
    },
    group () {
      return this.groupStore.findGroup(this.groupId)
    },
    title () {
      return this.chat.showName;
    },
    groupPeopleCount () {
      return `${this.groupMembers.filter(m => !m.quit).length}位成员`;
    },
    messageAction () {
      return `/message/${this.chat.type.toLowerCase()}/send`;
    },
    unreadCount () {
      return this.chat.unreadCount;
    },
    messageSize () {
      if (!this.chat || !this.chat.messages) {
        return 0;
      }
      return this.chat.messages.length;
    },
    isBanned () {
      return (this.isPrivate && this.userInfo.isBanned) ||
        (this.isGroup && this.group.isBanned)
    },
    isGroup () {
      return this.chat.type == 'GROUP';
    },
    isPrivate () {
      return this.chat.type == 'PRIVATE';
    },
    userInfoData () {
      return this.friendStore.friendInfo
    },
    groupMemberChat () {
      return this.chatStore.groupMemberChat
    },
    isManager () {
      let m = this.groupMembers.find((m) => m.userId == this.mine.id);
      return m && m.isManager;
    },
  },
  watch: {
    updateNotifyExpireTs: {
      handler (value) {
        console.log('updateNotifyExpireTs', value);

        if (value !== null && value !== undefined) {
          const isPrivate = this.chat.type === 'PRIVATE';
          isPrivate ? this.loadFriend(this.chat.targetId) : this.loadGroup(this.chat.targetId)
        }
      }, immediate: true
    },
    chat: {
      handler (newChat, oldChat) {
        const isChanged = !oldChat ||
          newChat.type !== oldChat.type ||
          newChat.targetId !== oldChat.targetId;

        // 非法会话不处理
        if (!newChat?.targetId || !isChanged) return;

        // 加载新会话相关信息
        if (this.isGroup) {
          this.loadGroup(newChat.targetId);
        } else {
          this.loadFriend(newChat.targetId);
          this.loadReaded(newChat.targetId);
        }

        // UI状态重置
        this.scrollToBottom();
        this.showSide = false;
        this.readedMessage();
        this.resetShowMessages();
        this.resetEditor();
        this.isReceipt = false;
        this.quoteMessage = null;
        this.editMessage = null;
        this.refreshPlaceHolder();
      },
      immediate: true
    },
    messageSize: {
      handler (newSize, oldSize) {
        if (newSize > oldSize) {
          // 收到普通消息,则滚动至底部
          let lastMessage = this.chat.messages[newSize - 1];
          if (lastMessage && this.$msgType.isNormal(lastMessage.type)) {
            this.scrollToBottom();
          }
        }
      }
    },
    editRemarkState: {
      handler (value) {
        if (value) {
          const isPrivate = this.chat.type === 'PRIVATE';
          isPrivate ? this.loadFriend(this.chat.targetId) : this.loadGroup(this.chat.targetId)
        }
      }
    },
    showUserInfo: {
      handler (value) {
        if (value) {
          this.editRemarkState = false
          this.dialogShow = true
          this.dialogType = '个人信息'
        }
      }
    },
    showComplaint: {
      handler (value) {
        if (value) {
          this.editRemarkState = false
          this.dialogShow = true
          this.dialogType = '投诉'
        }
      }
    },
    editRemarkModal: {
      handler (value) {
        if (value) {
          this.editRemarkState = false
          this.dialogShow = true
          this.dialogType = '个人信息'

          this.$nextTick(() => {
            this.$refs.friendInfoRef.editRemark()
          })
        }
      }
    }
  },
  mounted () {
    let div = document.getElementById("chatScrollBox");
    div.addEventListener('scroll', this.onScroll)
    this.$eventBus.$on('atMember', this.onAtMember)
  },
  beforeDestroy () {
    let div = document.getElementById("chatScrollBox");
    if (div) {
      div.removeEventListener('scroll', this.onScroll)
    }
    this.$eventBus.$off('atMember', this.onAtMember)
  }
}
</script>

<style lang="scss">
  .chat-box-item {
    position: relative;
    width: 100%;
    height: 100%;
    // background: linear-gradient(
    //   270deg,
    //   #ffffff 0%,
    //   rgba(224, 232, 251, 0.5) 100%
    // );

    .el-header {
      width: 100%;
      display: flex;
      justify-content: space-between;
      padding: 0px 12px;
      line-height: 50px;
      box-sizing: border-box;
      font-size: var(--im-font-size-larger);
      border-bottom: var(--im-border);
      .header-selected {
        width: 100%;
        height: 100%;
        padding: 0 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .header-selected-btn {
          display: flex;
          align-items: center;
        }
      }
      .header-title {
        display: flex;
        flex-direction: row;
        font-size: 16px;
        align-items: flex-end;
        justify-content: flex-start;
        font-size: 18px;
        cursor: pointer;
      }
      .last-login {
        font-size: 12px;
        color: #999999;
        display: flex;
        margin-left: 10px;
        line-height: 45px;
      }
      .btn-side {
        position: absolute;
        right: 20px;
        line-height: 50px;
        font-size: 20px;
        cursor: pointer;
        color: var(--im-text-color-light);
      }
    }

    .im-chat-main {
      padding: 0 10px;
      background-color: #ffffff00;
    }

    .im-chat-footer {
      display: flex;
      flex-direction: column;
      padding: 0;
      .quote-message-icon {
        width: 40px;
        height: 40px;
        margin-right: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        .icon {
          width: 30px;
          height: 30px;
          background: url("../../assets/chat/message_reply-icon.png") no-repeat
            center;
          background-size: 100%;
        }
      }
      .edit-message-icon {
        width: 40px;
        height: 40px;
        margin-right: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        .icon {
          width: 30px;
          height: 30px;
          background: url("../../assets/chat/edit-message-icon.png") no-repeat
            center;
          background-size: 100%;
        }
      }
      .quote-message {
        width: 100%;
        padding: 5px 5px;
        position: relative;
        display: flex;
        align-items: center;
        border-top: var(--im-border);
        box-shadow: 0px -3px 4px #ebeef5;
        box-sizing: border-box;
        &:hover .quote-remove {
          display: block;
        }

        .quote-remove {
          position: absolute;
          top: 19px;
          right: 40px;
          width: 15px;
          height: 15px;
          line-height: 15px;
          font-size: 10px;
          color: white;
          border-radius: 50%;
          background: #aaa;
          cursor: pointer;

          &:hover {
            background: #888;
          }
        }
      }
      .chat-tool-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        width: 100%;
        height: 36px;
        text-align: left;
        box-sizing: border-box;
        border-top: var(--im-border);
        padding: 4px 2px 2px 8px;
        .left {
          width: calc(100% - 32px);
          height: 100%;
          display: flex;
          align-items: center;
          > div {
            font-size: 22px;
            display: flex;
            align-items: center;
            justify-content: start;
            width: 22px;
            height: 22px;
            border-radius: 2px;
            margin-right: 10px;
            color: #999;
            transition: 0.3s;

            &.chat-tool-active {
              font-weight: 600;
              color: var(--im-color-primary);
              background-color: #ddd;
            }
          }
        }
        .emoji-bar-icon {
          background: url("~@/assets/chat/emoji-bar-icon.png") no-repeat center;
          background-size: 100%;
        }
        .emoji-bar-icon:hover {
          background: url("~@/assets/chat/emoji-bar-hover-icon.png") no-repeat
            center;
          background-size: 100%;
        }
        .microphone-bar-icon {
          width: 20px;
          height: 22px;
          background: url("~@/assets/chat/microphone-bar-icon.png") no-repeat
            center;
          background-size: 100%;
        }
        .file-bar-icon,
        .video-bar-icon,
        .image-bar-icon {
          font-size: 22px;
          cursor: pointer;
          line-height: 22px;
          width: 22px;
          height: 22px;
          text-align: center;
          border-radius: 2px;
          margin-right: 10px;
          color: #999;
          transition: 0.3s;
          background: url("~@/assets/chat/image-bar-icon.png") no-repeat center;
          background-size: 100%;
        }
        .image-bar-icon:hover {
          background: url("~@/assets/chat/image-bar-hover-icon.png") no-repeat
            center;
          background-size: 100%;
        }
        .video-bar-icon {
          background: url("~@/assets/chat/video-bar-icon.png") no-repeat center;
          background-size: 100%;
        }
        .video-bar-icon:hover {
          background: url("~@/assets/chat/video-bar-hover-icon.png") no-repeat
            center;
          background-size: 100%;
        }
        .file-bar-icon {
          background: url("~@/assets/chat/file-bar-icon.png") no-repeat center;
          background-size: 100%;
        }
        .microphone-bar-icon {
          background: url("~@/assets/chat/microphone-bar-icon.png") no-repeat
            center;
          background-size: 100% 100%;
        }
        .microphone-bar-icon:hover {
          background: url("~@/assets/chat/microphone-bar-hover-icon.png")
            no-repeat center;
          background-size: 100% 100%;
        }
        .file-bar-icon:hover {
          background: url("~@/assets/chat/file-bar-hover-icon.png") no-repeat
            center;
          background-size: 100%;
        }
        .phone-outline-bar-icon {
          background: url("~@/assets/chat/phone-outline-bar-icon.png") no-repeat
            center;
          background-size: 100%;
        }
        .phone-outline-bar-icon:hover {
          background: url("~@/assets/chat/phone-outline-bar-hover-icon.png")
            no-repeat center;
          background-size: 100%;
        }
        .video-camera-bar-icon {
          background: url("~@/assets/chat/video-camera-bar-icon.png") no-repeat
            center;
          background-size: 100%;
        }
        .video-camera-bar-icon:hover {
          background: url("~@/assets/chat/video-camera-bar-hover-icon.png")
            no-repeat center;
          background-size: 100%;
        }
        .meeting-bar-icon {
          background: url("~@/assets/chat/meeting-bar-icon.png") no-repeat center;
          background-size: 100%;
        }
        .meeting-bar-icon:hover {
          background: url("~@/assets/chat/meeting-bar-hover-icon.png") no-repeat
            center;
          background-size: 100%;
        }
        .record-bar-icon {
          font-size: 22px;
          cursor: pointer;
          line-height: 22px;
          width: 22px;
          height: 22px;
          text-align: center;
          border-radius: 2px;
          margin-right: 10px;
          color: #999;
          transition: 0.3s;
          background: url("~@/assets/chat/record-bar-icon.png") no-repeat center;
          background-size: 100%;
        }
        .record-bar-icon:hover {
          background: url("~@/assets/chat/record-bar-hover-icon.png") no-repeat
            center;
          background-size: 100%;
        }
      }

      .send-content-area {
        position: relative;
        display: flex;
        flex-direction: column;
        height: 100%;
        background-color: rgba(255, 255, 255, 0) !important;

        .send-btn-area {
          padding: 10px;
          position: absolute;
          bottom: 4px;
          right: 6px;
        }
      }
    }

    .chat-group-side-box {
      border-left: var(--im-border);
    }
  }
  .dialog-box-info {
    .el-dialog__body {
      padding: 10px 0px !important;
    }
  }
  .el-dialog {
    border-radius: 15px;
  }
  .delete-all {
    width: 100%;
    height: 150px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px 20px;
    box-sizing: border-box;
    p {
      font-size: 18px;
    }
  }
  .btn-box {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
  .content-box {
    width: 100%;
  }
</style>
