import Vue from 'vue'
import VueRouter from 'vue-router'
import VueMeta from 'vue-meta'
import { Cookies } from 'quasar'

import { eventBus } from './main'
import token from './helpers/token/alenvi'

Vue.use(VueRouter)
Vue.use(VueMeta)

function load (component) {
  // '@' is aliased to src/components
  return () => import(`@/${component}.vue`)
}

const router = new VueRouter({
  /*
   * NOTE! VueRouter "history" mode DOESN'T works for Cordova builds,
   * it is only to be used only for websites.
   *
   * If you decide to go with "history" mode, please also open /config/index.js
   * and set "build.publicPath" to something other than an empty string.
   * Example: '/' instead of current ''
   *
   * If switching back to default "hash" mode, don't forget to set the
   * build publicPath back to '' so Cordova builds work again.
   */
  mode: 'history',
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard/login', component: load('dashboard/Authenticate') },
    { path: '/bot/authenticate', component: load('bot/Authenticate') },
    { path: '/bot/editCustomerInfo', component: load('bot/CustomerInfo') },
    { path: '/calendar', component: load('Calendar') },
    {
      path: '/dashboard',
      component: load('dashboard/layout/Layout'),
      children: [
        {
          path: '',
          component: load('dashboard/users/Users'),
          meta: {
            cookies: ['alenvi_token']
          }
        },
        {
          path: 'users',
          component: load('dashboard/users/Users'),
          meta: {
            cookies: ['alenvi_token']
          }
        },
        {
          path: 'messages',
          component: load('dashboard/messages/Messages'),
          meta: {
            cookies: ['alenvi_token']
          }
        }
      ]
    },

    // Always leave this last one
    { path: '*', component: load('Error404') } // Not found
  ]
})

router.beforeEach((to, from, next) => {
  if (to.meta.cookies && !to.meta.cookies.every(cookie => document.cookie.indexOf(cookie) !== -1)) {
    next({
      path: '/dashboard/login'
    })
  } else {
    if (to.path.match(/^\/bot\/.*/i)) {
      next();
    } else {
      const value = Cookies.get('alenvi_token')
      const payload = token.verifyToken(value);
      eventBus.$emit('decodedToken', payload);
      next();
    }
  }
})

export default router;
