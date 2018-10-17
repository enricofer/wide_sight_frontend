import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import mio from '@/components/mio'
import viewer from '@/components/ws_viewer'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/mio',
      name: 'mio',
      component: mio
    },
    {
      path: '/view',
      name: 'viewer',
      component: viewer
    }
  ]
})
