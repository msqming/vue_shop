<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容"
                    v-model="queryInfo.query"
                    clearable
                    @clear="getUserList()">
            <el-button @click="getUserList()" slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button @click="addDialogVisible=true" type="primary">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户表格区域 -->
      <el-table
        :data="userList"
        style="width: 100%"
        border
        stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch @change="userStateChanged(scope.row)" v-model="scope.row.mg_state"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button @click="showEditDialog(scope.row)" type="primary" icon="el-icon-edit" size="mini"></el-button>
            <!-- 删除按钮 -->
            <el-button @click="removeUser(scope.row.id)" type="danger" icon="el-icon-delete" size="mini"></el-button>
            <!-- 设置权限按钮 -->
            <el-tooltip effect="dark" content="分配权限" placement="top-end" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="this.queryInfo.pagenum"
        :page-sizes="[1, 2, 3, 4]"
        :page-size="this.queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="this.total">
      </el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed">
      <el-form :model="addDialogForm"
               :rules="addDialogRules"
               ref="addDialogFormRef"
               label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addDialogForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addDialogForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addDialogForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addDialogForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible=false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑用户对话框区域 -->
    <el-dialog
      title="编辑用户"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed">
      <!-- 编辑用户表单区域 -->
      <el-form :model="editForm" ref="editFormRef" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'Users',
    data () {
      return {
        // 获取用户列表的参数对象
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 2
        },
        userList: [],
        total: 0,
        // 控制添加用户对话框的显示与隐藏
        addDialogVisible: false,
        // 控制编辑用户对话框的显示与隐藏
        editDialogVisible: false,
        // 添加用户时的数据对象
        addDialogForm: {
          username: '',
          password: '',
          email: '',
          mobile: ''
        },
        // 添加用户时的规则验证
        addDialogRules: {
          username: [
            {
              required: true,
              message: '用户名不能为空',
              trigger: 'blur'
            },
            {
              min: 3,
              max: 5,
              message: '长度在 3 到 5 个字符',
              trigger: 'blur'
            }
          ],
          password: [
            {
              required: true,
              message: '密码不能为空',
              trigger: 'blur'
            },
            {
              min: 3,
              max: 5,
              message: '长度在 3 到 5 个字符',
              trigger: 'blur'
            }
          ],
          email: [
            {
              required: true,
              message: '邮箱不能为空',
              trigger: 'blur'
            }
          ],
          mobile: [
            {
              required: true,
              message: '手机不能为空',
              trigger: 'blur'
            }
          ]
        },
        // 编辑用户时的数据对象
        editForm: {
          username: '',
          email: '',
          mobile: ''
        }
      }
    },
    created () {
      this.getUserList()
    },
    methods: {
      async getUserList () {
        const { data: res } = await this.$http.get('users', { params: this.queryInfo })
        console.log(res)
        if (res.meta.status !== 200) return this.$message.error('获取用户列表失败')
        // 将请求成功的用户列表赋值
        this.userList = res.data.users
        this.total = res.data.total
      },
      // 监听用户状态的改变
      async userStateChanged (userInfo) {
        // console.log(userInfo)
        // 同步到数据库中
        const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
        if (res.meta.status !== 200) {
          userInfo.mg_state = !userInfo.mg_state
          return this.$message.error('更新用户状态失败')
        }
        this.$message.success('更新用户状态成功')
      },
      // 监听 pageSize 改变的事件
      handleSizeChange (newSize) {
        // console.log(newSize)
        this.queryInfo.pagesize = newSize
        this.getUserList()
      },
      // 监听 页码值 改变的事件
      handleCurrentChange (newPage) {
        // console.log(newPage)
        this.queryInfo.pagenum = newPage
        this.getUserList()
      },
      // 监听用户对话框的关闭事件
      addDialogClosed () {
        // 重置表单
        this.$refs.addDialogFormRef.resetFields()
      },
      // 点击按钮，添加用户
      addUser () {
        this.$refs.addDialogFormRef.validate(async valid => {
          // 预验证不通过则返回
          if (!valid) return
          // 验证通过则发起请求写入数据库
          const { data: res } = await this.$http.post('users', this.addDialogForm)
          if (res.data.status !== 201) {
            return this.$message.error('添加用户失败')
          }
          this.$message.success('添加用户成功')
          // 成功后隐藏对话框和重新请求数据
          this.addDialogVisible = false
          this.getUserList()
        })
      },
      // 展示编辑用户对话
      showEditDialog (userInfo) {
        // console.log(userInfo)
        this.editDialogVisible = true
        this.editForm = userInfo
      },
      // 监听编辑对话框的关闭事件
      editDialogClosed () {
        // console.log(this)
        this.$refs.editFormRef.resetFields()
      },
      // 监听删除用户按钮事件
      removeUser (userId) {
        this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      }
    }
  }
</script>

<style lang="less" scoped>

</style>
