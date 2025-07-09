<template>
  <div class="group-application">
    <div class="tab">
      <div :class="['tab-left',isShow ? 'active' : '']"
           @click="tabChange('left')">我收到的({{ groupsApplication.length }})</div>
      <div :class="['tab-right',isShow ? '' : 'active']"
           @click="tabChange('right')">我申请的({{ myApplicationList.length }})</div>
    </div>
    <div class="content">
      <ul v-if="isShow && groupsApplication && groupsApplication.length > 0">
        <li v-for="(group, i) in groupsApplication"
            :key="i">
          <div class="li-img">
            <img :src="group.userHeadImage"
                 alt="">
          </div>
          <div class="li-info">
            <div class="li-info-name">
              <span class="isColor">{{ group.userNickName }}</span>
              申请加入
              <span class="isColor">{{ group.groupName }}</span>
            </div>
            <div class="li-info-reason">
              留言：<span>{{ group.reason }}</span>
            </div>
          </div>
          <div class="li-btn">
            <div class="li-btn-first"
                 v-if="group.status === 0">
              <el-button size="mini"
                         @click="applicationBtn(group,'consent')">同意</el-button>
              <el-button size="mini"
                         @click="applicationBtn(group,'refuse')">拒绝</el-button>
            </div>
            <div class="li-btn-second"
                 v-else-if="group.status === 1">
              <span class="isColor">已同意</span>
            </div>
            <div class="li-btn-last"
                 v-else>
              <span class="isColor">已拒绝</span>
            </div>
          </div>
        </li>
      </ul>
      <ul v-else-if="!isShow && myApplicationList && myApplicationList.length > 0">
        <li v-for="(group, i) in myApplicationList"
            :key="i">
          <div class="li-img">
            <img :src="group.userHeadImage"
                 alt="">
          </div>
          <div class="li-info">
            <div class="li-info-name">
              申请加入
              <span class="isColor">{{ group.groupName }}</span>
            </div>
            <div class="li-info-reason">
              留言：<span>{{ group.reason }}</span>
            </div>
          </div>
          <div class="li-btn">
            <div class="li-btn-first"
                 v-if="group.status === 0">
              <span class="isColor">等待管理员审批</span>
            </div>
            <div class="li-btn-second"
                 v-else-if="group.status === 1">
              <span class="isColor">管理员已同意</span>
            </div>
            <div class="li-btn-last"
                 v-else>
              <span class="isColor">管理员已拒绝</span>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    myApplicationList: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      isShow: true
    }
  },
  methods: {
    tabChange (type) {
      this.isShow = type !== 'right';
    },
    applicationBtn (group, type) {
      let data = {
        requestId: group.id,
        status: type === 'consent' ? 1 : 2
      }
      this.$http({
        url: '/group/join/audit',
        method: 'PUT',
        data
      }).then(() => {
        this.groupStore.updateGroupsApplication(group,data.status)
        this.$message.success('操作成功')
        this.$emit('updateMyApplicationList')
      })
    }
  },
  computed: {
    groupsApplication () {
      return this.groupStore.groupsApplication;
    },
  }
}
</script>
<style lang="scss" scoped>
  .group-application {
    width: 100%;
    .tab {
      width: 200px;
      height: 30px;
      background-color: #ebebeb;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      div {
        width: 95px;
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
    .content {
      width: 100%;
      ul {
        width: 100%;
        margin: 0px;
        padding: 0px;
        li {
          width: 100%;
          height: 60px;
          background-color: #fff;
          display: flex;
          align-items: center;
          padding: 0px 10px;
          box-sizing: border-box;
          border-radius: 4px;
          margin-bottom: 10px;
          &:last-child {
            margin-bottom: 0px;
          }
          .li-img {
            width: 50px;
            height: 50px;
            border-radius: 25px;
            overflow: hidden;
            img {
              width: 100%;
              height: 100%;
            }
          }
          .li-info {
            width: calc(100% - 170px);
            height: 100%;
            padding: 0px 10px;
            box-sizing: border-box;
            font-size: 12px;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            .li-info-name {
              width: 100%;
              margin-bottom: 5px;
              text-align: left;
            }
            .li-info-reason {
              width: 100%;
              text-align: left;
              color: #999;
            }
          }
          .li-btn {
            width: 120px;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            .li-btn-first {
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
            }
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
  .isColor {
    color: #999;
    font-size: 12px;
  }
</style>