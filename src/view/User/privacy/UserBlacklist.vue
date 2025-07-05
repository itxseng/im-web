<template>
  <div class="blacklist">
    <div class="header">
      <div class="back"
           @click="back">
        <i class="el-icon-arrow-left"></i>
        <span>返回</span>
      </div>
      <div class="user-header-title">
        黑名单
      </div>
    </div>
    <div class="content">
      <ul class="content-box"
          v-if="blacklist && blacklist.length > 0">
        <li v-for="(item, index) in blacklist"
            :key="index">
          <div class="left">
            <div class="left-img">
              <img :src="item.headImageThumb"
                   alt="">
            </div>
            <div class="left-info">
              <span class="name">{{ item.nickName }}</span>
              <span class="id">{{ item.toUserId }}</span>
            </div>
          </div>
          <div class="right">
            <el-button type="danger"
                       icon="el-icon-delete"
                       @click="unblacklist(item.toUserId)">移除</el-button>
          </div>
        </li>
      </ul>
      <div class="no-data"
           v-else>
        <NoDataTip />
      </div>
    </div>
  </div>
</template>
<script>
import NoDataTip from '@/components/common/NoDataTip'
export default {
  components: {
    NoDataTip
  },
  data () {
    return {
      blacklist: [],
      loading: false
    }
  },
  methods: {
    back () {
      this.$router.back()
    },
    getBlacklist () {
      const loading = this.$loading({
        target: '.blacklist',
        lock: true,
        text: '加载中...',
        spinner: 'el-icon-loading',
        background: 'rgb(0 0 0 / 16%);'
      });
      this.$http({
        url: `/blacklist/list?page=${1}&size=${1000}`,
        method: 'GET'
      }).then((data) => {
        console.log('黑名单数据:', data);
        this.blacklist = data || []
        loading.close();
      })
    },
    unblacklist (userId) {
      this.chatStore.removeBlacklist(userId)
        .then(() => {
          this.$message.success('已移出黑名单');
          this.getBlacklist()
        })
    }
  },
  mounted () {
    // 页面加载时可以添加一些初始化逻辑
    this.getBlacklist()
  }
}
</script>
<style lang="scss" scoped>
  .blacklist {
    width: 100%;
    height: 100%;
    .header {
      width: 100%;
      height: 50px;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0 12px;
      font-size: var(--im-font-size-larger);
      border-bottom: var(--im-border);
      font-weight: 700;
      box-sizing: border-box;
      position: relative;
      .back {
        display: flex;
        align-items: center;
        font-size: var(--im-font-size-larger);
        color: #3066ec;
        font-weight: normal;
        position: absolute;
        left: 20px;
        cursor: pointer;
      }
    }
    .content {
      width: 100%;
      padding: 20px;
      box-sizing: border-box;
      .content-box {
        width: 100%;
        // height: 100%;
        background-color: white;
        padding: 0px;
        margin: 0px;
        border-radius: 4px;
        padding: 10px 10px;
        box-sizing: border-box;
        li {
          width: 100%;
          height: 70px;
          padding: 0 10px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #dcdfe6;
          .left {
            flex: 1;
            display: flex;
            .left-img {
              width: 50px;
              height: 50px;
              border-radius: 50%;
              overflow: hidden;
              img {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }
            }
            .left-info {
              margin-left: 10px;
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: flex-start;
            }
          }
          .right {
            width: 100px;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: flex-end;
          }
        }
        li:last-child {
          border-bottom: none;
        }
        li:hover {
          background-color: #658efe;
        }
      }
    }
  }
</style>