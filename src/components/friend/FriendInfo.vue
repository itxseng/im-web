<template>
  <div class="friend-info">
    <div class="title">
      <span>个人信息</span>
      <div class="title-icon">
        <span class="title-icon-phone"
              @click="showPrivateVideo('voice')"></span>
        <span class="title-icon-video"
              @click="showPrivateVideo('video')"></span>
      </div>
    </div>
    <div class="info">
      <div class="info-left">
        <div class="info-left-img">
          <img :src="userInfo.headImage"
               alt="">
        </div>
        <div class="info-left-text">
          <p>{{ userInfo.nickName }}</p>
          <p>{{userInfo.online ? '当前在线' : '已离线'}}</p>
          <p>来源：账号添加</p>
        </div>
      </div>
      <div class="info-right">
        <span class="info-right-icon"
              title="编辑备注"
              @click="editRemark"></span>
      </div>
    </div>
    <div class="content">
      <ul>
        <li @click="onCloseModal">
          <span class="icon linkman-icon"></span>
          <span class="text text-color">联系人</span>
        </li>
        <li @click="onSendCard">
          <span class="icon share-icon"></span>
          <span class="text text-color">分享名片</span>
        </li>
        <li>
          <div class="left">
            <span class="icon inform-icon"></span>
            <span class="text">消息通知</span>
          </div>
          <span class="right">
            <el-switch :value="message"
                       @change="onSwitchMessageChange"
                       active-color="#99B6FF"
                       inactive-color="#B1B1B1">
            </el-switch>
          </span>
        </li>
        <li @click="openModal('图片')" v-if="imageAmount > 0">
          <span class="icon image-icon"></span>
          <span class="text">{{ imageAmount }}张图片</span>
        </li>
        <li @click="openModal('视频')" v-if="videoAmount > 0">
          <span class="icon video-icon"></span>
          <span class="text">{{ videoAmount }}个视频</span>
        </li>
        <li @click="openModal('文件')" v-if="fileAmount > 0">
          <span class="icon files-icon"></span>
          <span class="text">{{ fileAmount }}个文件</span>
        </li>
        <li @click="openModal('共同加入的群', commonGroupList)">
          <span class="icon group_chat-icon"></span>
          <span class="text">{{ commonGroupList.length }}个共同加入的群聊</span>
        </li>
        <li>
          <div class="left"
               @click="setStarFriend">
            <span class="icon star-icon"></span>
            <span class="text">设为星标朋友</span>
          </div>
          <span class="right">
            <el-switch v-model="star"
                       @change="starChange"
                       active-color="#99B6FF"
                       inactive-color="#B1B1B1">
            </el-switch>
          </span>
        </li>
        <li>
          <div class="left">
            <span class="icon blacklist-icon"></span>
            <span class="text">加入黑名单</span>
          </div>
          <span class="right">
            <el-switch v-model="blacklist"
                       @change="blacklistChange"
                       active-color="#99B6FF"
                       inactive-color="#B1B1B1">
            </el-switch>
          </span>
        </li>
        <li @click="openModal('投诉')">
          <span class="icon complaint-icon"></span>
          <span class="text">投诉</span>
        </li>
        <li @click="onDelItem">
          <span class="icon delete_chat-icon"></span>
          <span class="text">删除会话</span>
        </li>
        <li @click="onDelFriend">
          <span class="icon delete_linkman-icon"></span>
          <span class="text">删除联系人</span>
        </li>
      </ul>
    </div>
    <el-dialog append-to-body
               v-model="editRemarkModal"
               width="25%"
               :before-close="handleClose">
      <div class="edit-remark-modal-content">
        <p>编辑备注</p>
        <el-input v-model="editRemarkValue"
                  clearable
                  placeholder="请输入备注"
                  @keyup.enter="editRemarkSubmit"></el-input>
      </div>
      <template #footer>
      <span class="dialog-footer">
      </span>
      </template>
    </el-dialog>
    <div class="popover-box"
         v-if="popoverShow"
         @click.stop="popoverClose">
      <el-popover placement="bottom"
                  trigger="manual"
                  v-model="messageSelectShow">
        <div class="message-list"
             v-for="(item, index) in messageSelectList"
             :key="index"
             @click.stop="messageSelectItem(item.value)">
          <p>{{ item.label }}</p>
        </div>
        <div class="message-slider"
             v-if="sliderShow"
             @click.stop>
          <div class="slider-tips">
            <span class="first-time">
              1小时
            </span>
            <span class="last-time">
              7天
            </span>
          </div>
          <el-slider :min="1"
                     :max="168"
                     v-model="messageInformTime"
                     :show-tooltip="false"
                     @input="updateDisplay"></el-slider>
          <p>{{ timeDisplay }}</p>
          <div class="message-slider-ok"
               @click.stop="messageSliderOk">确定</div>
        </div>
      </el-popover>
    </div>
    <chat-selector ref="chatSel"
                   title="分享名片"
                   :appendToBody="true"></chat-selector>
  </div>
</template>
<script>
import ChatSelector from '../chat/ChatSelector.vue'
export default {
  components: { ChatSelector },
  props: {
    userInfo: {
      type: Object,
      default: function () {
        return {}
      }
    },
    friend: {
      type: Object,
      default: function () {
        return {}
      }
    },
    isFriend: {
      type: Boolean,
      default: false
    },
    isBanned: {
      type: Boolean,
      default: false
    },
    itemIndex: {
      type: Number
    },
    chat: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  data () {
    return {
      message: false,
      star: false,
      blacklist: false,
      editRemarkModal: false,
      editRemarkValue: '',
      messageSelectShow: false,
      messageSelect: '',
      messageSelectValue: '',
      messageSelectList: [
        {
          value: '1',
          label: '暂停消息通知1小时'
        },
        {
          value: '2',
          label: '暂停消息2天'
        },
        {
          value: '3',
          label: '永久关闭'
        },
        {
          value: '4',
          label: '自定义'
        }
      ],
      messageInformTime: 1,
      popoverShow: false,
      sliderShow: false,
      timeDisplay: '1小时',
      commonGroupList: []
    }
  },
  methods: {
    // 语音、视频
    showPrivateVideo (mode) {
      console.log("showPrivateVideo", mode);

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
    // 修改备注
    editRemark () {
      this.editRemarkValue = this.userInfo.remarkNickName
      this.editRemarkModal = true
    },
    // modal关闭
    handleClose (done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done();
        })
        .catch(_ => { });
    },
    // 修改备注提交
    editRemarkSubmit () {
      this.$http({
        url: `/friend/update/remark`,
        method: 'PUT',
        data: {
          friendId: this.userInfo.id,
          remarkNickName: this.editRemarkValue
        }
      })
        .then((friend) => {
          this.$message.success('修改成功')
          this.chatStore.updateChatFromFriend(friend);
          this.friendStore.updateFriend(friend);
        })
      this.editRemarkModal = false
      this.$emit('updateUserInfo', true)
    },
    // 切换
    blacklistChange () {
      if (this.blacklist) {
        this.chatStore.addBlacklist(this.userInfoData.id)
          .then(() => {
            this.$message.success('已加入黑名单');
          })
      } else {
        this.chatStore.removeBlacklist(this.userInfoData.id)
          .then(() => {
            this.$message.success('已移出黑名单');
          })
      }
    },
    starChange (val) {
      if (val) {
        this.setStarFriend(true);
      } else {
        this.setStarFriend(false);
      }
    },
    onSwitchMessageChange (val) {
      // 当前是 true（用户点击要开启免打扰）
      if (val === false) {
        // 弹出选择弹框，但不立刻切换 switch 的值
        this.popoverShow = true;
        this.messageSelectShow = true;
      } else {
        // 用户主动取消免打扰，立即切换状态
        this.message = true;
        this.setMessageTime(0);
      }
    },
    // 消息通知点击
    messageSelectItem (value) {
      this.messageSelectValue = value
      switch (value) {
        case '0':
          this.setMessageTime(0)
          this.message = true
          break;
        case '1':
          this.setMessageTime(1)
          this.message = false
          break;
        case '2':
          this.setMessageTime(48)
          this.message = false
          break;
        case '3':
          this.setMessageTime(876000)
          this.message = false
          break;
        case '4':
          this.sliderShow = true
          // this.setMessageTime(this.messageInformTime)
          // this.message = false
          break;
      }
    },
    // 关闭弹框
    onCloseModal () {
      this.$emit('friendInfoClose', false)
    },
    // popover关闭
    popoverClose () {
      this.sliderShow = false
      this.messageSelectShow = false
      this.popoverShow = false
      this.messageInformTime = 1
    },
    // 时间计算
    updateDisplay (val) {
      const days = Math.floor(val / 24);
      const hours = val % 24;

      if (days > 0 && hours > 0) {
        this.timeDisplay = `${days}天 ${hours}小时`;
      } else if (days > 0) {
        this.timeDisplay = `${days}天`;
      } else {
        this.timeDisplay = `${hours}小时`;
      }
    },
    // 删除好友
    onDelFriend () {
      this.$confirm(`确认删除'${this.friend.nickName}',并清空聊天记录吗?`, '确认解除?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http({
          url: `/friend/delete/${this.friend.id}`,
          method: 'delete'
        }).then(() => {
          this.onCloseModal()
          this.$message.success("删除好友成功");
          this.chatStore.removeChat(this.itemIndex);
          this.friendStore.removeFriend(this.friend.id);
          this.chatStore.removePrivateChat(this.friend.id);
        })
      })
    },
    //分享名片
    onSendCard () {
      console.log("cardData", this.friend, this.userInfo);
      this.$refs.chatSel.open(chats => {
        let idx = 0;
        chats.forEach(chat => {
          let cardData = {
            userId: this.friend.id,
            nickName: this.friend.showNickName,
            headImage: this.friend.headImage,
          }
          let msgInfo = {};
          msgInfo.type = this.$enums.MESSAGE_TYPE.USER_CARD;
          msgInfo.content = JSON.stringify(cardData);
          if (chat.type == 'PRIVATE') {
            msgInfo.recvId = chat.targetId;
          } else {
            msgInfo.groupId = chat.targetId;
          }
          let action = `/message/${chat.type.toLowerCase()}/send`;
          this.$http({
            url: action,
            method: 'post',
            data: msgInfo
          }).then(m => {
            m.selfSend = true;
            this.chatStore.openChat(chat);
            this.chatStore.insertMessage(m, chat);
            if (++idx == chats.length) {
              this.$message.success("发送成功")
            }
          })
        })
      })
    },
    onDelItem () {
      this.chatStore.removeChat(this.itemIndex);
      this.onCloseModal()
    },
    messageSliderOk () {
      this.setMessageTime(this.messageInformTime)
      this.sliderShow = false
      this.message = false
    },
    setMessageTime (time) {
      let data = {
        friendId: this.userInfoData.id,
        notifyExpireTs: time * 1000 * 60 * 60
      };
      this.$http({
        url: "/friend/notify/expire",
        method: 'post',
        data
      }).then(() => {
        this.$message.success("设置成功");
        this.popoverClose();

        if (time > 0) {
          this.message = false;
        } else {
          this.message = true;
        }
        this.$emit('updateUserInfo', true);
      });
    },
    getCommonGroupList (friendId, page, size) {
      this.$http({
        url: `/friend/group/list?friendId=${friendId}&page=${page}&size=${size}`,
        method: 'get'
      }).then(data => {
        this.commonGroupList = data;
      });
    },
    openGroupModal () {
      this.$emit('openDialog', '共同加入的群', this.commonGroupList)
    },
    openModal (title, list) {
      this.$emit('openDialog', title, list)
    },
    setStarFriend (type) {
      let data = {
        friendId: this.userInfoData.id,
        tag: type
      }
      this.$http({
        url: `/friend/update/tag`,
        method: 'put',
        data
      }).then(() => {
        this.$message.success("设置成功");
        this.chatStore.setStar(this.userInfoData.id, type)
        this.$emit('updateUserInfo', true);
      })
    }
  },
  mounted () {
    this.getCommonGroupList(this.userInfoData.id, 1, 100)
    if (this.userInfoData.notifyExpireTs && this.userInfoData.notifyExpireTs > 0) {
      this.message = false
    } else {
      this.message = true
    }
    if (this.userInfoData.blacklist) {
      this.blacklist = true
    } else {
      this.blacklist = false
    }
    this.star = this.userInfoData.tag
  },
  computed: {
    setTime () {
      return Math.floor(this.messageInformTime / 24)
    },
    userInfoData () {
      return this.friendStore.friendInfo
    },
    imageAmount () {
      let type = this.$enums.MESSAGE_TYPE.IMAGE;
      return this.chat.messages.filter(m => m.type == type).length;
    },
    fileAmount () {
      let type = this.$enums.MESSAGE_TYPE.FILE;
      return this.chat.messages.filter(m => m.type == type && m.loadStatus == 'ok').length
    },
    videoAmount () {
      let type = this.$enums.MESSAGE_TYPE.VIDEO;
      return this.chat.messages.filter(m => m.type == type).length;
    },
  },
  watch: {
    userInfoData: {
      handler (value) {
        if (value.notifyExpireTs) {
          this.message = false
        } else {
          this.message = true
        }
        if (value.blacklist) {
          this.blacklist = true
        } else {
          this.blacklist = false
        }
        this.star = this.userInfoData.tag
      }
    }
  }
}
</script>
<style lang="scss" scoped>
  .friend-info {
    width: 100%;
    padding-top: 6px;
    // box-sizing: border-box;
    .title {
      width: 100%;
      padding: 0 20px;
      height: 35px;
      color: #999;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
      .title-icon {
        width: 50px;
        height: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .title-icon-phone {
          width: 18px;
          height: 18px;
          background: url("../../assets/friend/phone-icon.png") no-repeat center;
          background-size: 100%;
          cursor: pointer;
        }
        .title-icon-video {
          width: 22px;
          height: 18px;
          background: url("../../assets/friend/video-icon.png") no-repeat center;
          background-size: 100%;
          cursor: pointer;
        }
      }
    }
    .info {
      width: calc(100% - 40px);
      height: 60px;
      padding: 10px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-direction: row;
      border-bottom: 5px solid #d9d9d9;
      .info-left {
        width: calc(100% - 60px);
        height: 60px;
        display: flex;
        .info-left-img {
          width: 60px;
          height: 100%;
          border-radius: 30px;
          background-color: #ccc;
          margin-right: 15px;
          overflow: hidden;
          img {
            width: 100%;
            height: 100%;
          }
        }
        .info-left-text {
          width: calc(100% - 75px);
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: space-evenly;
          p {
            margin: 0px;
            font-size: 10px;
            color: #999;
          }
          p:first-child {
            font-size: 16px;
            color: #000;
          }
        }
      }
      .info-right {
        width: 20px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        .info-right-icon {
          width: 16px;
          height: 16px;
          background: url("../../assets/friend/edit-icon.png") no-repeat center;
          background-size: 100%;
          cursor: pointer;
        }
      }
    }
    .content {
      width: 100%;
      max-height: 500px;
      overflow-y: auto;

      ul {
        width: 100%;
        margin: 0px;
        padding: 0px;
        li {
          width: calc(100% - 40px);
          height: 40px;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          cursor: pointer;
          .left {
            width: calc(100% - 28px);
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: flex-start;
          }
          .right {
            width: 50px;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .icon {
            width: 16px;
            height: 16px;
            margin-right: 10px;
          }
          .text {
            font-size: 14px;
          }
          .text-color {
            color: #3066ec;
          }
          .linkman-icon {
            background: url("../../assets/friend/linkman-icon.png") no-repeat
              center;
            background-size: 100%;
          }
          .share-icon {
            background: url("../../assets/friend/share-icon.png") no-repeat center;
            background-size: 100%;
          }
          .inform-icon {
            background: url("../../assets/friend/inform-icon.png") no-repeat
              center;
            background-size: 100%;
          }
          .image-icon {
            background: url("../../assets/friend/image-icon.png") no-repeat center;
            background-size: 100%;
          }
          .video-icon {
            background: url("../../assets/friend/video-info-icon.png") no-repeat
              center;
            background-size: 100%;
          }
          .files-icon {
            background: url("../../assets/friend/files-icon.png") no-repeat center;
            background-size: 100%;
          }
          .group_chat-icon {
            background: url("../../assets/friend/group_chat-icon.png") no-repeat
              center;
            background-size: 100%;
          }
          .star-icon {
            background: url("../../assets/friend/star-icon.png") no-repeat center;
            background-size: 100%;
          }
          .blacklist-icon {
            background: url("../../assets/friend/blacklist-icon.png") no-repeat
              center;
            background-size: 100%;
          }
          .complaint-icon {
            background: url("../../assets/friend/complaint-icon.png") no-repeat
              center;
            background-size: 100%;
          }
          .delete_chat-icon {
            background: url("../../assets/friend/delete_chat-icon.png") no-repeat
              center;
            background-size: 100%;
          }
          .delete_linkman-icon {
            background: url("../../assets/friend/delete_linkman-icon.png")
              no-repeat center;
            background-size: 100%;
          }
        }
        li:hover {
          background-color: #ededed;
        }
        li:nth-child(2) {
          border-bottom: 5px solid #d9d9d9;
        }
        li:nth-child(6) {
          border-bottom: 5px solid #d9d9d9;
        }
        li:nth-child(9) {
          border-bottom: 5px solid #d9d9d9;
        }
      }
    }
  }
  .edit-remark-modal-content {
    width: 100%;
    padding: 0px 40px 10px;
    box-sizing: border-box;
    p {
      padding: 0px;
      margin: 0px;
      font-size: 20px;
      color: #999;
      margin-bottom: 20px;
    }
    ::v-deep .el-input__inner {
      border: none;
      border-bottom: 1px solid #d9d9d9 !important;
    }
  }
  .message-list {
    width: calc(100% - 10px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 5px;
    &:hover {
      background-color: #ededed;
    }
    p {
      margin: 0;
      font-size: 14px;
      cursor: pointer;
    }
    .el-icon-close {
      cursor: pointer;
    }
  }
  ::v-deep .el-popover {
    position: absolute;
    top: 275px;
    right: -112px;
    padding: 0px;
    .message-list {
      width: 100%;
      padding: 5px 10px;
      box-sizing: border-box;
      cursor: pointer;
    }
  }
  .popover-box {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    background: rgba(255, 255, 255, 0);
  }
  .message-slider {
    width: 300px;
    height: 180px;
    position: absolute;
    top: 89px;
    right: 151px;
    z-index: 2;
    padding: 30px;
    box-sizing: border-box;
    background: white;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    .slider-tips {
      width: 100%;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    p {
      width: 100%;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      color: #c42b1c;
    }
    .message-slider-ok {
      width: 100%;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 20px;
      cursor: pointer;
      color: #fff;
      background: #096bff;
      border-radius: 4px;
    }
    .message-slider-ok:hover {
      background: #096bff8e;
    }
  }
</style>