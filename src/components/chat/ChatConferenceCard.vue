<template>
  <div class="chat-user-card"
       @click.stop="onShowUserInfo">
    <div class="card-body"
         v-if="groupInfo">
      <img :src="groupInfo.headImageThumb ? groupInfo.headImageThumb : groupInfo.headImage"
           alt="">
      <div class="nick-name"
           v-if="sendMemberInfo">
        <span>{{ sendMemberInfo.showNickName }}</span>
        <span>邀请你加入会议</span>
      </div>
    </div>
    <div class="card-tip">会议邀请</div>
  </div>
</template>
<script>

export default {
  props: {
    sendUserId: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {}
  },
  methods: {
    onShowUserInfo (e) {
      this.$http({
        url: `/jitsi/meet/auth/${this.groupInfo.id}`,
        method: 'GET'
      }).then(url => {
        const meetUrl = encodeURIComponent(url)
        const width = Math.floor(window.screen.availWidth * 0.8)
        const height = Math.floor(window.screen.availHeight * 0.8)
        const left = Math.floor((window.screen.availWidth - width) / 2)
        const top = Math.floor((window.screen.availHeight - height) / 2)
        const features = `width=${width},height=${height},left=${left},top=${top},resizable=yes,menubar=no,location=no,status=no,toolbar=no`
        window.open(`/jitsi.html?url=${meetUrl}`, '_blank', features)
      })
    },
  },
  computed: {
    groupInfo () {
      return this.groupStore.groupInfo;
    },
    currentGroupMember () {
      return this.groupStore.currentGroupMember;
    },
    sendMemberInfo () {
      let info = this.groupStore.currentGroupMember.filter(member => member.userId == this.sendUserId)[0]
      return info
    },
  },

}
</script>
<style scoped lang="scss">
  .chat-user-card {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    box-shadow: var(--im-box-shadow-light);
    border-radius: 10px;
    padding: 8px 15px;
    height: 80px;
    width: 180px;
    cursor: pointer;
    background-color: #409eff;
    .card-body {
      flex: 1;
      display: flex;
      align-items: center;
      border-bottom: 2px solid #eee;
      img {
        width: 42px;
        height: 42px;
        border-radius: 10%;
      }
      .nick-name {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        margin-left: 8px;
        font-weight: 600;
        font-size: var(--im-font-size);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: #fff;
      }
    }

    .card-tip {
      margin-top: 4px;
      color: #fff;
      font-size: var(--im-font-size-smaller);
      text-align: left;
    }
  }
</style>
