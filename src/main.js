// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import widesight from './App.vue'
// import router from './router'
import vueCustomElement from 'vue-custom-element'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faInfoCircle, faTimesCircle, faMap, faTag } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faInfoCircle)
library.add(faTimesCircle)
library.add(faTag)
library.add(faMap)

Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.use(vueCustomElement)
console.log(widesight)
Vue.customElement('wide-sight', widesight)
