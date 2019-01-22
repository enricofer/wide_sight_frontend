// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import widesight from './App.vue'
// import router from './router'
import vueCustomElement from 'vue-custom-element'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faInfoCircle, faTimesCircle, faMap, faTag, faCog, faRulerVertical } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'

window.$ = require('jquery')
window.JQuery = require('jquery')

library.add(faInfoCircle)
library.add(faTimesCircle)
library.add(faTag)
library.add(faMap)
library.add(faCog)
library.add(faRulerVertical)

Vue.use(Buefy)

Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.use(vueCustomElement)
Vue.customElement('wide-sight', widesight)
