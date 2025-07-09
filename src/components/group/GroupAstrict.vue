<template>
  <el-dialog class="group-astrict"
             :visible.sync="dialogModal"
             width="360px"
             :show-close="false"
             :append-to-body="true"
             :destroy-on-close="true">
    <div class="group-astrict">
      <div class="title">
        <p>{{ title }}</p>
      </div>
      <div class="content">
        <div class="content-title">
          <span>限制的功能</span>
        </div>
        <ul>
          <li>
            <span>发送消息</span>
            <el-switch :value="!astrictData.isMuted"
                       @change="changeisSwitch('isMuted')"
                       active-color="#99B6FF"
                       inactive-color="#B1B1B1">
            </el-switch>
          </li>
          <li>
            <span>发送视频</span>
            <el-switch v-model="astrictData.isSendVideo"
                       @change="changeisSwitch('isSendVideo')"
                       active-color="#99B6FF"
                       inactive-color="#B1B1B1">
            </el-switch>
          </li>
          <li>
            <span>发送图片</span>
            <el-switch v-model="astrictData.isSendImage"
                       @change="changeisSwitch('isSendImage')"
                       active-color="#99B6FF"
                       inactive-color="#B1B1B1">
            </el-switch>
          </li>
          <li>
            <span>发送文件</span>
            <el-switch v-model="astrictData.isSendFile"
                       @change="changeisSwitch('isSendFile')"
                       active-color="#99B6FF"
                       inactive-color="#B1B1B1">
            </el-switch>
          </li>
        </ul>
        <div class="content-member">
          <div class="content-member-title">
            <div class="icon"
                 @click="showMemberList"></div>
            <span @click="showMemberList">添加群成员</span>
          </div>
          <ul class="content-member-container">
            <template v-if="memberList.length">
              <li v-for="(item,index) in memberList"
                  :key="index">
                <div class="li-img">
                  <img :src="item.headImage"
                       alt="">
                </div>
                <div class="li-text">
                  <p class="name">{{item.showNickName}}</p>
                  <i class="el-icon-delete"
                     v-if="item.userId !== currentGroupInfo.ownerId || item.userId !== currentGroupInfo.ownerId && !item.canAddAdmin"
                     @click.stop="deleteMember(item)"></i>
                  <div>
                    <p class="time"
                       v-if="item.userId === currentGroupInfo.ownerId">群主</p>
                    <p class="time"
                       v-else>管理员</p>
                  </div>
                </div>
              </li>
            </template>
            <li v-else
                class="list-tip">暂无群成员数据</li>
          </ul>
        </div>
      </div>
      <div class="bottom">
        <el-button @click="onClose"
                   type="text">取消</el-button>
        <el-button @click="onSave"
                   type="text">保存</el-button>
      </div>
    </div>
    <AddGroupPersonnelModal ref="addGroupPersonnelRef"
                            :title="'限制用户权限'"
                            @updateGroupData="updateGroupData"
                            @close="onClose" />
  </el-dialog>
</template>
<script>
export default {
  components: {
    AddGroupPersonnelModal: () => import('./AddGroupPersonnelModal.vue')
  },
  props: {
    title: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      dialogModal: false,
      message: false,
      astrictData: {
        type: 1, //1群  2成员
        groupId: 1,
        userId: null,
        isMuted: false, //是否开启全体禁言
        isSendImage: true, //是否可以发送图片
        isSendVideo: true, //是否可以发送视频
        isSendFile: true, //是否可以发送文件
        limitExpirationTime: 1 //限制到期时间
      },
      astrictMemberData: {
        type: 2, //1群  2成员
        groupId: 1,
        userId: null,
        isMuted: false, //是否开启全体禁言
        isSendImage: true, //是否可以发送图片
        isSendVideo: true, //是否可以发送视频
        isSendFile: true, //是否可以发送文件
        limitExpirationTime: 1 //限制到期时间
      },
      memberList: []
    }
  },
  methods: {
    getMemberList () {
      this.$http({
        url: `/group/restriction/${this.currentGroupInfo.id}`,
        method: 'GET'
      }).then(data => {
        this.memberList = data
      })
    },
    showMemberList () {
      this.$refs.addGroupPersonnelRef.open();
    },
    open () {
      this.setAstrictData();
      this.getMemberList()
      this.dialogModal = true;
    },
    // 取消按钮
    onClose () {
      this.dialogModal = false;
      // this.$emit('close');
    },
    onSave () {
      this.$http({
        url: '/group/modifySpeakPerm',
        method: 'PUT',
        data: this.astrictData
      }).then(() => {
        this.$message.success('操作成功')
        this.updateGroupData()
      })
    },
    setAstrictData () {
      this.astrictData = {
        type: 1, //1群  2成员
        groupId: this.currentGroupInfo.id,
        userId: null,
        isMuted: this.currentGroupInfo.isMuted, //是否开启全体禁言
        isSendImage: this.currentGroupInfo.isSendImage, //是否可以发送图片
        isSendVideo: this.currentGroupInfo.isSendVideo, //是否可以发送视频
        isSendFile: this.currentGroupInfo.isSendFile, //是否可以发送文件
        // limitExpirationTime: 1 //限制到期时间
      }
    },
    // 判断时间类型
    // currentGroupTimeType (time) {
    //   if (condition) {
    //     return item.type === 1;
    //   }
    // },
    updateGroupData () {
      this.dialogModal = false;
      this.$emit('updateGroupData');
    },
    showTime (item) {
      return item.online ? '在线' : this.$date.toTimeText(item.lastOnlineTime, true, true);
    },
    changeisSwitch (type) {
      switch (type) {
        case 'isMuted':
          this.astrictData.isMuted = !this.astrictData.isMuted;
          if (this.astrictData.isMuted) {
            this.astrictData.isSendImage = false
            this.astrictData.isSendVideo = false
            this.astrictData.isSendFile = false
          }
          break;
        case 'isSendImage':
          if (this.astrictData.isMuted) {
            this.astrictData.isSendImage = false
          }
          break;
        case 'isSendVideo':
          if (this.astrictData.isMuted) {
            this.astrictData.isSendVideo = false
          }
          break;
        case 'isSendFile':
          if (this.astrictData.isMuted) {
            this.astrictData.isSendFile = false
          }
          break;
      }
    },
    deleteMember (item) {
      console.log(item);
      this.astrictMemberData = {
        type: 2, //1群  2成员
        groupId: this.currentGroupInfo.id,
        userId: item.userId,
        isMuted: false, //是否开启全体禁言
        isSendImage: true, //是否可以发送图片
        isSendVideo: true, //是否可以发送视频
        isSendFile: true, //是否可以发送文件
      }
       this.$http({
        url: '/group/modifySpeakPerm',
        method: 'PUT',
        data: this.astrictMemberData
      }).then(() => {
        this.getMemberList()
        this.$message.success('操作成功')
      })
    }
  },
  computed: {
    currentGroupMember () {
      return this.groupStore.currentGroupMember.filter(member => !member.quit);
    },
    currentGroupInfo () {
      return this.groupStore.groupInfo;
    },
    filteredMembers () {
      if (!this.searchText.trim()) return [];
      const text = this.searchText.trim().toLowerCase();
      return this.currentGroupMember.filter(item => {
        if (this.currentGroupMemberType(item)) {
          return item.showNickName && item.showNickName.toLowerCase().includes(text)
        }
      });
    }
  },
}
</script>
<style lang="scss" scoped>
  .group-astrict {
    width: 100%;
    padding-top: 6px;
    .title {
      width: 100%;
      height: 35px;
      padding: 0 10px;
      color: #000000;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
      p {
        width: 100%;
        height: 35px;
        color: #999;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 0px;
      }
    }
    .content {
      width: 100%;
      box-sizing: border-box;
      overflow-y: auto;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: space-between;
      align-content: space-between;
      margin-top: 15px;
      margin-bottom: 5px;
      .content-member-title,
      .content-title {
        width: 100%;
        padding: 0 10px;
        height: 30px;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        color: #999;
        border-bottom: 1px solid #ededed;
      }
      .content-member-container,
      ul {
        width: 100%;
        overflow-y: auto;
        padding: 0px;
        margin: 0px;
        li {
          width: 100%;
          height: 50px;
          padding: 0 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-sizing: border-box;
          position: relative;
          border-bottom: 1px solid #ededed;
          &:hover {
            background-color: #ededed;
          }
        }
      }
      .content-member {
        width: 100%;
        max-height: 300px;
        margin-top: 20px;
        .content-member-title {
          display: flex;
          color: #096bff;
          span {
            cursor: pointer;
          }
        }
        .icon {
          width: 17px;
          height: 20px;
          background: url("../../assets/icon/group/add-members-hover-icon.png")
            no-repeat center;
          background-size: 100% 100%;
          margin-right: 5px;
          cursor: pointer;
        }
        .content-member-container {
          width: 100%;
          min-height: 50px;
          max-height: 500px;
          overflow-y: auto;
          li {
            width: 100%;
            height: 50px;
            padding: 0 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-sizing: border-box;
            cursor: pointer;
            &:hover {
              background-color: #ededed;
            }
            .li-img {
              width: 40px;
              height: 40px;
              border-radius: 20px;
              overflow: hidden;
              img {
                width: 100%;
                height: 100%;
              }
            }
            .li-text {
              width: calc(100% - 50px);
              height: 50px;
              border-bottom: 1px solid #f5f5f5;
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              justify-content: center;
              position: relative;
              p {
                margin: 0px;
                font-size: 12px;
              }
              .name {
                font-weight: 700;
              }
              .time {
                color: #999;
                margin-top: 5px;
                font-size: 10px;
              }
              .el-icon-delete {
                color: #999;
                font-size: 20px;
                position: absolute;
                right: 10px;
                &:hover {
                  color: red;
                }
              }
            }
            .is-online {
              color: #47ad47 !important;
            }
          }
        }
      }
    }
    .bottom {
      width: 100%;
      display: flex;
      justify-content: flex-end;
    }
    .list-tip {
      display: flex;
      align-items: center;
      justify-content: center !important;
      &:hover {
        background-color: #fff !important;
      }
    }
    ::v-deep .el-dialog__header {
      padding: 0px !important;
    }
    ::v-deep .el-dialog__body {
      padding: 10px !important;
    }
  }
</style>