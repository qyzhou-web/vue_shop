<template>
  <div class="login-container">
    <div class="login-box">
      <div class="logo">
        <img src="../assets/logo.png" alt />
      </div>
      <div class="from">
        <div>
          <el-form label-width="0px" :model="userInfo" :rules="loginRules" ref="loginRef">
            <el-form-item prop="username">
              <el-input prefix-icon="el-icon-user-solid" v-model="userInfo.username"></el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input prefix-icon="el-icon-s-goods" type="password" v-model="userInfo.password"></el-input>
            </el-form-item>
          </el-form>
        </div>
        <div class="btns">
          <el-button type="primary" plain @click="beforeLogin">登录</el-button>
          <el-button type="info" plain @click="resetPassword">重置</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      userInfo: {
        username: 'admin',
        password: '123456'
      },
      loginRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 16, message: '长度在 3 到 16个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    resetPassword() {
      this.$refs.loginRef.resetFields()
    },
    beforeLogin() {
      this.$refs.loginRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('login', this.userInfo)
        if (res.meta.status !== 200) return this.$message.error('登录失败')
        this.$message.success('登录成功')
        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login-container {
  background-color: #2b4b6b;
  height: 100%;
}
.login-box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto auto;
  border-radius: 3px;
}
.logo {
  height: 130px;
  width: 130px;
  position: absolute;
  border: 1px solid #eee;
  padding: 10px;
  border-radius: 50%;
  box-shadow: 0 0 10px #ddd;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
}
.logo img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #eee;
}
.from {
  position: absolute;
  width: 100%;
  bottom: 20px;
  padding: 0 20px;
  box-sizing: border-box;
}
.btns {
  display: flex;
  justify-content: flex-end;
}
</style>

