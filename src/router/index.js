import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/login'
import Home from '../components/home'
import Welcome from '../components/welcome'
import User from '../components/user/user'
import Roles from '../components/power/roles'
import Rights from '../components/power/rights'
import Order from '../components/order/order'
import Params from '../components/goods/params'
import Goods from '../components/goods/goods'
import Categories from '../components/goods/categories'
import Reports from '../components/data/reports'

Vue.use(VueRouter)

const routes = [{
    path: '/',
    redirect: '/login'

  },
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [{
      path: '/welcome',
      component: Welcome
    },{
      path: '/reports',
      component: Reports
    },{
      path: '/categories',
      component: Categories
    },{
      path: '/goods',
      component: Goods
    },{
      path: '/params',
      component: Params
    },{
      path: '/orders',
      component: Order
    },{
      path: '/rights',
      component: Rights
    },{
      path: '/roles',
      component: Roles
    },
    {
      path: '/users',
      component: User
    }]
  }

]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const token = window.sessionStorage.getItem('token');
  if (!token) return next('/login')
  next()
})

export default router
