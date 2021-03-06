import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: () => import('../components/Login.vue')
  },
  {
    path: '/home',
    component: () => import('../components/Home.vue'),
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: () => import('../components/Welcome.vue')
      },
      {
        path: '/users',
        component: () => import('../components/user/Users.vue')
      },
      {
        path: '/rights',
        component: () => import('../components/power/Rights.vue')
      },
      {
        path: '/roles',
        component: () => import('../components/power/Roles.vue')
      },
      {
        path: '/categories',
        component: () => import('../components/goods/Cate.vue')
      },
      {
        path: '/params',
        component: () => import('../components/goods/Params.vue')
      },
      {
        path: '/reports',
        component: () => import('../components/report/Report.vue')
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 路由导航守卫
// 如果用户没有登录，直接用过URL访问特定页面，需要重新导航到登录页面
router.beforeEach((to, from, next) => {
  // to:将要访问的路径, from:表示从哪个路径跳转而来, next:是一个函数，表示放行
  // 如果用户访问登录页，则直接放行
  if (to.path === '/login') return next()
  // 从 sessionStorage 中获取是否有 token 值
  const tokenStr = window.sessionStorage.getItem('token')
  // 如果没有则强制跳转到登录页
  if (!tokenStr) return next('/login')
  next()
})

export default router
