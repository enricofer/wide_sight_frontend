// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import widesight from './App.vue'
// import router from './router'
import wrap from '@vue/web-component-wrapper'

Vue.config.productionTip = false

const CustomElement = wrap(Vue, widesight)

window.customElements.define('widesight', CustomElement)
