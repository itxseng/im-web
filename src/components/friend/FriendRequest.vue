<template>
  <div class="friend-request"
       ref="reqTabs">
    <div class="title">新的朋友</div>
    <div class="content">
      <div class="content-btn">
        <div :class="['content-btn-receive',isShow ? 'active' : '']"
             @click="cut('receive')">收到的申请({{recvRequests.length}})</div>
        <div :class="['content-btn-send',isShow ? '' : 'active']"
             @click="cut('send')">发起的申请({{sendRequests.length}})</div>
      </div>
      <div class="content-container">
        <div class="content-container-receive"
             v-if="isShow && recvRequests.length">
          <div class="list"
               v-for="request in recvRequests"
               :key="request.id">
            <friend-request-item :request="request"
                                 class="list-item"
                                 type="receive"
                                 v-if="request && request.status !== 4"></friend-request-item>
          </div>
        </div>
        <div class="content-container-send"
             v-else-if="!isShow && sendRequests.length">
          <div class="list"
               v-for="request in sendRequests"
               :key="request.id">
            <friend-request-item :request="request"
                                 class="list-item"
                                 type="send"
                                 v-if="request"></friend-request-item>
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

export default {
  name: "friendRequest",
  components: { NoDataTip, FriendRequestItem },
  data () {
    return {
      tabPaneHeight: 600,
      isShow: true
    }
  },
  methods: {
    cut (type) {
      switch (type) {
        case 'receive':
          this.isShow = true
          break;
        case 'send':
          this.isShow = false
          break;
      }
    }
  },
  computed: {
    mine () {
      return this.userStore.userInfo;
    },
    recvRequests () {
      let requests = this.friendStore.requests;
      return requests.filter((req) => req.recvId == this.mine.id);
    },
    sendRequests () {
      let requests = this.friendStore.requests;
      return requests.filter((req) => req.sendId == this.mine.id);
    },
    tabPaneStyle () {
      return `height:${this.tabPaneHeight}px`;
    }
  },
  mounted () {
    this.tabPaneHeight = this.$refs.reqTabs.offsetHeight - 80;
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
      margin-top: 20px;
      box-sizing: border-box;
      .content-container-receive,
      .content-container-send {
        .list:last-child {
          .list-item:last-child {
            margin-bottom: 0px;
          }
        }
      }
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
