// === DEFAULT / CUSTOM STYLE ===
// WARNING! always comment out ONE of the two require() calls below.
// 1. use next line to activate CUSTOM STYLE (./src/themes)
require(`./themes/app.${__THEME}.styl`)
// 2. or, use next line to activate DEFAULT QUASAR STYLE
// require(`quasar/dist/quasar.${__THEME}.css`)
// ==============================

// Uncomment the following lines if you need IE11/Edge support
// require(`quasar/dist/quasar.ie`)
// require(`quasar/dist/quasar.ie.${__THEME}.css`)

import Vue from 'vue'
import Quasar, { Cookies } from 'quasar'
import router from './router'
import Axios from 'axios'

import alenvi from './helpers/token/alenvi'
import ogustToken from './helpers/token/getOgustToken'

Vue.config.productionTip = false
Vue.use(Quasar) // Install Quasar Framework

Axios.interceptors.request.use(async function (config) {
  if (!Cookies.get('alenvi_token')) {
    alenvi.refreshAlenviCookies(Vue);
  }
  Axios.defaults.headers.common['x-access-token'] = Cookies.get('alenvi_token');
  if (config.url.match(/ogust/i)) {
    const token = await ogustToken.getOgustToken(Vue);
    config.headers.common['x-ogust-token'] = token;
  }
  return config;
}, function (err) {
  return Promise.reject(err);
});

Vue.prototype.$http = Axios;

if (__THEME === 'mat') {
  require('quasar-extras/roboto-font')
}
import 'quasar-extras/material-icons'
// import 'quasar-extras/ionicons'
// import 'quasar-extras/fontawesome'
// import 'quasar-extras/animate'
export const eventBus = new Vue();

Quasar.start(() => {
  /* eslint-disable no-new */
  new Vue({
    el: '#q-app',
    router,
    render: h => h(require('./App'))
  })
})
