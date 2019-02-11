import Vue from 'vue'
import Router from 'vue-router'
import viewer from '@/components/ws_viewer'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/view',
      name: 'viewer',
      component: viewer
    }
  ]
})
