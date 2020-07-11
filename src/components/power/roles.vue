<template>
  <div class="reports">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary">获取角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
              :class="['botborder',i1===0?'topborder':'','center']"
            >
              <el-col :span="5">
                <el-tag closable @close="deleteRoledata(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                  :class="[i2===0? '':'topborder','center']"
                >
                  <el-col :span="6">
                    <el-tag
                      closable
                      type="success"
                      @close="deleteRoledata(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      closable
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      @close="deleteRoledata(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showRightList(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog title="展示用户权限" @close="clearRightId" :visible.sync="rightDialogVisible" width="50%">
      <el-tree
        :default-checked-keys="checkedKeys"
        default-expand-all
        node-key="id"
        show-checkbox
        :data="rightTreedata"
        :props="rightTreeProps"
        ref="rightTree"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="getrightDialogdata">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getRolesList()
  },
  data() {
    return {
      rolesList: [],
      rightDialogVisible: false,

      rightTreedata: [],
      rightTreeProps: { children: 'children', label: 'authName' },
      checkedKeys: [],
      roleId:''
    }
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200)
        return this.$message.error('获取角色数据失败')
      this.rolesList = res.data
    },
    async deleteRoledata(role, rightId) {
      const res1 = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(error => error)
      if (res1 !== 'confirm') {
        return this.$message.error('取消删除权限！')
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) return this.$message.error('删除权限失败！')
      role.children = res.data //role.children的children元素刚好是权限的数据，只更新一下权限的数据
      this.$message.success('删除权限成功！')
    },
    async showRightList(role) {
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取数据失败')
      this.roleId = role.id
      this.rightTreedata = res.data
      this.getRightTreeId(role, this.checkedKeys)
      this.rightDialogVisible = true
    },
    getRightTreeId(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getRightTreeId(item, arr)
      })
    },
    clearRightId() {
      this.checkedKeys = []
    },
  async getrightDialogdata() {
      const checkRightId = [
        ...this.$refs.rightTree.getCheckedKeys(),
        ...this.$refs.rightTree.getHalfCheckedKeys()
      ]
      const idStr = checkRightId.join(',')
     const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
     if(res.meta.status!==200)return this.$message.error('更新权限失败！')
     this.$message.success('更新权限成功')
      this.getRolesList()
      this.rightDialogVisible = false
      
    }
  }
}
</script>

<style lang="less" scoped>
.topborder {
  border-top: 1px solid #eee;
}
.botborder {
  border-bottom: 1px solid #eee;
}
.center {
  display: flex;
  align-items: center;
}
</style>