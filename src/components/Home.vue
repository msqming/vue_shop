<template>
  <div>
    <el-button @click="logout" type="info">退出</el-button>
  </div>
</template>

<script>
  export default {
    name: 'Home',
    methods: {
      // 点击退出按钮
      logout () {
        window.sessionStorage.clear()
        this.$router.push('/login')
      }
    }
  }
</script>

<style lang="less" scoped>

</style>
