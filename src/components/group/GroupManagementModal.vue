<template>
  <div class="group-Management">
    <div class="title">
      <p>管理群组</p>
    </div>
    <div class="content">
      <ul>
        <li @click="openModal('edit')">
          <span class="icon group-edit-icon"></span>
          <span>编辑群组</span>
        </li>
        <li @click="openModal()"
            v-if="isOwner">
          <span class="icon group-astrict-icon"></span>
          <span>限制</span>
        </li>
        <li @click="openModal('admin')">
          <span class="icon group-admin-icon"></span>
          <span>管理员</span>
        </li>
        <li @click="openModal()">
          <span class="icon group-blacklist-icon"></span>
          <span>黑名单</span>
        </li>
        <li @click="openModal('makeOver')">
          <span class="icon group-make_over-icon"></span>
          <span>转让群</span>
        </li>
      </ul>
    </div>
    <div class="bottom">
      <el-button @click="onClose"
                 type="text">取消</el-button>
    </div>
    <el-dialog :visible.sync="dialogModal"
               width="350px"
               :show-close="false"
               :append-to-body="true"
               :destroy-on-close="true">
      <GroupEditModal v-if="dialogModalType === 'edit' && dialogModal"
                      :groupInfo="groupInfo"
                      @close="onClose"
                      @updateGroupData="updateGroupData" />
      <AddGroupMember :groupId="groupInfo.id"
                      :members="groupMembers"
                      :appendToBody="true"
                      @reload="updateGroupData" />
      <GroupAdmin v-if="dialogModalType === 'admin' && dialogModal"
                  @close="onClose"
                  @updateGroupData="updateGroupData" />
    </el-dialog>
    <AddGroupPersonnelModal ref="addGroupPersonnelRef"
                            :title="'转让群主'"
                            @updateGroupData="updateGroupData"
                            @close="onClose" />
  </div>
</template>
<script>
export default {
  components: {
    AddGroupMember: () => import('@/components/group/AddGroupMember.vue'),
    GroupEditModal: () => import('@/components/group/GroupEditModal.vue'),
    GroupAdmin: () => import('@/components/group/GroupAdmin.vue'),
    AddGroupPersonnelModal: () => import('@/components/group/AddGroupPersonnelModal.vue'),
  },
  props: {
    groupInfo: {
      type: Object,
      default: () => { }
    },
    groupMembers: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      dialogModal: false,
      dialogModalType: ''
    }
  },
  methods: {
    onClose () {
      this.$emit('close');
    },
    openModal (type) {
      if (type === 'makeOver') {
        this.$refs.addGroupPersonnelRef.open()
      } else {
        this.dialogModalType = type;
        this.dialogModal = true;
      }
    },
    updateGroupData () {
      this.$emit('updateGroupData')
    }
  },
  computed: {
    mine () {
      return this.userStore.userInfo;
    },
    isOwner () {
      return this.groupInfo.ownerId == this.mine.id;
    }
  }
}
</script>
<style lang="scss" scoped>
  .group-Management {
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
        width: 100%;
        height: 35px;
        color: #999;
        font-size: 20px;
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
      ul {
        width: 100%;
        display: flex;
        justify-content: flex-start;
        flex-direction: column;
        align-items: flex-start;
        padding: 0px;
        li {
          width: 100%;
          height: 40px;
          font-size: 16px;
          padding: 0px 20px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          cursor: pointer;
          .icon {
            width: 16px;
            height: 16px;
            margin-right: 10px;
          }
          .group-edit-icon {
            background: url("~@/assets/icon/group/group-edit-icon.png") no-repeat
              center;
            background-size: 100%;
          }
          .group-astrict-icon {
            background: url("~@/assets/icon/group/group-astrict-icon.png")
              no-repeat center;
            background-size: 100%;
          }
          .group-admin-icon {
            background: url("~@/assets/icon/group/group-admin-icon.png") no-repeat
              center;
            background-size: 100%;
          }
          .group-blacklist-icon {
            background: url("~@/assets/icon/group/group-blacklist-icon.png")
              no-repeat center;
            background-size: 100%;
          }
          .group-make_over-icon {
            background: url("~@/assets/icon/group/group-make_over-icon.png")
              no-repeat center;
            background-size: 100%;
          }
        }
        li:hover {
          background-color: #ededed;
        }
      }
    }
    .bottom {
      width: 100%;
      display: flex;
      justify-content: flex-end;
    }
  }
  ::v-deep .el-dialog__header {
    padding: 0px !important;
  }
</style>