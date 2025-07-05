<template>
  <div class="friend-info"
       v-if="memberInfo">
    <!-- 标题栏 -->
    <div class="title">
      <div>
        <i class="el-icon-arrow-left"
           style="cursor: pointer;"
           @click="returnInfo"></i>
        <span>个人信息</span>
      </div>
      <div class="title-icon"
           v-if="memberInfo.userId !== mine.id && memberInfo.isFriend">
        <span class="title-icon-code"
              @click="openCode"></span>
        <span class="title-icon-phone"
              @click="showPrivateVideo('voice')"></span>
        <span class="title-icon-video"
              @click="showPrivateVideo('video')"></span>
      </div>
    </div>
    <!-- 信息栏 -->
    <div class="info">
      <div class="info-left">
        <div class="info-left-img">
          <img :src="memberInfo.headImage"
               alt="">
        </div>
        <div class="info-left-text">
          <p>{{ memberInfo.showNickName }}</p>
          <p :class="[memberInfo.online ? 'isOnline' : '']">{{ showTime }}</p>
          <p v-if="isMemberInfo">来源：账号添加</p>
        </div>
      </div>
      <div class="info-right"
           v-if="isMemberInfo">
        <span class="info-right-icon"
              title="编辑备注"
              @click="editRemark"></span>
      </div>
    </div>
    <!-- 内容区域 -->
    <div class="content">
      <ul>
        <div class="ul-li-border">
          <li @click="applyFriend"
              v-if="memberInfo.userId !== mine.id && !isMemberInfo">
            <span class="icon add-friend-icon"></span><span class="text text-color">添加为联系人</span>
          </li>
          <li @click="sendMessage"
              v-if="memberInfo.userId !== mine.id && isMemberInfo || groupInfo.interimPerm">
            <span class="icon linkman-icon"></span><span class="text text-color">发送消息</span>
          </li>
          <li @click="onSendCard">
            <span class="icon share-icon"></span><span class="text text-color">分享名片</span>
          </li>
        </div>
        <div class="ul-li-border"
             v-show="isMemberInfo">
          <li v-if="isMemberInfo">
            <div class="left">
              <span class="icon inform-icon"></span><span class="text">消息通知</span>
            </div>
            <span class="right">
              <el-switch :value="message"
                         @change="onSwitchMessageChange"
                         active-color="#99B6FF"
                         inactive-color="#B1B1B1" />
            </span>
          </li>
          <li v-if="isMemberInfo">
            <div class="left"
                 @click="setStarFriend">
              <span class="icon star-icon"></span><span class="text">设为星标朋友</span>
            </div>
            <span class="right">
              <el-switch v-model="star"
                         @change="starChange"
                         active-color="#99B6FF"
                         inactive-color="#B1B1B1" />
            </span>
          </li>
          <li v-if="isMemberInfo">
            <div class="left">
              <span class="icon blacklist-icon"></span><span class="text">加入黑名单</span>
            </div>
            <span class="right">
              <el-switch v-model="blacklist"
                         @change="blacklistChange"
                         active-color="#99B6FF"
                         inactive-color="#B1B1B1" />
            </span>
          </li>
        </div>
        <div :class="[memberInfo.userId !== mine.id && isMemberInfo ? 'ul-li-border' : '']">
          <li @click="openModal('图片')"
              v-if="imageAmount > 0">
            <span class="icon image-icon"></span><span class="text">{{ imageAmount }}张图片</span>
          </li>
          <li @click="openModal('视频')"
              v-if="videoAmount > 0">
            <span class="icon video-icon"></span><span class="text">{{ videoAmount }}个视频</span>
          </li>
          <li @click="openModal('文件')"
              v-if="fileAmount > 0">
            <span class="icon files-icon"></span><span class="text">{{ fileAmount }}个文件</span>
          </li>
          <li @click="openModal('共同加入的群', commonGroupList)">
            <span class="icon group_chat-icon"></span><span class="text">{{ commonGroupList.length }}个共同加入的群聊</span>
          </li>
        </div>
        <li @click="openModal('投诉')"
            v-if="memberInfo.userId !== mine.id">
          <span class="icon complaint-icon"></span><span class="text">投诉</span>
        </li>
        <li @click="onDelItem"
            v-if="memberInfo.userId !== mine.id && chat">
          <span class="icon delete_chat-icon"></span><span class="text">删除会话</span>
        </li>
        <li @click="onDelFriend"
            v-if="isMemberInfo">
          <span class="icon delete_linkman-icon"></span><span class="text">删除联系人</span>
        </li>
      </ul>
    </div>
    <!-- 编辑备注弹窗 -->
    <el-dialog append-to-body
               :visible.sync="editRemarkModal"
               width="40%"
               :before-close="handleClose">
      <div class="edit-remark-modal-content">
        <p>编辑备注</p>
        <el-input v-model="editRemarkValue"
                  clearable
                  placeholder="请输入备注"
                  @keyup.enter.native="editRemarkSubmit" />
      </div>
    </el-dialog>
    <!-- 弹出菜单 -->
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
            <span class="first-time">1小时</span>
            <span class="last-time">7天</span>
          </div>
          <el-slider :min="1"
                     :max="168"
                     v-model="messageInformTime"
                     :show-tooltip="false"
                     @input="updateDisplay" />
          <p>{{ timeDisplay }}</p>
          <div class="message-slider-ok"
               @click.stop="messageSliderOk">确定</div>
        </div>
      </el-popover>
    </div>
    <!-- 分享名片选择器 -->
    <chat-selector ref="chatSel"
                   title="分享名片"
                   :appendToBody="true" />
    <FriendApply ref="applyRef"
                 @condition="condition" />
  </div>
</template>

<script>
import ChatSelector from '../chat/ChatSelector.vue'
import FriendApply from '../friend/FriendApply.vue';
export default {
  components: { ChatSelector, FriendApply },
  data () {
    return {
      message: false,
      star: false,
      blacklist: false,
      editRemarkModal: false,
      editRemarkValue: '',
      messageSelectShow: false,
      messageSelectValue: '',
      messageSelectList: [
        { value: '1', label: '暂停消息通知1小时' },
        { value: '2', label: '暂停消息2天' },
        { value: '3', label: '永久关闭' },
        { value: '4', label: '自定义' }
      ],
      messageInformTime: 1,
      popoverShow: false,
      sliderShow: false,
      timeDisplay: '1小时',
      commonGroupList: [],
      memberInfo: {},
      friend: {},
      isBanned: false,
      itemIndex: null,
      chat: null
    }
  },
  computed: {
    groupInfo () {
      return this.groupStore.groupInfo;
    },
    mine () {
      return this.userStore.userInfo;
    },
    isCurrenUser () {
      if (this.mine && this.memberInfo) {
        return this.mine.id == this.memberInfo.id;
      } else {
        return false;
      }
    },
    isMemberInfo () {
      return this.memberInfo && this.memberInfo.isFriend
    },
    imageAmount () {
      if (!this.chat?.messages) return 0
      const type = this.$enums.MESSAGE_TYPE.IMAGE
      return this.chat.messages.filter(m => m.type === type && m.loadStatus === 'ok').length
    },
    videoAmount () {
      if (!this.chat?.messages) return 0
      const type = this.$enums.MESSAGE_TYPE.VIDEO
      return this.chat.messages.filter(m => m.type === type).length
    },
    fileAmount () {
      if (!this.chat?.messages) return 0
      const type = this.$enums.MESSAGE_TYPE.FILE
      return this.chat.messages.filter(m => m.type === type && m.loadStatus === 'ok').length
    },
    showTime () {
      return this.memberInfo.online ? '在线' : this.$date.toTimeText(this.memberInfo.lastOnlineTime ? this.memberInfo.lastOnlineTime : this.memberInfo.lastLoginTime, true, true);
    },
    chatIndex () {
      return this.chatStore.chats.findIndex(item => item.targetId === this.memberInfo.id)
    }
  },
  methods: {
    openCode () {
      this.$emit('openCode', this.memberInfo.id, 2)
    },
    async loadFriend (friendId) {
      const userInfo = await this.$http({ url: `/friend/find/${friendId}`, method: 'GET' });
      this.friendStore.setFriendInfo(userInfo);
      this.friend = userInfo;
    },
    async open (member, itemIndex = null) {
      this.itemIndex = itemIndex;
      console.log(member);

      if (member.isFriend) {
        this.memberInfo = { isFriend: true, ...this.friendStore.findFriend(member.userId) };
        this.chat = this.chatStore.chats.find(item => item.targetId === member.userId);
        this.chatStore.setGroupMemberChat(this.memberInfo.id);
        if (!this.chat) {
          await this.loadFriend(member.userId);
          this.memberInfo = { isFriend: true, ...this.friend };
        }
      } else {
        this.memberInfo = member;
        this.friend = {};
      }
      this.isBanned = !!member.banned;
      await this.initialInfo();
    },
    async initialInfo () {
      if (!this.memberInfo) return;
      const id = this.isMemberInfo ? this.memberInfo.id : this.memberInfo.userId;
      console.log('initialInfo', id);

      this.getCommonGroupList(id, 1, 100);
      if (this.isMemberInfo) await this.initSwitchStatus();
    },
    async initSwitchStatus () {
      const source = this.chat || this.friend;
      this.message = !source.notifyExpireTs;
      this.blacklist = !!source.blacklist;
      this.star = !!source.star || !!source.tag;
    },
    returnInfo () {
      this.$emit('returnInfo', 'GROUP')
    },
    showPrivateVideo (mode) {
      if (!this.isMemberInfo) {
        this.$message.error("你已不是对方好友,无法呼叫")
        return
      }
      if (this.isBanned) {
        this.showBannedTip()
        return
      }
      const rtcInfo = {
        mode,
        isHost: true,
        friend: this.friend
      }
      this.$eventBus.$emit("openPrivateVideo", rtcInfo)
    },
    editRemark () {
      this.editRemarkValue = this.memberInfo.remarkNickName
      this.editRemarkModal = true
    },
    handleClose (done) {
      this.$confirm('确认关闭？').then(done).catch(() => { })
    },
    editRemarkSubmit () {
      this.$http.put('/friend/update/remark', {
        friendId: this.memberInfo.id,
        remarkNickName: this.editRemarkValue
      }).then(friend => {
        this.$message.success('修改成功')
        this.chatStore.updateChatFromFriend(friend)
        this.friendStore.updateFriend(friend)
        this.editRemarkModal = false
        this.$emit('updateInfo', true)
      })
    },
    blacklistChange () {
      const method = this.blacklist
        ? this.chatStore.addBlacklist
        : this.chatStore.removeBlacklist
      method(this.memberInfo.id).then(() => {
        this.$message.success(this.blacklist ? '已加入黑名单' : '已移出黑名单')
      })
    },
    starChange (val) {
      this.setStarFriend(val)
    },
    onSwitchMessageChange (val) {
      if (!val) {
        this.popoverShow = true
        this.messageSelectShow = true
      } else {
        this.message = true
        this.setMessageTime(0)
      }
    },
    messageSelectItem (value) {
      switch (value) {
        case '0': this.setMessageTime(0); this.message = true; break
        case '1': this.setMessageTime(1); this.message = false; break
        case '2': this.setMessageTime(48); this.message = false; break
        case '3': this.setMessageTime(876000); this.message = false; break
        case '4': this.sliderShow = true; break
      }
    },
    updateDisplay (val) {
      const d = Math.floor(val / 24), h = val % 24
      this.timeDisplay = d > 0 ? `${d}天${h ? ` ${h}小时` : ''}` : `${h}小时`
    },
    messageSliderOk () {
      this.setMessageTime(this.messageInformTime)
      this.sliderShow = false
      this.message = false
    },
    setMessageTime (time) {
      this.$http.post("/friend/notify/expire", {
        friendId: this.memberInfo.id,
        notifyExpireTs: time * 60 * 60 * 1000
      }).then(() => {
        if (this.chat) {
          this.chatStore.addNotify(this.memberInfo.id, time * 60 * 60 * 1000)
        } else {
          this.loadFriend(this.memberInfo.id)
        }
        this.$message.success("设置成功")
        this.popoverClose()
        this.message = time === 0
        this.$emit('updateInfo', true)
      })
    },
    popoverClose () {
      this.sliderShow = false
      this.messageSelectShow = false
      this.popoverShow = false
      this.messageInformTime = 1
    },
    onSendCard () {
      let query = {
        name: null,
        id: null
      };
      if (this.isMemberInfo) {
        if (this.chat) {
          query = {
            name: this.friendStore.findFriend(this.chat.targetId).nickName,
            id: this.chat.targetId,
            headImage: this.chat.headImage
          }
        } else {
          query = {
            name: this.friend.nickName,
            id: this.friend.id,
            headImage: this.friend.headImage
          }
        }
      } else {
        query = {
          name: this.memberInfo.showNickName,
          id: this.memberInfo.userId,
          headImage: this.memberInfo.headImage
        }
      }
      this.$refs.chatSel.open(chats => {
        let idx = 0
        chats.forEach(chat => {
          const cardData = {
            userId: query.id,
            nickName: query.name,
            headImage: query.headImage
          }
          const msgInfo = {
            type: this.$enums.MESSAGE_TYPE.USER_CARD,
            content: JSON.stringify(cardData),
            ...(chat.type === 'PRIVATE' ? { recvId: chat.targetId } : { groupId: chat.targetId })
          }
          this.$http.post(`/message/${chat.type.toLowerCase()}/send`, msgInfo).then(m => {
            m.selfSend = true
            this.chatStore.openChat(chat)
            this.chatStore.insertMessage(m, chat)
            if (++idx === chats.length) this.$message.success("发送成功")
          })
        })
      })
    },
    onDelFriend () {
      let query = {
        name: null,
        id: null
      };
      if (this.chat) {
        query = {
          name: this.chat.showName,
          id: this.chat.targetId
        }
      } else {
        query = {
          name: this.friend.showNickName,
          id: this.friend.id
        }
      }
      this.$confirm(`确认删除'${query.name}'，并清空聊天记录吗？`, '确认解除？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`/friend/delete/${query.id}`).then(() => {
          this.onCloseModal()
          this.$message.success("删除好友成功")
          if (this.chatIndex >= 0) {
            this.chatStore.removeChat(this.chatIndex)
          }
          this.friendStore.removeFriend(query.id)
          this.chatStore.removePrivateChat(query.id)
          this.$emit('updateInfo')
        })
      })
    },
    onDelItem () {
      if (this.chatIndex >= 0) {
        this.chatStore.removeChat(this.chatIndex)
        this.$message.success("删除成功")
        this.onCloseModal()
      } else {
        this.$message.warning('暂无该好友会话')
      }
      // this.onCloseModal()
    },
    onCloseModal () {
      this.$emit('infoClose', false)
    },
    openModal (title, list) {
      this.$emit('openDialog', title, list)
    },
    getCommonGroupList (friendId, page, size) {
      this.$http.get(`/friend/group/list?friendId=${friendId}&page=${page}&size=${size}`).then(data => {
        this.commonGroupList = data
      })
    },
    setStarFriend (type) {
      this.$http.put('/friend/update/tag', {
        friendId: this.memberInfo.id,
        tag: type
      }).then(() => {
        this.$message.success("设置成功")
        this.chatStore.setStar(this.memberInfo.id, type)
        this.loadFriend(this.memberInfo.id)
        this.$emit('updateInfo', true)
      })
    },
    // 添加群成员
    applyFriend () {
      this.$http({
        url: `/user/find/${this.memberInfo.userId}`,
        method: 'GET'
      }).then((userInfo) => {
        this.$refs.applyRef.open(userInfo);
      })
    },
    // 添加好友后更新数据
    condition (state) {
      if (state === true) {
        this.loadFriend(this.memberInfo.userId).then(() => {
          this.memberInfo = { isFriend: true, ...this.friend };
          console.log(this.memberInfo);

          this.initialInfo();
          this.$emit('updateInfo')
        });
      }
    },
    // 发送消息
    sendMessage () {
      console.log('this.chat', this.chat, this.friend);
      let newChat = {
        type: 'PRIVATE',
        targetId: this.chat ? this.chat.targetId : this.friend.id,
        showName: this.chat ? this.chat.showNickName : this.friend.showNickName,
        headImage: this.chat ? this.chat.headImage : this.friend.headImage,
      };
      let content = {
        id: this.chat ? this.chat.targetId : this.friend.id,
        online: this.chat ? this.chat.online : this.friend.online,
        onlineApp: this.chat ? this.chat.onlineApp : this.friend.onlineApp,
        onlineWeb: this.chat ? this.chat.onlineWeb : this.friend.onlineWeb
      }
      this.chatStore.openChat(newChat);
      this.chatStore.setActiveChat(this.chat ? this.chat.targetId : this.friend.id, 'PRIVATE');
      this.chatStore.updateOnlineStatus(content)
      this.onCloseModal()
      if (this.$route.path != "/home/chat") {
        this.$router.push("/home/chat");
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
      .el-icon-arrow-left {
        margin-right: 10px;
      }
      .title-icon {
        width: 80px;
        height: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .title-icon-code {
          width: 18px;
          height: 18px;
          background: url("../../assets/icon/QRCode.png") no-repeat center;
          background-size: 100%;
          cursor: pointer;
        }
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
          .add-friend-icon {
            width: 15px;
            height: 19px;
            background: url("~@/assets/chat/add-friend-icon.png") no-repeat center;
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
        .ul-li-border {
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
      font-size: 18px;
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
  .isOnline {
    color: #47ad47 !important;
  }
</style>