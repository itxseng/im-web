<template>
  <div class="chat-common-group">
    <div class="title">
      <i class="el-icon-arrow-left"
         style="cursor: pointer;"
         @click="returnInfo"></i>
      <p>共同加入的群</p>
    </div>
    <ul class="content"
        v-if="commonGroupList && commonGroupList.length > 0">
      <li v-for="(item,index) in commonGroupList"
          :key="index"
          @click="onSendMessage(item)">
        <div class="content-img">
          <img :src="item.headImageThumb"
               alt="">
        </div>
        <div class="content-text">{{item.name}}</div>
      </li>
    </ul>
    <NoDataTip v-else />
  </div>
</template>
<script>
import NoDataTip from '@/components/common/NoDataTip.vue'
export default {
  components: {
    NoDataTip
  },
  data () {
    return {

    }
  },
  props: {
    commonGroupList: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  methods: {
    returnInfo () {
      this.$emit('returnInfo')
    },
    onSendMessage (group) {
      let chat = {
        type: 'GROUP',
        targetId: group.id,
        showName: group.remarkGroupName ? group.remarkGroupName : group.name,
        headImage: group.headImageThumb,
      };
      this.chatStore.openChat(chat);
      this.chatStore.setActiveChat(group.id);
      this.$emit('infoClose', false)
      // this.$router.push("/home/chat");
    }
  }
}
</script>
<style lang="scss" scoped>
  .chat-common-group {
    width: 100%;
    padding-top: 6px;
    .title {
      width: 100%;
      padding: 0 20px;
      height: 35px;
      color: #000000;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
      p {
        flex: 1;
        text-align: center;
      }
    }
    ul {
      width: 100%;
      margin: 0px !important;
      padding: 0px !important;
      max-height: 450px;
      overflow-y: auto;
      li {
        width: calc(100% - 40px);
        height: 50px;
        padding: 0 20px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        cursor: pointer;
        .content-img {
          width: 35px;
          height: 35px;
          border-radius: 20px;
          background: cadetblue;
          overflow: hidden;
          img {
            width: 100%;
            height: 100%;
          }
        }
        .content-text {
          flex: 1;
          height: calc(100% - 1px);
          margin-left: 10px;
          font-size: 14px;
          color: #000000;
          border-bottom: 1px solid #d9d9d9;
          display: flex;
          justify-content: flex-start;
          align-items: center;
        }
      }
      li:hover {
        background: #f5f5f5;
      }
    }
  }
</style>