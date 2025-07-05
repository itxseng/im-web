<template>
  <el-dialog class="group-add"
             :visible.sync="dialogModal"
             width="360px"
             :show-close="false"
             :append-to-body="true"
             :destroy-on-close="true">
    <div class="group-add">
      <div class="title">
        <p>{{ title }}</p>
      </div>
      <div class="search">
        <el-input placeholder="搜索"
                  v-model="searchText">
          <i slot="prefix"
             class="el-input__icon el-icon-search"></i>
        </el-input>
      </div>
      <div class="content">
        <ul class="content-show"
            v-if="searchText == '' && searchText.trim() == ''">
          <template v-for="(item,index) in currentGroupMember">
            <li :key="index"
                v-if="currentGroupMemberType(item)"
                @click="showPermissions(item)">
              <div class="li-img">
                <img :src="item.headImage"
                     alt="">
              </div>
              <div class="li-text">
                <p class="name">{{item.showNickName}}</p>
                <p :class="['time',item.online ? 'is-online' : '']">{{showTime(item)}}</p>
              </div>
              <el-radio class="li-radio"
                        :label="item.userId"
                        v-model="radio"
                        @click.native.stop
                        v-if="title === '转让群主'">
              </el-radio>
            </li>
          </template>
        </ul>
        <ul class="content-search"
            v-else>
          <div v-for="(item, index) in filteredMembers"
               :key="index">
            <li v-if="filteredMembers && filteredMembers.length > 0 "
                @click="showPermissions(item)">
              <div class="li-img">
                <img :src="item.headImage"
                     alt="">
              </div>
              <div class="li-text">
                <p class="name">{{ item.showNickName }}</p>
                <p :class="['time', item.online ? 'is-online' : '']">{{ showTime(item) }}</p>
              </div>
              <el-radio class="li-radio"
                        :label="item.userId"
                        v-model="radio"
                        @click.native.stop
                        v-if="title === '转让群主'">
              </el-radio>
            </li>
          </div>
          <div v-if="filteredMembers.length === 0"
               class="no-result">未找到匹配的成员</div>
        </ul>
      </div>
      <div class="bottom">
        <el-button @click="onClose"
                   type="text">取消</el-button>
        <el-button @click="onSave"
                   type="text">保存</el-button>
      </div>
      <GroupManagementPermissionsModal ref="permissionsModalRef"
                                       :title="'管理权限'"
                                       @close="onClose"
                                       @updateGroupData="updateGroupData"
                                       v-if="title === '添加管理员'" />
    </div>
  </el-dialog>
</template>
<script>
export default {
  components: {
    GroupManagementPermissionsModal: () => import('./GroupManagementPermissionsModal.vue')
  },
  props: {
    title: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      searchText: '',
      dialogModal: false,
      radio: ''
    }
  },
  methods: {

    showPermissions (item) {
      if (this.title === '添加管理员') {
        this.$refs.permissionsModalRef.open(item);
      } else {
        this.radio = item.userId
      }
    },
    open () {
      this.dialogModal = true;
    },
    // 取消按钮
    onClose () {
      this.searchText = ''
      this.radio = ''
      this.dialogModal = false;
      this.$emit('close');
    },
    onSave () {
      let data = {
        groupId: this.currentGroupInfo.id,
        userId: this.radio
      }
      this.$http({
        url: '/group/transfer',
        method: 'PUT',
        data
      }).then(() => {
        this.$message.success('转让成功')
        this.updateGroupData()
      })
    },
    updateGroupData () {
      this.searchText = ''
      this.radio = ''
      this.dialogModal = false;
      this.$emit('updateGroupData');
    },
    showTime (item) {
      return item.online ? '在线' : this.$date.toTimeText(item.lastOnlineTime, true, true);
    },
    currentGroupMemberType (item) {
      if (this.title === '添加管理员') {
        return item.userId != this.currentGroupInfo.ownerId && !item.isManager
      } else if (this.title === '转让群主') {
        return item.userId != this.currentGroupInfo.ownerId
      }
      // return this.groupStore.currentGroupMemberInfo;
    },
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
  .group-add {
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
    .search {
      width: 100%;
      height: 35px;
      background-color: #f7f7f7;
      border-radius: 4px;
      margin-top: 10px;
      ::v-deep .el-input {
        width: 100%;
        height: 100%;
        .el-input__inner {
          height: 100%;
          border: none;
          background-color: #f7f7f7;
          // padding-left: 10px;
        }
        .el-input__prefix {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .el-input__icon {
          line-height: 35px;
        }
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
      .content-search,
      .content-show {
        width: 100%;
        min-height: 300px;
        max-height: 500px;
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
          cursor: pointer;
          position: relative;
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
          }
          .li-radio {
            position: absolute;
            right: 10px;
            ::v-deep .el-radio__label {
              display: none;
            }
          }
          .is-online {
            color: #47ad47 !important;
          }
        }
        .no-result {
          width: 100%;
          height: 100%;
          display: flex;
          color: #999;
          align-items: center;
          justify-content: center;
        }
      }
    }
    .bottom {
      width: 100%;
      display: flex;
      justify-content: flex-end;
    }
    ::v-deep .el-dialog__header {
      padding: 0px !important;
    }
    ::v-deep .el-dialog__body {
      padding: 10px !important;
    }
  }
</style>