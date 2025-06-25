<template>
  <div class="friend-request-item">
    <div class="friend-avatar">
      <head-image :size="40"
                  :id="friend.id"
                  :name="friend.nickName"
                  :url="friend.HeadImage"></head-image>
    </div>
    <div class="request-info">
      <div class="nick-name">
        <div class="nick-name-text">{{ friend.nickName }}</div>
        <div class="nick-name-tip"
             v-if="type === 'receive'">请求加为好友</div>
      </div>
      <div class="info-text">
        <div v-if="request.remark"><span>留言：</span>{{ request.remark }}</div>
        <div v-else-if="isSender">请求添加对方为好友</div>
        <div v-else>请求添加您为好友</div>
      </div>
    </div>
    <div class="btn-group">
      <div v-if="!isSender"
           class="btn-group-box">
        <el-button type="primary"
                   size="mini"
                   @click="onApprove"
                   v-if="friend.status == 1">同意</el-button>
        <el-button type="danger"
                   size="mini"
                   @click="onReject"
                   v-if="friend.status == 1">拒绝</el-button>
        <span class="status"
              v-if="friend.status == 2">已同意</span>
        <span class="status"
              v-if="friend.status == 3">已拒绝</span>
        <span class="status"
              v-if="friend.status == 4">已撤回</span>
        <span class="status"
              v-if="friend.status == 5">已过期</span>
      </div>
      <div class="btn-group-box"
           v-if="isSender">
        <el-button type="danger"
                   size="mini"
                   @click="onRecall"
                   v-if="friend.status == 1">撤回</el-button>
        <span class="status"
              v-if="friend.status == 2">对方已同意</span>
        <span class="status"
              v-if="friend.status == 3">对方已拒绝</span>
        <span class="status"
              v-if="friend.status == 4">申请已撤回</span>
        <span class="status"
              v-if="friend.status == 5">申请已过期</span>
      </div>
    </div>
  </div>
</template>

<script>
import HeadImage from '../common/HeadImage.vue';

export default {
  name: "frinedRequestItem",
  components: {
    HeadImage
  },
  data () {
    return {
      newFriend: this.request
    }
  },
  methods: {
    onApprove () {
      this.$http({
        url: "/friend/request/approve?id=" + this.request.id,
        method: 'post'
      }).then(() => {
        // this.friendStore.removeRequest(this.request.id);
        this.friendStore.updateNewFriend()
        this.$message.success(`${this.request.sendNickName} 已成为您的好友`);
      })
    },
    onReject () {
      this.$http({
        url: "/friend/request/reject?id=" + this.request.id,
        method: 'post'
      }).then(() => {
        // this.friendStore.removeRequest(this.request.id);
        this.friendStore.updateNewFriend()
        this.$message.success(`您拒绝了 ${this.request.sendNickName} 的好友请求`);
      })
    },
    onRecall () {
      this.$http({
        url: "/friend/request/recall?id=" + this.request.id,
        method: 'post'
      }).then(() => {
        // this.friendStore.removeRequest(this.request.id);
        this.friendStore.updateNewFriend()
        this.$message.success(`您撤回了 ${this.request.recvNickName} 的添加好友请求`);
      })
    }
  },
  props: {
    request: {
      type: Object,
      default () {
        return {}
      }
    },
    type: {
      type: String
    }
  },
  computed: {
    mine () {
      return this.userStore.userInfo;
    },
    isSender () {
      // 我是否发起方
      return this.request.sendId == this.mine.id;
    },
    friend () {
      if (this.isSender) {
        return {
          id: this.request.recvId,
          nickName: this.request.recvNickName,
          HeadImage: this.request.recvHeadImage,
          // 1:未处理 2:同意 3:拒绝 4:过期
          status: this.request.status
        }
      } else {
        return {
          id: this.request.sendId,
          nickName: this.request.sendNickName,
          HeadImage: this.request.sendHeadImage,
          status: this.request.status
        }
      }
    }
  }

}
</script>

<style scope lang="scss">
  .friend-request-item {
    width: 100%;
    height: 70px;
    display: flex;
    position: relative;
    align-items: center;
    white-space: nowrap;
    cursor: pointer;
    padding: 15px 20px;
    box-sizing: border-box;
    background-color: white;
    border-radius: 4px;
    margin-bottom: 15px;
    .request-info {
      height: 40px;
      margin-left: 10px;
      flex: 3;
      display: flex;
      justify-content: space-around;
      flex-direction: column;
      flex-shrink: 0;
      overflow: hidden;

      .nick-name {
        display: flex;
        align-items: center;
        font-weight: 600;
        font-size: 12px;
        color: #3066ec;
        .nick-name-tip {
          color: #000;
          margin-left: 5px;
        }
      }

      .info-text {
        display: flex;
        font-size: 12px;
        text-align: left;
        color: #999999;
      }
    }
  }
  .btn-group {
    display: flex;
    .btn-group-box {
      display: flex;
    }
    .el-button {
      width: 70px;
      height: 24px;
      line-height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .status {
      font-size: 12px;
      color: #999999;
      line-height: 24px;
    }
  }
</style>
