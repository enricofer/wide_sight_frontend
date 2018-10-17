// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import widesight from './App'
// import router from './router'

Vue.config.productionTip = false

const rootElement = document.getElementById('ws')

/* eslint-disable no-new */

const RootComponent = Vue.extend(widesight)

new RootComponent({
  el: rootElement,
  // router,
  components: { widesight },
  template: '<widesight/>',
  propsData: { ...rootElement.dataset }
})
