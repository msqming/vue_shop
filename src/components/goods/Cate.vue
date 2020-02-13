<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加区域 -->
      <el-row :gutter="20">
        <el-col :span="4">
          <el-button @click="showAddCateDialog" type="primary">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 用户表格区域 -->
      <tree-table
        class="tree-table"
        :data="cateList"
        :columns="cloumns"
        :selection-type="false"
        :expand-type="false"
        :show-index="true"
        index-text="#"
        border>
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success"
             style="color: lightgreen"
             v-if="scope.row.cat_deleted === false">
          </i>
          <i class="el-icon-error"
             style="color: red"
             v-else>
          </i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
          <el-tag v-else type="warning">三级</el-tag>
        </template>
        <template slot="operate" slot-scope="scope">
          <!-- 修改按钮 -->
          <el-button @click="showEditDialog(scope.row)"
                     type="primary"
                     icon="el-icon-edit"
                     size="mini">
            编辑
          </el-button>
          <!-- 删除按钮 -->
          <el-button @click="removeUser(scope.row.id)"
                     type="danger"
                     icon="el-icon-delete"
                     size="mini">
            删除
          </el-button>
        </template>
      </tree-table>
      <!-- 表格分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="this.queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="this.queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="this.total">
      </el-pagination>
    </el-card>
    <!-- 添加分类对话框区域 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed">
      <!-- 添加分类的表单 -->
      <el-form :model="addCateForm"
               :rules="addCateFormRules"
               ref="addCateFormRef"
               label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- options:数据源,props:指定配置对象 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChange"
            :clearable="true"
            ref="addCateCascaderRef">
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'Cate',
    data () {
      return {
        // 查询条件
        queryInfo: {
          type: 3,
          pagenum: 1,
          pagesize: 5
        },
        // 商品分类数据
        cateList: [],
        // 总条数
        total: 0,
        // 表格指定列的定义
        cloumns: [
          {
            label: '分类名称',
            prop: 'cat_name'
          },
          {
            label: '是否有效',
            // 表示当前列定义为模板列
            type: 'template',
            // 表示当前这一列使用的模板名称
            template: 'isok'
          },
          {
            label: '排序',
            type: 'template',
            template: 'order'
          },
          {
            label: '操作',
            type: 'template',
            template: 'operate'
          }
        ],
        // 控制添加分类对话框的显示与隐藏
        addCateDialogVisible: false,
        // 添加分类表单的数据对象
        addCateForm: {
          cat_name: '',
          // 父级id
          cat_pid: 0,
          // 分类的等级，默认是一级
          cat_level: 0
        },
        // 表单数据的验证规则
        addCateFormRules: {
          cat_name: [
            {
              required: true,
              message: '分类名称不能为空',
              trigger: 'blur'
            },
            {
              min: 3,
              max: 9,
              message: '长度在 3 到 9 个字符',
              trigger: 'blur'
            }
          ]
        },
        // 父级分类列表数据
        parentCateList: [],
        // 指定级联选择器的配置对象
        cascaderProps: {
          expandTrigger: 'hover',
          checkStrictly: true,
          value: 'cat_id',
          label: 'cat_name',
          children: 'children'
        },
        // 选中父级分类的ID数据
        selectedKeys: []
      }
    },
    created () {
      this.getCateList()
    },
    methods: {
      // 发起请求获取商品分类数据
      async getCateList () {
        const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品分类数据失败')
        }
        this.cateList = res.data.result
        this.total = res.data.total
      },
      // 监听 pageSize 改变的事件
      handleSizeChange (newSize) {
        // console.log(newSize)
        this.queryInfo.pagesize = newSize
        this.getCateList()
      },
      // 监听 页码值 改变的事件
      handleCurrentChange (newPage) {
        // console.log(newPage)
        this.queryInfo.pagenum = newPage
        this.getCateList()
      },
      // 点击按钮，展示添加分类的对话框
      showAddCateDialog () {
        // 获取父级分类的数据列表
        this.getParentCateList()
        this.addCateDialogVisible = true
      },
      // 获取父级分类的数据列表
      async getParentCateList () {
        const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取父级列表失败')
        }
        console.log(res.data)
        this.parentCateList = res.data
      },
      // 选择项发生变化的事件
      parentCateChange () {
        // 如果 res 数组中的 length 大于0，说明选中的父级分类
        // 反之，则没有选中
        // 获取选中的节点
        const res = this.$refs.addCateCascaderRef.getCheckedNodes()
        // console.log(res.length)
        // console.log(res[0])
        if (res.length > 0) {
          // 父级分类的ID
          this.addCateForm.cat_pid = res[0].value
          // 为当前父类的等级赋值
          this.addCateForm.cat_level = res[0].level
          return true
        } else {
          this.addCateForm.cat_pid = 0
          this.addCateForm.cat_level = 0
        }
      },
      // 点击完成新的添加分类
      addCate () {
        // console.log(this.addCateForm)
        this.$refs.addCateFormRef.validate(async valid => {
          if (!valid) return this.$message.error('信息验证错误')
          const { data: res } = await this.$http.post('categories', this.addCateForm)
          console.log(res)
          if (res.meta.status !== 201) {
            this.$message.error('添加分类失败！')
          }
          this.$message.success('添加分类成功')
          this.getCateList()
          this.addCateDialogVisible = false
        })
      },
      // 监听关闭添加分类对话框的事件
      addCateDialogClosed () {
        this.$refs.addCateFormRef.resetFields()
        this.selectedKeys = []
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    }
  }
</script>

<style lang="less" scoped>
  .tree-table {
    margin-top: 15px;
    font-size: 12px;
  }

  .el-cascader {
    width: 100%;
  }
</style>
