<template>
  <el-container class="user-page">
    <el-aside width="30%"
              class="user-box">
      <div class="user-header">
        <el-input class="search-text"
                  size="small"
                  placeholder="搜索"
                  v-model="searchText">
          <i class="el-icon-search el-input__icon"
             slot="prefix"></i>
        </el-input>
      </div>
      <ul class="user-list">
        <!-- 用户信息 -->
        <li class="user-list-info"
            @click="showRight({title:'个人信息',routeName:'UserInfo'})">
          <div class="user-list-info-img">
            <img :src="userInfo.headImage"
                 alt="">
          </div>
          <div class="user-list-info-text">
            <span class="user-list-info-text-name">{{ userInfo.nickName }}</span>
            <span>ID:{{ userInfo.userName }}</span>
          </div>
        </li>
        <div class="li-box"
             v-for="(item,index) in menuList"
             :key="index"
             @click="showRight(item)">
          <li :class="['user-list-item',item.title === title ? 'item-click' :'']">
            <div class="user-list-item-left">
              <span class="icon"></span>
              <span class="title">{{ item.title }}</span>
            </div>
            <div class="user-list-item-right">
              <i class="el-icon-arrow-right"
                 v-if="item.title !== title"></i>
            </div>
          </li>
          <div class="line"
               v-if="item.id === 4 || item.id === 10 || item.id === 12">
            <el-divider></el-divider>
          </div>
        </div>
      </ul>
      <NavBar />
    </el-aside>
    <el-container class="user-box bg">
      <div class="user-container">
        <router-view></router-view>
      </div>
    </el-container>
    <el-dialog title="退出登录"
               :visible.sync="quitModal"
               width="360px"
               :before-close="handleClose">
      <div class="quit-modal">
        <span>你确定要退出当前账号吗？</span>
      </div>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="quitModalClose">取 消</el-button>
        <el-button type="primary"
                   @click="quitModalConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </el-container>
</template>


<script>
import NavBar from "../components/navBar/index.vue";
import { pinyin } from 'pinyin-pro';

export default {
  name: "group",
  components: {
    NavBar
  },
  data () {
    return {
      searchText: "",
      title: null,
      menuList: [
        {
          id: 1,
          title: '收藏',
          routeName: 'Collect'
        },
        {
          id: 2,
          title: '我的表情包',
          routeName: 'Emoji'
        },
        {
          id: 3,
          title: '我的设备',
          routeName: 'Equipment'
        },
        {
          id: 4,
          title: '我的朋友圈',
          routeName: 'Pyq'
        },
        {
          id: 5,
          title: '设置',
          routeName: 'Setting'
        },
        {
          id: 6,
          title: '消息与通知',
          routeName: 'Inform'
        },
        {
          id: 7,
          title: '隐私与权限',
          routeName: 'Privacy'
        },
        {
          id: 8,
          title: '数据存储',
          routeName: 'Storage'
        },
        {
          id: 9,
          title: '界面设置',
          routeName: 'Interface'
        },
        {
          id: 10,
          title: '语言设置',
          routeName: 'Language'
        },
        {
          id: 11,
          title: '关于IM',
          routeName: 'InRegardTo'
        },
        {
          id: 12,
          title: '退出登录',
          routeName: 'Quit'
        }
      ],
      quitModal: false,
      backShow: false
    };
  },
  methods: {
    handleClose (done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done();
        })
        .catch(_ => { });
    },
    quitModalClose () {
      this.quitModal = false;
    },
    quitModalConfirm () {
      this.onExit()
      this.quitModal = false;
    },
    showRight (item) {
      if (item.routeName === 'Quit') {
        this.quitModal = true
      } else {
        // 判断路由页面是否存在
        if (item.routeName === 'Equipment' || item.routeName === 'Privacy' || item.routeName === 'Blacklist' || item.routeName === 'UserInfo' || item.routeName === 'Pyq') {
          this.title = item.title
          this.$router.push({
            name: item.routeName
          })
        } else {
          this.$message.error('该功能正在开发中...')
        }
      }
    },
    //....
    firstLetter (strText) {
      // 使用pinyin-pro库将中文转换为拼音
      let pinyinOptions = {
        toneType: 'none', // 无声调
        type: 'normal' // 普通拼音
      };
      let pyText = pinyin(strText, pinyinOptions);
      return pyText[0];
    },
    //...
    isEnglish (character) {
      return /^[A-Za-z]+$/.test(character);
    },
    onExit () {
      this.$wsApi.close(3000);
      window.electronStore.removeItem("accessToken");
      let userInfo = this.userStore.userInfo;
      let userList = window.electronStore.getItem("userNameList") ? JSON.parse(window.electronStore.getItem("userNameList")) : [];
      if (userList && userList.length > 0) {
        // 如果用户列表中已经存在该用户，则删除
        for (let i = 0; i < userList.length; i++) {
          if (userList[i].phone === userInfo.phone || userList[i].email === userInfo.email) {
            userList.splice(i, 1);
            break;
          }
        }
        // 将当前用户添加到列表的最前面
        userList.unshift({ img: userInfo.headImage, phone: userInfo.phone, email: userInfo.email })
      } else {
        userList.push({ img: userInfo.headImage, phone: userInfo.phone, email: userInfo.email })
      }
      window.electronStore.setItem("userNameList", JSON.stringify(userList));
      location.href = "/";
    },
    back () {
      this.$router.go(-1);
    }
  },
  // watch: {
  //   $route: {
  //     handler (to, from) {
  //       const toHomeUser = to?.fullPath === '/home/user';
  //       const fromHomeUser = from?.fullPath === '/home/user';

  //       this.backShow = !(toHomeUser || fromHomeUser);

  //       console.log('路由发生变化', to, from);
  //       console.log('从：', from?.fullPath);
  //       console.log('到：', to?.fullPath);
  //     },
  //     immediate: true,
  //     deep: false
  //   }
  // },
  computed: {
    userInfo () {
      return this.userStore.userInfo
    },
    // ...
    // 搜索
    groupMap () {
      // 按首字母分组
      let map = new Map();
      this.groupStore.groups.forEach((g) => {
        if (g.quit || (this.searchText && !g.showGroupName.includes(this.searchText))) {
          return;
        }
        let letter = this.firstLetter(g.showGroupName).toUpperCase();
        // 非英文一律为#组
        if (!this.isEnglish(letter)) {
          letter = "#"
        }
        if (map.has(letter)) {
          map.get(letter).push(g);
        } else {
          map.set(letter, [g]);
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
    }
  }
}
</script>

<style lang="scss">
  .user-page {
    .divider {
      border-bottom: 1px #ddd solid;
      margin: 10px;
    }
    .el-dialog__footer {
      display: flex;
      align-items: center;
      justify-content: center;
      .dialog-footer {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-evenly;
      }
    }
    .user-box {
      width: 70%;
      display: flex;
      flex-direction: column;
      background: #fff;

      .user-header {
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 20px 10px 20px;
        .search-text {
          width: 100%;
          height: 32px;
          border: none;
          background-color: #f1f1f1;
          border-radius: 4px;
        }
        .el-input__inner {
          border: 0px !important;
          background-color: #f1f1f1;
          border-radius: 4px;
        }
      }

      .user-list {
        flex: 1;
        width: 100%;
        height: calc(100% - 96px);
        padding: 0px;
        margin: 0px;
        box-sizing: border-box;
        overflow-y: auto;
        li {
          width: 100%;
          height: 40px;
          list-style: none;
          padding: 0 20px;
          box-sizing: border-box;
          cursor: pointer;
          .title {
            font-size: 14px;
            font-weight: 700;
          }
        }
        .item-click,
        li:hover {
          background-color: #e2e9fc;
        }
        .line {
          width: 100%;
          padding: 0 20px 0 40px;
          box-sizing: border-box;
        }
        .user-list-info {
          width: 100%;
          height: 80px;
          display: flex;
          align-items: center;
          .user-list-info-img {
            width: 60px;
            height: 60px;
            border-radius: 30px;
            overflow: hidden;
            img {
              width: 100%;
              height: 100%;
            }
          }
          .user-list-info-text {
            height: 100%;
            margin-left: 10px;
            font-size: 12px;
            color: #999;
            display: flex;
            align-items: flex-start;
            flex-direction: column;
            justify-content: center;
            .user-list-info-text-name {
              font-size: 16px;
              font-weight: 700;
              margin-bottom: 10px;
              color: #000;
            }
          }
        }
        .user-list-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          .user-list-item-left {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            .icon {
              width: 12px !important;
              height: 12px !important;
              margin-right: 10px;
            }
          }
          .icon {
            width: 12px;
            height: 12px;
          }
        }
        .li-box:nth-child(2) {
          .icon {
            background: url("../assets/icon/user/collect-icon.png") no-repeat
              center;
            background-size: 100%;
          }
        }
        .li-box:nth-child(3) {
          .icon {
            background: url("../assets/icon/user/emoji-icon.png") no-repeat center;
            background-size: 100%;
          }
        }
        .li-box:nth-child(4) {
          .icon {
            background: url("../assets/icon/user/equipment-icon.png") no-repeat
              center;
            background-size: 100%;
          }
        }
        .li-box:nth-child(5) {
          .icon {
            background: url("../assets/icon/user/pyq-icon.png") no-repeat center;
            background-size: 100%;
          }
        }
        .li-box:nth-child(6) {
          .icon {
            background: url("../assets/icon/user/set-icon.png") no-repeat center;
            background-size: 100%;
          }
        }
        .li-box:nth-child(7) {
          .icon {
            background: url("../assets/icon/user/inform-icon.png") no-repeat
              center;
            background-size: 100%;
          }
        }
        .li-box:nth-child(8) {
          .icon {
            background: url("../assets/icon/user/privacy-icon.png") no-repeat
              center;
            background-size: 100%;
          }
        }
        .li-box:nth-child(9) {
          .icon {
            background: url("../assets/icon/user/storage-icon.png") no-repeat
              center;
            background-size: 100%;
          }
        }
        .li-box:nth-child(10) {
          .icon {
            background: url("../assets/icon/user/interface-icon.png") no-repeat
              center;
            background-size: 100%;
          }
        }
        .li-box:nth-child(11) {
          .icon {
            background: url("../assets/icon/user/language-icon.png") no-repeat
              center;
            background-size: 100%;
          }
        }
        .li-box:nth-child(12) {
          .icon {
            background: url("../assets/icon/user/in_regard_to-icon.png") no-repeat
              center;
            background-size: 100%;
          }
        }
        .li-box:nth-child(13) {
          .icon {
            background: url("../assets/icon/user/quit-icon.png") no-repeat center;
            background-size: 100%;
          }
        }
      }
    }
    .user-box {
      display: flex;
      flex-direction: column;
      background-color: white;
      .user-header {
        width: 100%;
        height: 50px;
        display: flex;
        justify-content: center;
        padding: 0 12px;
        font-size: var(--im-font-size-larger);
        border-bottom: var(--im-border);
        font-weight: 700;
        box-sizing: border-box;
        position: relative;
        .back {
          height: 100%;
          color: #3066ec;
          position: absolute;
          left: 20px;
          top: 12px;
          font-weight: normal;
          cursor: pointer;
        }
      }

      .el-divider--horizontal {
        margin: 16px 0;
      }

      .user-container {
        overflow: auto;
        flex: 1;
      }
    }
    .bg {
      background: linear-gradient(
        270deg,
        #ffffff 0%,
        rgba(224, 232, 251, 0.5) 100%
      ) !important;
    }
  }
  .quit-modal {
    width: 100%;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
