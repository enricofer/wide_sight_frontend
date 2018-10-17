// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import widesight from './App.vue'
// import router from './router'
import vueCustomElement from 'vue-custom-element'

Vue.use(vueCustomElement)
console.log(widesight)
Vue.customElement('wide-sight', widesight)
