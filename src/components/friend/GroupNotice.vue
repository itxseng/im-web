<template>
  <div class="group-notice">
    <div class="title">群通知</div>
    <ul class="content"
        v-if="groupStoreNotice && groupStoreNotice.length > 0">
      <li class="content-item"
          v-for="(group, i) in groupStoreNotice"
          :key="i">
        <div class="content-item-info">
          <div class="content-item-info-img">
            <img :src="group.headImage"
                 alt="">
          </div>
          <div class="content-item-info-text">
            <p>{{group.name}}（999+）</p>
          </div>
        </div>
        <div class="content-item-text">
          <p>{{group.notice}}</p>
        </div>
        <div class="content-item-else">
          <div class="content-item-else-time">2025/05/24</div>
          <div class="content-item-else-more">更多详情</div>
        </div>
      </li>
    </ul>
    <div class="no-data"
         v-else>
      <NoDataTip />
    </div>
  </div>
</template>
<script>
import NoDataTip from '../common/NoDataTip';
export default {
  components: {
    NoDataTip
  },
  data () {
    return {

    }
  },
  computed: {
    groupStoreNotice () {
      let arr = []
      this.groupStore.groups.forEach(group => {
        if (group.notice) {
          arr.push(group)
        }
      })
      return arr;
    }
  }
}
</script>
<style lang="scss" scoped>
  .group-notice {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    .title {
      height: 50px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 12px;
      font-size: var(--im-font-size-larger);
      border-bottom: var(--im-border);
      box-sizing: border-box;
      font-weight: 700;
      padding: 0 20px;
    }
    .content {
      width: 100%;
      height: calc(100% - 50px);
      padding: 0px 20px;
      margin: 20px 0px !important;
      overflow-y: auto;
      box-sizing: border-box;
      .content-item {
        width: 100%;
        min-height: 70px;
        background: white;
        margin-bottom: 15px;
        padding: 15px 20px;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        border-radius: 4px;
        .content-item-info {
          width: 70%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          .content-item-info-img {
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
          .content-item-info-text {
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
        .content-item-text {
          width: 100%;
          color: #999;
          font-size: 12px;
          text-align: left;
        }
        .content-item-else {
          width: 100%;
          font-size: 12px;
          color: #999;
          display: flex;
          align-items: center;
          justify-content: space-between;
          .content-item-else-more {
            cursor: pointer;
            color: #3066ec;
          }
        }
      }
      .content-item:last-child {
        margin-bottom: 0px !important;
      }
    }
    .no-data {
      width: 100%;
      height: calc(100% - 50px);
      padding: 0px 20px;
      margin: 20px 0px !important;
      overflow-y: auto;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
</style>
