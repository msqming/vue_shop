<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>角色管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="4">
          <el-button @click="addRoles=true" type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 用户表格区域 -->
      <el-table
        :data="rolesList"
        style="width: 100%"
        border
        stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="[i1 === 0 ? 'bdtop' : '', 'bdbottom', 'vcenter']"
                    v-for="(item1, i1) in scope.row.children"
                    :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable
                        @close="removeRightById(scope.row, item1.id)">
                  {{item1.authName}}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套渲染二级权限-->
                <el-row :class="[i2 === 0 ? '': 'bdtop', 'vcenter']"
                        v-for="(item2, i2) in item1.children"
                        :key="item2.id">
                  <!-- 二级权限渲染 -->
                  <el-col :span="6">
                    <el-tag type="success"
                            closable
                            @close="removeRightById(scope.row, item2.id)">
                      {{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限渲染 -->
                  <el-col :span="18">
                    <el-tag v-for="item3 in item2.children"
                            :key="item3.id"
                            type="warning"
                            closable
                            @close="removeRightById(scope.row, item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button @click="showEditDialog(scope.row)" type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <!-- 删除按钮 -->
            <el-button @click="removeUser(scope.row.id)" type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <!-- 分配权限按钮 -->
            <el-button type="warning" icon="el-icon-setting" size="mini"
                       @click="showSetRightDialog(scope.row)">
              分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限区域 -->
    <el-dialog
      title="提示"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed">
      <!-- 树形控件 -->
      <el-tree :data="rightsList"
               :props="defaultProps"
               show-checkbox
               node-key="id"
               :default-expand-all="true"
               :default-checked-keys="defKeys"
               ref="treeRef">
      </el-tree>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRightDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'Roles',
    data () {
      return {
        // 所有角色列表的数据
        rolesList: [],
        // 控制分配权限的对话框
        setRightDialogVisible: false,
        // 所有权限的数据
        rightsList: [],
        // 树形控件的属性绑定
        defaultProps: {
          children: 'children',
          label: 'authName'
        },
        // 默认选中的节点Id值(第三级权限)
        defKeys: [],
        // 当前即将分配权限的角色id
        roleId: ''
      }
    },
    created () {
      this.getRolesList()
    },
    methods: {
      // 发起请求获取角色列表
      async getRolesList () {
        const { data: res } = await this.$http.get('roles')
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('获取角色列表失败')
        }
        this.rolesList = res.data
      },
      // 根据id删除对应的权限
      async removeRightById (role, rightId) {
        // 弹框提示是否删除
        const confirmResult = await this.$confirm('是否删除该用户权限?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)

        if (confirmResult !== 'confirm') {
          return this.$message.info('取消了删除！')
        }
        const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除权限失败！')
        }
        // 删除成功后保存最新的权限数据
        role.children = res.data
        this.$message.success('删除成功！')
      },

      // 点击分配权限按钮事件
      async showSetRightDialog (role) {
        this.roleId = role.id
        // 获取所有权限的数据
        const { data: res } = await this.$http.get('rights/tree')
        if (res.meta.status !== 200) {
          return this.$message.error('获取权限数据失败')
        }
        console.log(res.data)
        this.rightsList = res.data

        // 递归获取三级节点的id
        this.getLeafKeys(role, this.defKeys)
        this.setRightDialogVisible = true
        console.log(this.defKeys)
      },
      // 通过递归的形式，获取角色下所有三级权限的id，并保存到defKeys数组中
      getLeafKeys (node, arr) {
        // 如果当前node节点不包含children属性，则是三级权限
        if (!node.children) {
          return arr.push(node.id)
        }
        // 递归
        node.children.forEach(item => this.getLeafKeys(item, arr))
      },
      // 监听关闭分配权限对话框事件
      setRightDialogClosed () {
        // 每次关闭都情况原有数据
        this.defKeys = []
      },
      // 点击分配权限
      async allotRights () {
        const keys = [
          // 已选中的节点数组
          this.$refs.treeRef.getCheckedKeys(),
          // 半选中的节点数组
          this.$refs.treeRef.getHalfCheckedKeys()
        ]
        const idStr = keys.join(',')
        const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
        if (res.meta.status !== 200) {
          return this.$message.error('用户分配权限失败')
        }
        this.$message.success('用户分配权限成功！')
        this.getRolesList()
        this.setRightDialogVisible = false
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-tag {
    margin: 7px;
  }

  .bdtop {
    border-top: 1px solid #eee;
  }

  .bdbottom {
    border-bottom: 1px solid #eee;
  }

  .vcenter {
    display: flex;
    align-items: center;
  }

</style>
