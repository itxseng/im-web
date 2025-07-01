<template>
  <el-container class="friend-page">
    <el-aside width="350px"
              class="friend-list-box">
      <div class="friend-list-header">
        <el-input class="search-text"
                  size="small"
                  placeholder="搜索"
                  v-model="searchText">
          <i class="el-icon-search el-input__icon"
             slot="prefix"> </i>
        </el-input>
        <div class="friend-list-header-btn">
          <el-popover placement="top-start"
                      width="100"
                      trigger="hover">
            <div class="friend-list-header-btn-list">
              <div class="friend"
                   @click="showAddFriend = true">
                <span class="icon"></span>
                <span>添加联系人</span>
              </div>
              <div class="group"
                   @click="onCreateGroup">
                <span class="icon"></span>
                <span>新建群聊</span>
              </div>
            </div>
            <i class="el-icon-plus"
               slot="reference"></i>
          </el-popover>
        </div>
        <!-- <el-button plain
                   class="add-btn"
                   icon="el-icon-plus"
                   title="添加好友"
                   @click="onShowAddFriend()"></el-button>
        <add-friend :dialogVisible="showAddFriend"
                    @close="onCloseAddFriend"></add-friend> -->
      </div>
      <div class="friend-list-nav">
        <div :class="['friend-list-nav-new',showFriendReuqest ?'friend-list-nav-new-click' :'']"
             @click="friendNavClick(1)">
          <div class="icon"></div>
          <span>新的好友</span>
          <div v-show="recvCount"
               class="friend-list-nav-new-count">{{ recvCount }} </div>
        </div>
        <div :class="['friend-list-nav-group',showMyGroup ?'friend-list-nav-group-click':'']"
             @click="friendNavClick(2)">
          <div class="icon"></div>
          <span>我的群聊</span>
        </div>
        <div :class="['friend-list-nav-notice',showGroupNotice ? 'friend-list-nav-notice-click':'']"
             @click="friendNavClick(3)">
          <div class="icon"></div>
          <span>群公告</span>
        </div>
      </div>
      <el-scrollbar class="friend-list-items">
        <!-- 顶部列表: 新的朋友、ai机器人等 -->
        <!-- <div class="top-item"
             :class="showFriendReuqest ? 'active' : ''"
             @click="onClickNewFriend">
          <div class="top-item-avatar">
            <head-image :size="42"
                        :url="require('@/assets/image/new_friend.png')">
              <div v-show="recvCount"
                   class="unread-text">{{ recvCount }} </div>
            </head-image>
          </div>
          <div class="top-item-info">
            <div class="top-item-name">新的朋友</div>
          </div>
        </div> -->
        <div class="divider"></div>
        <div v-for="(friends, i) in friendValues"
             :key="i">
          <div class="index-title">{{ friendKeys[i] }}</div>
          <div v-for="(friend) in friends"
               :key="friend.id">
            <friend-item :friend="friend"
                         :active="friend.id === activeFriend.id"
                         @chat="onSendMessage(friend)"
                         @delete="onDelFriend(friend)"
                         @click.native="onActiveItem(friend)">
            </friend-item>
          </div>
          <div v-if="i < friendValues.length - 1"
               class="divider"></div>
        </div>
      </el-scrollbar>
      <NavBar />
    </el-aside>
    <el-container class="friend-box">
      <friend-request class="request-list"
                      v-if="showFriendReuqest"></friend-request>
      <MyGroup class="request-list"
               v-else-if="showMyGroup" />
      <GroupNotice class="request-list"
                   v-else-if="showGroupNotice" />
      <div style="display: flex;flex-direction: column;width: 100%;height: 100%;"
           v-else>
        <div class="friend-header"
             v-show="userInfo.id">
          {{ userInfo.nickName }}
        </div>
        <div class="friend-detail-box"
             v-show="userInfo.id">
          <div class="friend-detail">
            <div class="friend-detail-top">
              <head-image :size="80"
                          :name="userInfo.nickName"
                          :url="userInfo.headImage"
                          :radius="'50%'"
                          @click.native="showFullImage()"></head-image>
              <div class="friend-detail-top-text">
                <div class="friend-detail-top-text-name">
                  <span>{{ userInfo.nickName }}</span>
                  <i class="el-icon-male"
                     style="color:#7EC9F4;font-size: 20px;font-weight: 700;"
                     v-if="userInfo.sex === 0"></i>
                  <i class="el-icon-female"
                     style="color:#F383BB;font-size: 20px;font-weight: 700;"
                     v-if="userInfo.sex === 1"></i>
                </div>
                <div class="friend-detail-top-text-id">ID:{{userInfo.id}}</div>
              </div>
            </div>
            <div class="friend-detail-bottom">
              <p>备注：{{userInfo.remarkNickName ? userInfo.remarkNickName : '暂未给该用户设置备注'}}</p>
              <p>签名：{{userInfo.signature ? userInfo.signature : '该用户暂未设置签名'}}</p>
            </div>
            <div class="friend-detail-btn">
              <div class="friend-detail-btn-box"
                   @click="onSendMessage()">
                发送消息
              </div>
            </div>
            <!-- <div>
              <div class="info-item">
                <el-descriptions title="好友信息"
                                 class="description"
                                 :column="1">
                  <el-descriptions-item label="用户名">{{ userInfo.userName }}
                    <el-tag v-if="userInfo.status == 1"
                            size="mini"
                            type="danger">已注销</el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="用户昵称">{{ userInfo.nickName }}
                  </el-descriptions-item>
                  <el-descriptions-item v-if="isFriend"
                                        class="remark"
                                        label="备注"
                                        :contentStyle="activeFriend.remarkNickName ? '' : 'color:#888;'">{{ activeFriend.showNickName }}
                    <span class="icon iconfont icon-modify"
                          @click="onEditRemark"></span>
                  </el-descriptions-item>
                  <el-descriptions-item label="性别">{{ userInfo.sex == 0 ? "男" : "女"
								}}</el-descriptions-item>
                  <el-descriptions-item label="签名">{{ userInfo.signature }}</el-descriptions-item>
                </el-descriptions>
              </div>
              <div class="frient-btn-group">
                <el-button v-show="isFriend"
                           icon="el-icon-position"
                           type="primary"
                           @click="onSendMessage()">发消息</el-button>
                <el-button v-show="!isFriend"
                           icon="el-icon-plus"
                           type="primary"
                           @click="onAddFriend(userInfo)">加为好友</el-button>
                <el-button v-show="isFriend"
                           icon="el-icon-delete"
                           type="danger"
                           @click="onDelFriend(userInfo)">删除好友</el-button>
              </div>
            </div> -->
          </div>
        </div>
      </div>
    </el-container>
    <friend-apply ref="applyRef"></friend-apply>
    <chat-selector ref="chatSel"
                   title="分享名片"></chat-selector>
    <right-menu ref="rightMenu"
                @select="onSelectMenu"></right-menu>
    <add-friend :dialogVisible="showAddFriend"
                @close="onCloseAddFriend"></add-friend>
    <el-dialog :visible.sync="dialogModal"
               width="450px"
               :destroy-on-close="true">
      <CreateGroup @reload="dialogModalClose"
                   @close="dialogModalClose" />
    </el-dialog>
  </el-container>
</template>

<script>
import FriendItem from "../components/friend/FriendItem.vue";
import FriendRequestItem from "../components/friend/FriendRequestItem.vue";
import AddFriend from "../components/friend/AddFriend.vue";
import HeadImage from "../components/common/HeadImage.vue";
import NoDataTip from '../components/common/NoDataTip.vue';
import FriendApply from '../components/friend/FriendApply.vue';
import FriendRequest from '../components/friend/FriendRequest.vue';
import MyGroup from '../components/friend/MyGroup.vue';
import GroupNotice from '../components/friend/GroupNotice.vue';
import NavBar from "../components/navBar/index.vue";
import ChatSelector from "../components/chat/ChatSelector.vue";
import RightMenu from "../components/common/RightMenu.vue";
import CreateGroup from "@/components/group/CreateGroup.vue";
import { pinyin } from 'pinyin-pro';

export default {
  name: "friend",
  components: {
    FriendItem,
    FriendRequestItem,
    AddFriend,
    HeadImage,
    NoDataTip,
    FriendApply,
    FriendRequest,
    NavBar,
    ChatSelector,
    RightMenu,
    MyGroup,
    GroupNotice,
    CreateGroup
  },
  data () {
    return {
      searchText: "",
      showAddFriend: false,
      activeFriend: {},
      userInfo: {},
      showFriendReuqest: false,
      showMyGroup: false,
      showGroupNotice: false,
      dialogModal: false
    }
  },
  methods: {
    dialogModalClose () {
      this.dialogModal = false;
    },
    onCreateGroup () {
      this.dialogModal = true;
    },
    // 顶部导航栏点击事件
    friendNavClick (type) {
      switch (type) {
        case 1:
          this.showFriendReuqest = true;
          this.showMyGroup = false;
          this.showGroupNotice = false;
          break;
        case 2:
          this.showMyGroup = true;
          this.showFriendReuqest = false;
          this.showGroupNotice = false;
          break;
        case 3:
          this.showGroupNotice = true;
          this.showFriendReuqest = false;
          this.showMyGroup = false;
          break;
      }
    },
    onShowAddFriend () {
      this.showAddFriend = true;
    },
    onCloseAddFriend () {
      this.showAddFriend = false;
    },
    onActiveItem (friend) {
      this.activeFriend = friend;
      this.showFriendReuqest = false;
      this.loadUserInfo(friend.id);
    },
    onDelFriend (friend) {
      this.$confirm(`确认删除'${friend.nickName}',并清空聊天记录吗?`, '确认解除?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http({
          url: `/friend/delete/${friend.id}`,
          method: 'delete'
        }).then(() => {
          this.$message.success("删除好友成功");
          this.friendStore.removeFriend(friend.id);
          this.chatStore.removePrivateChat(friend.id);
        })
      })
    },
    onAddFriend () {
      this.$refs.applyRef.open(this.userInfo)
    },
    onSendMessage () {
      let chat = {
        type: 'PRIVATE',
        targetId: this.activeFriend.id,
        showName: this.activeFriend.showNickName,
        headImage: this.activeFriend.headImage,
      };
      let content = {
        id: this.activeFriend.id,
        online: this.activeFriend.online,
        onlineApp: this.activeFriend.onlineApp,
        onlineWeb: this.activeFriend.onlineWeb
      }
      this.chatStore.openChat(chat);
      this.chatStore.setActiveChat(this.activeFriend.id);
      this.chatStore.updateOnlineStatus(content)
      this.$router.push("/home/chat");
    },
    onEditRemark () {
      this.$prompt('请输入好友备注', '修改备注', {
        inputValue: this.activeFriend.showNickName,
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then((o) => {
        let data = {
          friendId: this.activeFriend.id,
          remarkNickName: o.value
        }
        this.$http({
          url: '/friend/update/remark',
          method: 'put',
          data: data
        }).then((friend) => {
          this.activeFriend = friend;
          this.chatStore.updateChatFromFriend(friend);
          this.friendStore.updateFriend(friend);
        })
      })
    },
    onClickNewFriend () {
      this.activeFriend = {};
      this.showFriendReuqest = true;
    },
    onSelectMenu (item) {
      switch (item.key) {
        case 'CHAT':
          this.onSendMessage(this.activeFriend);
          break;
        case 'CARD':
          this.onSendCard(this.activeFriend);
          break;
        case 'REMARK':
          this.onEditRemark(this.activeFriend);
          break;
        case 'DELETE':
          this.onDelFriend(this.activeFriend);
          break;
      }
    },
    locateItem (id) {
      if (this.isFriend) {
        document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
      }
    },
    showFullImage () {
      if (this.userInfo.headImage) {
        this.$eventBus.$emit("openFullImage", this.userInfo.headImage);
      }
    },
    updateFriendInfo () {
      if (this.isFriend) {
        // store的数据不能直接修改，深拷贝一份store的数据
        let friend = JSON.parse(JSON.stringify(this.activeFriend));
        friend.headImage = this.userInfo.headImageThumb;
        friend.nickName = this.userInfo.nickName;
        friend.showNickName = friend.remarkNickName ? friend.remarkNickName : friend.nickName;
        this.chatStore.updateChatFromFriend(friend);
        this.friendStore.updateFriend(friend);
      }
    },
    loadUserInfo (id) {
      // 获取好友用户信息
      this.$http({
        url: `/friend/find/${id}`,
        method: 'GET'
      }).then((userInfo) => {
        this.userInfo = userInfo;
        this.updateFriendInfo();
      })
    },
    firstLetter (strText) {
      // 使用pinyin-pro库将中文转换为拼音
      let pinyinOptions = {
        toneType: 'none', // 无声调
        type: 'normal' // 普通拼音
      };
      let pyText = pinyin(strText, pinyinOptions);
      return pyText[0];
    },
    isEnglish (character) {
      return /^[A-Za-z]+$/.test(character);
    }
  },
  computed: {
    mine () {
      return this.userStore.userInfo;
    },
    // chatStore () {
    //   return this.chatStore.chats;
    // },
    friendMap () {
      // 按首字母分组
      let map = new Map();
      this.friendStore.friends.forEach((f) => {
        if (f.deleted || (this.searchText && !f.showNickName.includes(this.searchText))) {
          return;
        }
        let letter = this.firstLetter(f.showNickName).toUpperCase();
        // 非英文一律为#组
        if (!this.isEnglish(letter)) {
          letter = "#"
        }
        if (f.online) {
          letter = '在线'
        }
        if (map.has(letter)) {
          map.get(letter).push(f);
        } else {
          map.set(letter, [f]);
        }
      })
      // 排序
      let arrayObj = Array.from(map);
      arrayObj.sort((a, b) => {
        // #组在最后面
        if (a[0] == '#' || b[0] == '#') {
          return b[0].localeCompare(a[0])
        }
        return a[0].localeCompare(b[0])
      })
      map = new Map(arrayObj.map(i => [i[0], i[1]]));
      return map;
    },
    friendKeys () {
      return Array.from(this.friendMap.keys());
    },
    friendValues () {
      return Array.from(this.friendMap.values());
    },
    recvCount () {
      let requests = this.friendStore.requests;
      return requests.filter((req) => req.recvId == this.mine.id && req.status == 1).length;
    },
    isFriend () {
      return this.friendStore.isFriend(this.userInfo.id);
    }
  }
}
</script>

<style lang="scss">
  .friend-page {
    .divider {
      border-bottom: 1px #ddd solid;
      margin: 10px;
    }

    .friend-list-box {
      display: flex;
      flex-direction: column;
      background: #fff;

      .friend-list-header {
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 8px 5px 8px;
        .search-text {
          width: calc(100% - 42px);
          height: 32px;
          border: none;
          background-color: #f1f1f1;
          border-radius: 4px;
        }
        .friend-list-header-btn {
          width: 32px;
          height: 32px;
          background-color: #f1f1f1;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          .el-icon-plus {
            color: #ccc;
          }
        }
        .el-input__inner {
          border: 0px !important;
          background-color: #f1f1f1;
          border-radius: 4px;
        }
        .add-btn {
          width: 32px;
          height: 32px;
          background-color: #f1f1f1;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          .el-icon-plus {
            color: #ccc;
            font-size: 16px;
          }
        }
      }
      .friend-list-nav {
        width: 100%;
        height: 100px;
        display: flex;
        align-items: center;
        justify-content: space-around;
        div {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          .icon {
            width: 35px;
            height: 35px;
            margin-bottom: 5px;
          }
          span {
            font-size: 10px;
            color: #999;
          }
        }
        .friend-list-nav-new {
          position: relative;
          .icon {
            background: url("../assets/icon/friend/new-friend.png") no-repeat
              center;
            background-size: 100%;
          }
          .friend-list-nav-new-count {
            position: absolute;
            background-color: #f56c6c;
            right: -4px;
            top: -8px;
            color: white;
            border-radius: 30px;
            padding: 1px 5px;
            font-size: 10px;
            text-align: center;
            white-space: nowrap;
          }
        }
        .friend-list-nav-new-click,
        .friend-list-nav-new:hover {
          .icon {
            background: url("../assets/icon/friend/new-friend-click.png")
              no-repeat center;
            background-size: 100%;
          }
          span {
            font-weight: 700;
            color: #3066ec;
          }
        }
        .friend-list-nav-group {
          .icon {
            background: url("../assets/icon/friend/group.png") no-repeat center;
            background-size: 100%;
          }
        }
        .friend-list-nav-group-click,
        .friend-list-nav-group:hover {
          .icon {
            background: url("../assets/icon/friend/group-click.png") no-repeat
              center;
            background-size: 100%;
          }
        }
        .friend-list-nav-notice {
          .icon {
            background: url("../assets/icon/friend/notice.png") no-repeat center;
            background-size: 100%;
          }
        }
        .friend-list-nav-notice-click,
        .friend-list-nav-notice:hover {
          .icon {
            background: url("../assets/icon/friend/notice-click.png") no-repeat
              center;
            background-size: 100%;
          }
        }
      }
      .friend-list-items {
        flex: 1;

        .top-item {
          height: 50px;
          display: flex;
          position: relative;
          padding: 5px 10px;
          align-items: center;
          white-space: nowrap;
          cursor: pointer;

          &:hover {
            background-color: var(--im-background-active);
          }

          &.active {
            background-color: var(--im-background-active-dark);
          }

          .top-item-avatar {
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .top-item-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            padding-left: 10px;
            text-align: left;

            .top-item-name {
              font-size: var(--im-font-size);
              white-space: nowrap;
              overflow: hidden;
            }
          }
        }
      }

      .index-title {
        text-align: left;
        font-size: var(--im-larger-size-larger);
        padding: 5px 15px;
        color: var(--im-text-color-light);
      }
    }

    .friend-box {
      width: 70%;
      display: flex;
      flex-direction: column;
      background: linear-gradient(
        270deg,
        #ffffff 0%,
        rgba(224, 232, 251, 0.5) 100%
      );
      .friend-header {
        height: 38px;
        width: 100%;
        display: flex;
        justify-content: space-between;
        padding: 0px 12px;
        line-height: 31px;
        box-sizing: border-box;
        font-size: var(--im-font-size-larger);
        border-bottom: var(--im-border);
      }

      .request-list {
        flex: 1;
      }
      .friend-detail-box {
        flex: 1;
        display: flex;
        align-items: stretch;
        justify-content: center;
      }
      .friend-detail {
        width: 500px;
        height: 300px;
        display: flex;
        flex-direction: column;
        margin-top: 135px;
        .friend-detail-top {
          width: 100%;
          height: 100px;
          display: flex;
          justify-content: flex-start;
          align-items: center;
          border-bottom: 1px solid #ebebeb;
          .friend-detail-top-text {
            flex: 1;
            height: 7rem;
            margin-left: 30px;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: space-around;
            .friend-detail-top-text-name {
              width: 100%;
              font-size: 22px;
              text-align: left;
              span {
                margin-right: 5px;
              }
            }
            .friend-detail-top-text-id {
              width: 100%;
              font-size: 16px;
              color: #999999;
              text-align: left;
            }
          }
        }
        .friend-detail-bottom {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          font-size: 16px;
        }
        .friend-detail-btn {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 20px;
          .friend-detail-btn-box {
            width: 90px;
            height: 40px;
            color: white;
            cursor: pointer;
            border-radius: 4px;
            font-size: 12px;
            background-color: var(--im-color-primary);
            display: flex;
            justify-content: center;
            align-items: center;
          }
        }
        .info-item {
          margin-left: 20px;
          background-color: #ffffff;
          border: 1px #ddd solid;
        }

        .description {
          padding: 20px 20px 0 20px;

          .el-descriptions-item__content {
            line-height: 21px;
          }

          .icon-modify {
            margin-left: 5px;
            cursor: pointer;
            color: var(--im-color-primary);
          }
        }
      }

      .frient-btn-group {
        text-align: left !important;
        padding: 20px;
      }
    }
  }
  .friend-list-header-btn-list {
    width: 100%;
    display: flex;
    flex-direction: column;
    .icon {
      width: 12px;
      height: 12px;
      margin-right: 5px;
    }
    .group,
    .friend {
      width: 100%;
      height: 30px;
      padding-left: 15px;
      box-sizing: border-box;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      cursor: pointer;
      .icon {
        background: url("~@/assets/chat/add-friend-icon.png") no-repeat center;
        background-size: 100%;
      }
    }
    .group {
      .icon {
        background: url("~@/assets/chat/add-group-icon.png") no-repeat center;
        background-size: 100%;
      }
    }
    .friend:hover,
    .group:hover {
      background-color: #f2f2f2;
    }
  }
</style>