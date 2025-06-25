<template>
  <div class="user-privacy">
    <div class="header-title">
      <span>隐私与权限</span>
    </div>
    <div class="privacy">
      <div class="title">
        <span>隐私</span>
      </div>
      <ul class="container">
        <div class="container-box"
             v-for="item in privacySetList"
             :key="item.id">
          <li>
            <div class="left">
              <span>{{item.lable}}</span>
            </div>
            <div class="right">
              <span>所有人</span>
              <i class="el-icon-arrow-right"></i>
            </div>
          </li>
        </div>
      </ul>
    </div>
    <div class="blacklist">
      <div class="title">
        <span>黑名单</span>
      </div>
      <ul class="container">
        <div class="container-box"
             @click="goTo('Blacklist')">
          <li>
            <div class="left">
              <span>黑名单</span>
            </div>
            <div class="right">
              <i class="el-icon-arrow-right"></i>
            </div>
          </li>
        </div>
      </ul>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      privacySetList: [
        {
          id: 1,
          lable: '最后上线时间'
        },
        {
          id: 2,
          lable: '通话'
        },
        {
          id: 3,
          lable: '电话号码'
        },
        {
          id: 4,
          lable: '群组/频道'
        },
        {
          id: 5,
          lable: '消息'
        },
        {
          id: 6,
          lable: '头像'
        },
      ],
      blackList: []
    }
  },
  methods: {
    goTo (route) {
      this.$router.push({
        name: route
      });
      switch (route) {
        case 'Blacklist':
          // this.$store.commit('setUserPageTitle', '黑名单')
          break;
      }
    }
  }
}
</script>
<style lang="scss" scoped>
  .user-privacy {
    width: 100%;
    height: 100%;
    .header-title {
      width: 100%;
      height: 50px;
      padding: 0 20px;
      box-sizing: border-box;
      border-bottom: 1px solid #e5e5e5;
      font-size: 18px;
      color: #33333390;
      display: flex;
      align-items: center;
    }
    ul {
      margin: 0px;
      padding: 0px;
    }
    .blacklist,
    .privacy {
      width: 100%;
      padding: 0 20px;
      box-sizing: border-box;
      min-height: 75px;
      .title {
        width: 100%;
        height: 25px;
        padding: 5px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        color: #33333390;
        box-sizing: border-box;
      }
      .container {
        width: 100%;
        min-height: 50px;
        background-color: white;
        border-radius: 4px;
        padding: 0 20px;
        box-sizing: border-box;
        .container-box {
          width: 100%;
          border-bottom: 1px solid #dcdfe6;
          li {
            width: 100%;
            height: 50px;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            .right {
              height: 100%;
              display: flex;
              align-items: center;
              span {
                margin-right: 5px;
              }
            }
          }
        }
        .container-box:last-child {
          border-bottom: none;
        }
      }
    }
  }
  .user-privacy > div {
    margin-bottom: 15px;
  }
  .user-privacy > div:last-child {
    margin-bottom: 0px;
  }
</style>