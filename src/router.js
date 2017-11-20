import Vue from 'vue'
import VueRouter from 'vue-router'
import VueMeta from 'vue-meta'
import { Cookies } from 'quasar'

import alenvi from './helpers/token/alenvi'

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
    { path: '/bot/authenticatePhone', component: load('bot/AuthenticatePhone') },
    { path: '/bot/editCustomerInfo', component: load('bot/CustomerInfo') },
    { path: '/calendar', component: load('Calendar') },
    {
      path: '/dashboard',
      component: load('dashboard/layout/Layout'),
      children: [
        {
          path: '',
          component: load('dashboard/users/NavTabs'),
          meta: {
            cookies: ['alenvi_token', 'refresh_token']
          }
        },
        {
          path: 'users',
          component: load('dashboard/users/NavTabs'),
          meta: {
            cookies: ['alenvi_token', 'refresh_token']
          }
        },
        {
          path: 'messages',
          component: load('dashboard/messages/NavTabs'),
          meta: {
            cookies: ['alenvi_token', 'refresh_token']
          }
        }
      ]
    },

    // Always leave this last one
    { path: '*', component: load('Error404') } // Not found
  ]
})

router.beforeEach(async (to, from, next) => {
  // SI: il y a des cookies requis ET que parmi ces cookies requis, un seul n'est pas présent dans la liste
  // ALORS: Je redirige vers le login, le mec n'a pas le droit d'être là
  if (to.meta.cookies) {
    if (!Cookies.get('alenvi_token')) {
      const refresh = await alenvi.refreshAlenviCookies();
      if (refresh) {
        next();
      } else {
        next({ path: '/dashboard/login' });
      }
    }
  } else {
    next();
  }
})

export default router;
