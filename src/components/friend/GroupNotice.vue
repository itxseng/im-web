<template>
  <div class="friend-request"
       ref="reqTabs">
    <div class="title">{{ title }}</div>
    <div class="content">
      <div class="content-btn">
        <div :class="['content-btn-application',isShow ? 'active' : '']"
             @click="cut('application')">群通知({{applicationCount}})</div>
        <div :class="['content-btn-send',isShow ? '' : 'active']"
             @click="cut('announcement')">群公告({{groupAnnouncement.length}})</div>
      </div>
      <div class="content-container">
        <div class="content-container-application"
             v-if="isShow && applicationCount > 0">
          <GroupApplication :myApplicationList="myApplicationList"
                            @updateMyApplicationList="updateMyApplicationList" />
        </div>
        <div class="content-container-announcement"
             v-else-if="!isShow && groupAnnouncement.length">
          <div class="list"
               v-for="group in groupAnnouncement"
               :key="group.id">
            <div class="content-container-announcement-info">
              <div class="content-container-announcement-info-img">
                <img :src="group.headImage"
                     alt="">
              </div>
              <div class="content-container-announcement-info-text">
                <p>{{group.name}}（{{group.membersCount ? group.membersCount : 1}}）</p>
              </div>
            </div>
            <div class="content-container-announcement-text">
              <p>{{group.notice}}</p>
            </div>
            <div class="content-container-announcement-else">
              <div class="content-container-announcement-else-time">{{ group.noticePublishTime }}</div>
            </div>
          </div>
        </div>
        <no-data-tip v-else
                     class="no-data-tip"></no-data-tip>
      </div>
    </div>
  </div>
</template>

<script>
import NoDataTip from '../common/NoDataTip.vue'
import FriendRequestItem from './FriendRequestItem.vue'
import GroupApplication from '../group/GroupApplication.vue'
export default {
  name: "friendRequest",
  components: { NoDataTip, FriendRequestItem, GroupApplication },
  data () {
    return {
      tabPaneHeight: 600,
      isShow: true,
      title: '群通知',
      myApplicationList: []
    }
  },
  methods: {
    cut (type) {
      switch (type) {
        case 'application':
          this.title = '群通知'
          this.isShow = true
          break;
        case 'announcement':
          this.title = '群公告'
          this.isShow = false
          break;
      }
    },
    myApplication () {
      this.$http({
        url: '/group/join/my_requests',
        method: 'GET'
      }).then((res) => {
        this.myApplicationList = res
      })
    },
    updateMyApplicationList () {
      this.myApplication()
    }
  },
  computed: {
    applicationCount () {
      return this.myApplicationList.length + this.groupsApplication.length
    },
    groupsApplication () {
      return this.groupStore.groupsApplication;
    },
    mine () {
      return this.userStore.userInfo;
    },
    sendRequests () {
      let requests = this.friendStore.requests;
      return requests.filter((req) => req.sendId == this.mine.id);
    },
    tabPaneStyle () {
      return `height:${this.tabPaneHeight}px`;
    },
    groupAnnouncement () {
      let arr = []
      this.groupStore.groups.forEach(group => {
        if (group.notice) {
          arr.push(group)
        }
      })
      return arr;
    }
  },
  mounted () {
    this.tabPaneHeight = this.$refs.reqTabs.offsetHeight - 80;
    this.myApplication()
  }
}
</script>

<style scoped lang="scss">
  .friend-request {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    .tabs {
      flex: 1;
    }
  }
  .title {
    height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--im-font-size-larger);
    border-bottom: var(--im-border);
    box-sizing: border-box;
    font-weight: 700;
    padding: 0 20px;
    box-sizing: border-box;
  }
  .content {
    width: 100%;
    height: calc(100% - 50px);
    padding: 0px 20px;
    margin: 20px 0px !important;
    overflow-y: auto;
    box-sizing: border-box;
    .content-btn {
      width: 230px;
      height: 30px;
      background-color: #ebebeb;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      div {
        width: 110px;
        height: 24px;
        border-radius: 4px;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
      .active {
        background-color: white;
      }
      div:hover {
        background-color: white;
      }
    }
    .content-container {
      width: 100%;
      height: calc(100% - 50px);
      margin-top: 10px;
      box-sizing: border-box;
      .content-container-application,
      .content-container-announcement {
        .list:last-child {
          .list-item:last-child {
            margin-bottom: 0px;
          }
        }
      }
    }
    .content-container-announcement {
      width: 100%;
      min-height: 70px;
      margin-bottom: 15px;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      border-radius: 4px;
    }
    .list {
      width: 100%;
      margin-bottom: 10px;
      background: white;
      padding: 15px 20px;
      box-sizing: border-box;
      border-radius: 4px;
    }
    .content-container-announcement-info {
      width: 70%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      .content-container-announcement-info-img {
        width: 40px;
        height: 40px;
        // background: #ccc;
        border-radius: 20px;
        img {
          width: 100%;
          height: 100%;
          border-radius: 20px;
        }
      }
      .content-container-announcement-info-text {
        width: calc(100% - 50px);
        height: 40px;
        margin-left: 10px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        p {
          font-size: 12px;
          margin: 0px;
        }
      }
    }
    .content-container-announcement-text {
      width: 100%;
      color: #999;
      font-size: 12px;
      text-align: left;
    }
    .content-container-announcement-else {
      width: 100%;
      font-size: 12px;
      color: #999;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .content-container-announcement-else-more {
        cursor: pointer;
        color: #3066ec;
      }
    }
    .content-container-announcement:last-child {
      margin-bottom: 0px !important;
    }
  }

  ::v-deep .el-tabs {
    width: 100%;
    height: calc(100% - 50px);
    padding: 0px 20px;
    margin: 20px 0px !important;
    overflow-y: auto;
    box-sizing: border-box;
  }
  ::v-deep .el-tabs__header {
    border-bottom: none;
    position: relative;
  }
  .el-tab-pane-bg {
    width: 230px;
    height: 30px;
    background-color: red;
    position: absolute;
    top: 0px;
    z-index: 9999;
  }
  .no-data-tip {
    width: 100%;
    height: 100%;
  }
</style>