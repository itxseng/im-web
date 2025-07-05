<template>
  <div class="group-admin">
    <div class="title">
      <p>管理员</p>
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
          v-if="searchText == ''">
        <li v-for="(item,index) in currentGroupMember"
            :key="index"
            @click="showPermissions(item)">
          <div class="li-img">
            <img :src="item.headImage"
                 alt="">
          </div>
          <div class="li-text">
            <p class="name">{{item.showNickName}}</p>
            <i class="el-icon-delete"
               v-if="item.userId !== currentGroupInfo.ownerId || item.userId !== currentGroupInfo.ownerId && !item.canAddAdmin"
               @click.stop="deleteAdmin(item)"></i>
            <div>
              <p class="time"
                 v-if="item.userId === currentGroupInfo.ownerId">群主</p>
              <p class="time"
                 v-else>管理员</p>
            </div>
          </div>
        </li>
      </ul>
      <ul class="content-search"
          v-else>
        <div v-for="(item, index) in filteredMembers"
             :key="index">
          <li v-if="filteredMembers && filteredMembers.length > 0"
              @click="showPermissions(item)">
            <div class="li-img">
              <img :src="item.headImage"
                   alt="">
            </div>
            <div class="li-text">
              <p class="name">{{ item.showNickName }}</p>
              <i class="el-icon-delete"
                 v-if="item.userId !== currentGroupInfo.ownerId || item.userId !== currentGroupInfo.ownerId && !item.canAddAdmin"
                 @click.stop="deleteAdmin(item)"></i>
              <div>
                <p class="time"
                   v-if="item.userId === currentGroupInfo.ownerId">群主</p>
                <p class="time"
                   v-else>管理员</p>
              </div>
            </div>
          </li>
        </div>
        <div v-if="filteredMembers.length === 0"
             class="no-result">未找到匹配的成员</div>
      </ul>
    </div>
    <div class="bottom">
      <el-button @click="addGroupAdmin"
                 type="text">添加管理员</el-button>
      <el-button @click="onClose"
                 type="text">关闭</el-button>
    </div>
    <AddGroupPersonnelModal ref="addGroupPersonnelRef"
                            :title="'添加管理员'"
                            @updateGroupData="updateGroupData"
                            @close="onClose" />
    <GroupManagementPermissionsModal ref="permissionsModalRef"
                                     :title="'管理权限'"
                                     @updateGroupData="updateGroupData"
                                     @close="onClose" />
  </div>
</template>
<script>
export default {
  components: {
    AddGroupPersonnelModal: () => import('./AddGroupPersonnelModal.vue'),
    GroupManagementPermissionsModal: () => import('./GroupManagementPermissionsModal.vue')
  },
  props: {
  },
  data () {
    return {
      searchText: '',
      permissionFrom: {
        groupId: null,
        userId: null,
        // 编辑权限
        canEditGroupInfo: false,
        // 删除权限
        canDeleteMessage: false,
        // 封禁权限
        canBanUser: false,
        // 链接邀请权限
        canInviteUser: false,
        // 置顶权限
        canPinMessage: false,
        // 新增群管理权限
        canAddAdmin: false
      }
    }
  },
  methods: {
    // 取消按钮
    onClose () {
      this.$emit('close');
    },
    // 打开新增群成员模态框
    addGroupAdmin () {
      this.$refs.addGroupPersonnelRef.open();
    },
    // 打开权限模态框
    showPermissions (item) {
      this.$refs.permissionsModalRef.open(item);
    },
    // 删除管理员
    deleteAdmin (item) {
      this.permissionFrom.groupId = this.currentGroupInfo.id;
      this.permissionFrom.userId = item.userId;
      this.$http({
        url: '/group/modifyManagerPerm',
        method: 'PUT',
        data: this.permissionFrom
      }).then(() => {
        this.$message.success('删除成功')
        this.updateGroupData()
      })
    },
    updateGroupData () {
      console.log('????');

      this.$emit('updateGroupData');
    }
  },
  computed: {
    currentGroupMember () {
      return this.groupStore.currentGroupMember.filter(member => !member.quit && member.isManager || member.userId === this.currentGroupInfo.ownerId);
    },
    currentGroupInfo () {
      return this.groupStore.groupInfo;
    },
    filteredMembers () {
      if (!this.searchText.trim()) return [];
      const text = this.searchText.trim().toLowerCase();
      return this.currentGroupMember.filter(item =>
        item.showNickName && item.showNickName.toLowerCase().includes(text)
      );
    }
  }
}
</script>
<style lang="scss" scoped>
  .group-admin {
    width: 100%;
    padding-top: 6px;
    .title {
      width: 100%;
      height: 35px;
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
  }
</style>