<template>
  <div class="params">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert show-icon title="注意：只允许为第三级分类设置相关参数" type="warning" :closable="false"></el-alert>

      <el-row>
        <el-col>
          <span class="space">选择商品属性</span>
          <el-cascader
            clearable
            v-model="valueParamsId"
            :options="paramsList"
            :props="propsParams "
            @change="handleParentParamsChange"
            size="mini"
          ></el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleTabsClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addParams">添加参数</el-button>
          <el-table :data="manyParams" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item,i) in scope.row.attr_vals "
                  :key="i"
                  closable
                  @close="clearAttrdata(i,scope.row)"
                >{{item}}</el-tag>
                <el-input
                  class="el-input"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="editParamsOpen(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="deleteParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addParams">添加属性</el-button>
          <el-table :data="onlyParams" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item,i) in scope.row.attr_vals "
                  :key="i"
                  closable
                  @close="clearAttrdata(i,scope.row)"
                >{{item}}</el-tag>
                <el-input
                  class="el-input"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="mini"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="editParamsOpen(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="deleteParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <el-dialog
      :title="'请输入'+ paramsStr"
      :visible.sync="paramsStrDialogVisible"
      width="50%"
      @close="closeParamsForm"
    >
      <el-form
        :model="ParamsForm"
        :rules="ParamsRules"
        ref="ParamsRuleFormRef"
        label-width="70px"
        class="demo-ruleForm"
      >
        <el-form-item :label="paramsStr" prop="attr_name">
          <el-input v-model="ParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="paramsStrDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParamsClick">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑修改的对话框 -->
    <el-dialog
      :title="'请编辑'+ paramsStr"
      :visible.sync="editParamsStrDialogVisible"
      width="50%"
      @close="closeEditParamsForm"
    >
      <el-form
        :model="editParamsForm"
        :rules="editParamsRules"
        ref="editParamsRuleFormRef"
        label-width="70px"
        class="demo-ruleForm"
      >
        <el-form-item :label="paramsStr" prop="attr_name">
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editParamsStrDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParamsClick">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getcategoryParams()
  },
  data() {
    return {
      paramsList: [],
      propsParams: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      valueParamsId: [],
      activeName: 'many',
      onlyParams: [],
      manyParams: [],
      paramsStrDialogVisible: false,
      ParamsForm: { attr_name: '' },
      ParamsRules: {
        attr_name: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ]
      },
      //编辑对话框部分数据
      editParamsStrDialogVisible: false,
      editParamsForm: {},
      editParamsRules: {
        attr_name: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    async getcategoryParams() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200)
        return this.$message.error('获取参数信息出错')
      this.paramsList = res.data
    },
    //为了区分动态和静态合理利用了activename，因为这个属性可以跟着点击事件改变
    handleParentParamsChange() {
      this.getParentParamsChange()
    },
    handleTabsClick() {
      this.getParentParamsChange()
    },
    async getParentParamsChange() {
      if (this.valueParamsId.length !== 3) {
        this.valueParamsId = []
        // 清空表格数据
        this.onlyParams = []
        this.manyParams = []
        return
      }
      const { data: res } = await this.$http.get(
        `categories/${this.isCartId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      )
      //处理res.data中的attr_val参数字符串，让其变成数组方便遍历
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputVisible = false
        item.inputValue = ''
      })

      if (res.meta.status !== 200) return this.$message.error('请求参数错误')
      if (this.activeName === 'many') return (this.manyParams = res.data)
      this.onlyParams = res.data
    },
    addParams() {
      this.paramsStrDialogVisible = true
    },
    closeParamsForm() {
      this.$refs.ParamsRuleFormRef.resetFields()
    },
    addParamsClick() {
      this.$refs.ParamsRuleFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.isCartId}/attributes`,
          {
            attr_name: this.ParamsForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) {
          return
          this.$message.error('添加参数失败')
        }

        this.$message.success('添加参数成功')

        this.paramsStrDialogVisible = false
        this.getParentParamsChange()
      })
    },
    async editParamsOpen(id) {
      const { data: res } = await this.$http.get(
        `categories/${this.isCartId}/attributes/${id}`,
        {
          params: { attr_sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) {
        return
        this.$message.error('请求参数失败')
      }

      this.editParamsForm = res.data
      this.editParamsStrDialogVisible = true
    },
    closeEditParamsForm() {
      this.$refs.editParamsRuleFormRef.resetFields()
    },
    editParamsClick() {
      this.$refs.editParamsRuleFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.isCartId}/attributes/${this.editParamsForm.attr_id}`,
          {
            attr_name: this.editParamsForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 200) {
          return
          this.$message.error('编辑参数失败')
        }

        this.$message.success('编辑参数成功')

        this.editParamsStrDialogVisible = false
        this.getParentParamsChange()
      })
    },
    async deleteParams(id) {
      const confirmStr = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(error => error)
      if (confirmStr !== 'confirm') return this.$message.info('您取消了删除')
      const { data: res } = await this.$http.delete(
        `categories/${this.isCartId}/attributes/${id}`
      )
      if (res.meta.status !== 200) return this.message.error('删除参数失败！')
      this.getParentParamsChange()
    },
    handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      //记住push的返回值是新数组的长度，它会改变原数组，直接改就可以了
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrData(row)
    },
    clearAttrdata(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrData(row)
    },
    async saveAttrData(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.isCartId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: this.activeName,
          attr_vals: row.attr_vals.join(' ')
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败！')
      }
      this.$message.success('修改参数项成功！')
    },
    showInput(role) {
      role.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    }
  },
  computed: {
    isBtnDisabled() {
      if (this.valueParamsId.length !== 3) {
        return true
      }
      return false
    },
    isCartId() {
      if (this.valueParamsId.length === 3) return this.valueParamsId[2]
    },
    paramsStr() {
      if (this.activeName === 'many') return '动态参数'
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.el-alert {
  margin: 0px 0px 20px 0px;
}
.space {
  margin-right: 20px;
}
.el-input {
  width: 130px;
}
</style>