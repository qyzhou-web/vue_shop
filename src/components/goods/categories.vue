<template>
  <div class="reports">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCategory">添加分类</el-button>
        </el-col>
      </el-row>
      <tree-table
        :data="categoriesList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        class="tree-table"
      >
        <template slot="isok" slot-scope="scope">
          <i style="color:green;" class="el-icon-success" v-if="scope.row.cat_deleted === false"></i>
          <i class="el-icon-error" v-else style="color:red;"></i>
        </template>
        <template slot="sort" slot-scope="scope">
          <el-tag size="mini" type v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <template slot="handle" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 3, 5, 8]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <el-dialog title="添加分类" @close="closeCategory" :visible.sync="addCateVisible" width="50%">
      <el-form
        ref="addCategoryRef"
        :model="addCategoryform"
        label-width="80px"
        :rules="addCategoryRules"
      >
        <el-form-item label="分类名称">
          <el-input v-model="addCategoryform.cat_name" prop="cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            clearable
            v-model="valueCatId"
            :options="parentCateList"
            :props="propsCate "
            @change="handleParentCateChange"
            size="mini"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleAddCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getCategoriesData()
  },
  data() {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      categoriesList: [],
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        ,
        {
          label: '排序',
          type: 'template',
          template: 'sort'
        },
        {
          label: '操作',
          type: 'template',
          template: 'handle'
        }
      ],
      addCateVisible: false,
      addCategoryform: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      addCategoryRules: { cat_name: { required: true } },
      parentCateList: [],
      propsCate: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      valueCatId: []
    }
  },
  methods: {
    async getCategoriesData() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200)
        return this.$message.error('获取商品参数失败！')
      this.categoriesList = res.data.result
      this.total = res.data.total
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCategoriesData()
    },
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getCategoriesData()
    },
    addCategory() {
      this.getParentCateList()
      this.addCateVisible = true
    },
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2
        }
      })
      if (res.meta.status !== 200)
        return this.$message.error('获取父级分类列表失败！')
      this.parentCateList = res.data
     
    },
    handleParentCateChange() {
     //console.log(this.valueCatId)
      if (this.valueCatId.length  > 0) {
        this.addCategoryform.cat_pid = this.valueCatId[
          this.valueCatId.length - 1
        ]
        this.addCategoryform.cat_level = this.valueCatId.length
      }else{
         this.addCategoryform.cat_pid = 0
         this.addCategoryform.cat_level = 0
      }
      
    },
   handleAddCate(){
 this.$refs.addCategoryRef.validate( async valid => {
   if(!valid) return 
  
   const {data:res} = await this.$http.post('categories',this.addCategoryform)
 if(res.meta.status !== 201) {
   return this.$message.error('添加分类失败')
 }
  this.addCateVisible = false
  this.getCategoriesData()
 this.$message.success('添加分类成功')

 })
      
      
    },
    closeCategory(){
      this.$refs.addCategoryRef.resetFields()
      this.valueCatId = [],
      this.addCategoryform.cat_name = ''
      this.addCategoryform.cat_pid = 0
      this.addCategoryform.cat_level = 0
    }
   

  }
}
</script>

<style lang="less" scoped>
.tree-table {
  margin-top: 20px;
}
</style>