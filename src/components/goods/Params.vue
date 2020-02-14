<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加区域 -->
      <!-- 头部的警告区 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        show-icon
        :closable="false">
      </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 商品分类级联框 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cateProps"
            :clearable="true"
            @change="CateChange">
          </el-cascader>
        </el-col>
      </el-row>
      <!-- tab 标签页区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-row>
            <el-col :span="4">
              <el-button
                @click="addDialogVisible=true"
                :disabled="isBtnDisabled"
                type="primary">
                添加参数
              </el-button>
            </el-col>
          </el-row>
          <!-- 动态参数表格 -->
          <el-table
            :data="manyTableData"
            border
            style="width: 100%">
            <el-table-column type="expand"></el-table-column>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <!-- 编辑按钮 -->
                <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
                <!-- 删除按钮 -->
                <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
                {{scope.row.id}}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-row>
            <el-col :span="4">
              <el-button
                @click="addDialogVisible=true"
                :disabled="isBtnDisabled"
                type="primary">
                添加属性
              </el-button>
            </el-col>
          </el-row>
          <!-- 静态属性表格 -->
          <el-table
            :data="onlyTableData"
            border
            style="width: 100%">
            <el-table-column type="expand"></el-table-column>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="静态属性" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <!-- 编辑按钮 -->
                <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
                <!-- 删除按钮 -->
                <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
                {{scope.row.id}}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%">
      <span>这是一段信息</span>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addDialogVisible = false">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'Params',
    data () {
      return {
        // 商品分类的所有数据
        cateList: [],
        // 级联选择框的配置对象
        cateProps: {
          expandTrigger: 'hover',
          value: 'cat_id',
          label: 'cat_name',
          children: 'children'
        },
        // 级联选择框双向绑定的数组
        selectedCateKeys: [],
        // 被激活的标签页名称
        activeName: 'many',
        // 动态参数数据
        manyTableData: [],
        // 静态属性数据
        onlyTableData: [],
        // 对话标题的文本
        titleText: '',
        // 控制添加对话框的显示与隐藏
        addDialogVisible: false
      }
    },
    created () {
      // 获取商品分类数据
      this.getCateList()
    },
    methods: {
      // 发送请求获取商品分类数据
      async getCateList () {
        const { data: res } = await this.$http.get('categories')
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品分类失败！')
        }
        this.cateList = res.data
        console.log(this.cateList)
      },
      // 监听选择项发生变化的事件
      CateChange () {
        this.getParamsData()
      },
      // 监听Tab页签的点击事件
      handleTabClick () {
        this.getParamsData()
      },
      async getParamsData () {
        // 如果选中的不是三级分类则不能被选中
        if (this.selectedCateKeys.length !== 3) {
          this.selectedCateKeys = []
          this.manyTableData = []
          this.onlyTableData = []
          return false
        }
        // 根据所选分类的ID，和当前对应的面板，获取对应的参数
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取数据失败')
        }
        // console.log(res.data)
        if (this.activeName === 'many') {
          this.manyTableData = res.data
          this.titleText = '动态参数'
        } else {
          this.onlyTableData = res.data
          this.titleText = '静态属性'
        }
      }
    },
    computed: {
      // 如果按钮需要被禁用，则返回true，否则返回false
      isBtnDisabled () {
        if (this.selectedCateKeys.length !== 3) {
          return true
        }
        return false
      },
      // 当前选中的三级分类
      cateId () {
        if (this.selectedCateKeys.length === 3) {
          return this.selectedCateKeys[2]
        }
        return null
      }
    }
  }
</script>

<style lang="less" scoped>
  .cat_opt {
    margin: 15px 0;
  }

  .el-cascader {
    min-width: 300px;
  }
</style>
