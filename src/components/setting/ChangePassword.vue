<template>
  <div class="change-password">
    <el-form :model="form"
             :rules="rules"
             size="small"
             ref="form"
             label-width="80px">
      <el-form-item label="旧密码"
                    prop="oldPassword"
                    size="small">
        <el-input v-model="form.oldPassword"
                  type="password"></el-input>
      </el-form-item>
      <el-form-item label="新密码"
                    prop="newPassword"
                    size="small">
        <el-input v-model="form.newPassword"
                  type="password"></el-input>
      </el-form-item>
      <div class="btn-group">
        <el-button type="primary"
                   @click="onSubmit()">提 交</el-button>
      </div>
    </el-form>
  </div>
</template>
<script>
import { changePassword } from '@/api/user';
export default {
  data () {
    return {
      form: {
        oldPassword: '',
        newPassword: ''
      },
      rules: {
        oldPassword: [
          { required: true, message: '请输入旧密码', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度在6到20个字符之间', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    onSubmit () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          changePassword(this.form).then(() => {
            this.$message({
              message: '修改密码成功',
              type: 'success'
            });
            this.form.oldPassword = '';
            this.form.newPassword = '';
            this.$wsApi.close(3000);
            sessionStorage.removeItem("accessToken");
            location.href = "/";
          }).catch(err => {
            this.$message.error(err);
          });
        } else {
          return false;
        }
      });
    }
  }
}
</script>
<style scoped lang="scss">
  .change-password {
    padding: 10px 0 0 10px;
    .btn-group {
      text-align: center;
    }
  }
</style>