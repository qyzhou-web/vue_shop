<template>
  <div class="user">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="40">
        <el-col :span="12">
          <el-input
            v-model="queryInfo.query"
            clearable
            placeholder="请输入内容"
            class="input-with-select"
            @clear="getUserList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <el-table :data="userlist" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row.id)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="编辑" placement="top" :enterable="false">
              <el-button
                type="primary"
                icon="el-icon-edit"
                circle
                size="mini"
                @click="editUserInfo(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="删除" placement="top" :enterable="false">
              <el-button
                type="danger"
                icon="el-icon-delete"
                circle
                size="mini"
                @click="deleteUserInfo(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                circle
                size="mini"
                @click="distribeRoles(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 3, 4]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <el-dialog title="提示" :visible.sync="dialogVisible" width="50%" @close="resetFormData">
      <el-form :model="addUserInfo" :rules="addUserRules" ref="userRef" label-width="70px">
        <el-form-item label="用户名称" prop="username">
          <el-input v-model="addUserInfo.username"></el-input>
        </el-form-item>
        <el-form-item label="用户密码" prop="password">
          <el-input v-model="addUserInfo.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserInfo.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addUserInfo.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUserMessage">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户信息的对话框 -->
    <el-dialog title="修改用户信息" :visible.sync="editDialogVisible" width="50%">
      <el-form
        :model="editUserdata"
        :rules="editUserdataRules"
        ref="editUserRefs"
        label-width="70px"
        @close="editUserClosed"
      >
        <el-form-item label="用户名称">
          <el-input v-model="editUserdata.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="用户邮箱" prop="email">
          <el-input v-model="editUserdata.email"></el-input>
        </el-form-item>
        <el-form-item label="用户电话" prop="mobile">
          <el-input v-model="editUserdata.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogClick">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      @close="clearRoledata"
      :visible.sync="distributeRolesVisible"
      width="50%"
    >
      <div>
        <p>
          当前的用户
          <span>{{usersInfo.username}}</span>
        </p>
        <p>
          当前的角色
          <span>{{usersInfo.role_name}}</span>
        </p>
        <p>
          分配新角色
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in roleInfoList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="distributeRolesVisible = false">取 消</el-button>
        <el-button type="primary" @click="distributeRolesMethod">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getUserList()
  },
  data() {
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^1\d{10}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }

    return {
      distributeRolesVisible: false,
      dialogVisible: false,
      editDialogVisible: false,
      editUserdata: {},
      editUserdataRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { min: 3, max: 30, message: '长度在 3 到 16个字符', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          { min: 3, max: 30, message: '长度在 3 到 16个字符', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 4
      },
      userlist: [],
      total: 0,
      addUserInfo: {
        username: '',
        password: '',
        email: ''
      },

      addUserRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 30, message: '长度在 3 到 16个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { min: 3, max: 30, message: '长度在 3 到 16个字符', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          { min: 3, max: 30, message: '长度在 3 到 16个字符', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      usersInfo: {},
      roleInfoList: [],
      selectedRoleId: ''
    }
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      this.userlist = res.data.users
      this.total = res.data.total
    },
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize
      this.getUserList()
    },
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum
      this.getUserList()
    },
    async userStateChange(userInfo) {
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功')
    },
    resetFormData() {
      this.$refs.userRef.resetFields()
    },
    addUserMessage() {
      this.$refs.userRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('users', this.addUserInfo)
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        this.dialogVisible = false
        this.getUserList()
      })
    },
    async editUserInfo(id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('用户查询失败')
      }

      this.editUserdata = res.data
      this.editDialogVisible = true
    },
    editUserClosed() {
      this.$refs.editUserRefs.resetFields()
    },
    editDialogClick() {
      this.$refs.editUserRefs.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          'users/' + this.editUserdata.id,
          { email: this.editUserdata.email, mobile: this.editUserdata.mobile }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('更新用户失败')
        }
        this.editDialogVisible = false

        this.getUserList()
        this.$message.success('更新用户成功')
      })
    },
    async deleteUserInfo(id) {
      const res = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(error => error)
      if (res !== 'confirm') {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      } else {
        const { data: res } = await this.$http.delete('users/' + id)
        if (res.meta.status !== 200) return this.$message.error('用户删除失败')

        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.getUserList()
      }
    },
    async distribeRoles(role) {
      this.usersInfo = role
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('请求角色失败')
      this.roleInfoList = res.data
      this.distributeRolesVisible = true
    },
    async distributeRolesMethod() {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色')
      }
     
      
      const { data: res } = await this.$http.put(
        `users/${this.usersInfo.id}/role`,
        {
          rid: this.selectedRoleId
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('分配角色失败')
      }
      this.$message.success('分配角色成功')
      this.getUserList()
      this.distributeRolesVisible = false
    },
    clearRoledata() {
      this.selectedRoleId = '';
      this.usersInfo = {}
    }
  }
}
</script>

<style>
</style>