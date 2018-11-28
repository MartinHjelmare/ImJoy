import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Imjoy from '@/components/Imjoy'
import About from '@/components/About'

Vue.use(Router)

export default new Router({
  // mode: 'history',
  base: window.location.pathName,
  routes: [{
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/home',
      redirect: '/',
    },
    {
      path: '/app',
      name: 'app',
      component: Imjoy
    },
    {
      path: '/:)',
      redirect: { name: 'joy' }
    },
    {
      path: '/%F0%9F%98%82',
      name: 'joy',
      component: Imjoy
    },
    {
      path: '/imjoy',
      name: 'Imjoy',
      component: Imjoy
    },
    {
      path: '/about',
      name: 'About',
      component: About
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
