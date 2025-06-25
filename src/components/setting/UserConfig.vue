<template>
  <div class="user-config">
    <el-switch v-model="userInfo.isManualApprove"
               inactive-text="加我为好友时需要验证"
               @change="onManualApproveChange"></el-switch>
    <el-divider></el-divider>
    <div class="user-config-radio">
      <div>谁能邀请我入群：</div>
      <el-form ref="form"
               :model="form">
        <el-form-item label="类型：">
          <el-radio-group v-model="form.groupPermStatus">
            <el-radio :label="1">所有人</el-radio>
            <el-radio :label="2">联系人</el-radio>
            <el-radio :label="3">不允许</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="谁可以邀请我："
                      v-if="form.groupPermStatus === 2">
          <el-select v-model="form.groupPermYesUser"
                     filterable
                     multiple
                     placeholder="请选择">
            <el-option v-for="item in friends"
                       :key="item.value"
                       :label="item.label"
                       :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="谁不能邀请我："
                      v-if="form.groupPermStatus === 2">
          <el-select v-model="form.groupPermNoUser"
                     filterable
                     multiple
                     placeholder="请选择">
            <el-option v-for="item in friends"
                       :key="item.value"
                       :label="item.label"
                       :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="text-align: center;">
          <el-button type="primary"
                     @click="onSubmit"
                     style="width: 80px;">提交</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
export default {
  name: "userConfig",
  data () {
    return {
      userInfo: {
        isManualApprove: false,
      },
      form: {
        groupPermStatus: 1,
        groupPermNoUser: [],
        groupPermYesUser: [],
      },
      friends: [],
    }
  },
  mounted () {
    console.log('this.userStore.userInfo', this.userStore.userInfo);
    this.form.groupPermStatus = this.userStore.userInfo.groupPermStatus;
    this.friendStore.friends.forEach(item => {
      this.friends.push({
        value: item.id,
        label: item.nickName
      });
    });
  },
  methods: {
    init () {
      let mine = this.userStore.userInfo;
      this.userInfo = JSON.parse(JSON.stringify(mine));
    },
    onManualApproveChange () {
      this.$http({
        url: "/user/manualApprove?enabled=" + this.userInfo.isManualApprove,
        method: 'put'
      }).then(() => {
        this.userStore.loadUser();
        this.$message.success(`您${this.userInfo.isManualApprove ? '开启' : '关闭'}了好友审核验证`);
      })
    },
    onSubmit () {
      let queryData = {
        groupPermYesUser: '',
        groupPermNoUser: '',
        groupPermStatus: this.form.groupPermStatus,
        id: this.userStore.userInfo.id,
        userName: this.userStore.userInfo.userName,
        nickName: this.userStore.userInfo.nickName
      }
      if (this.form.groupPermStatus === 2) {
        if (this.form.groupPermYesUser && this.form.groupPermYesUser.length > 0) {
          queryData.groupPermYesUser = this.form.groupPermYesUser.join(",");
        }
        if (this.form.groupPermNoUser && this.form.groupPermNoUser.length > 0) {
          queryData.groupPermNoUser = this.form.groupPermNoUser.join(",");
        }
      }
      this.$http({
        url: "/user/update",
        method: "put",
        data: queryData
      }).then(() => {
        this.form = {
          groupPermStatus: 1,
          groupPermNoUser: [],
          groupPermYesUser: [],
        }
        this.$message.success("修改成功");
        this.userStore.loadUser();
      })
    }
  },
}
</script>
<style scoped lang="scss">
  .user-config {
    padding: 20px;
  }
  .user-config-radio {
    margin-top: 20px;
  }
</style>
