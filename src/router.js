import Vue from 'vue'
import VueRouter from 'vue-router'
import VueMeta from 'vue-meta'
import { Cookies } from 'quasar'

import { store } from './store/store'
import alenvi from './helpers/token/alenvi'
import { checkPermission } from './helpers/permissions/checkPermission'

Vue.use(VueRouter);
Vue.use(VueMeta);

function load (component) {
  // '@' is aliased to src/components
  return () => import(`@/${component}.vue`);
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
    { path: '/enterCode', component: load('signup/EnterCode') },
    {
      path: '/signup',
      component: load('signup/Signup'),
      beforeEnter: (to, from, next) => {
        if (Cookies.get('signup_is_activated') && Cookies.get('signup_sector') && Cookies.get('signup_mobile')) {
          next();
        } else {
          next({ path: '/enterCode' });
        }
      }
    },
    { path: '/bot/authenticate', component: load('bot/Authenticate') },
    {
      path: '/bot/authenticatePhone',
      component: load('bot/AuthenticatePhone')
    },
    { path: '/bot/editCustomerInfo', component: load('bot/CustomerInfo') },
    { path: '/calendar', component: load('Calendar') },
    {
      path: '/dashboard',
      component: load('dashboard/layout/Layout'),
      children: [
        {
          path: '',
          component: load('dashboard/home/Home'),
          meta: {
            cookies: ['alenvi_token', 'refresh_token']
          }
        },
        {
          path: 'planning',
          component: load('dashboard/planning/NavTabs'),
          meta: {
            cookies: ['alenvi_token', 'refresh_token'],
            permission: 'Planning'
          }
        },
        {
          path: 'users',
          component: load('dashboard/users/NavTabs'),
          meta: {
            cookies: ['alenvi_token', 'refresh_token'],
            permission: 'Utilisateurs'
          }
        },
        {
          path: 'pigi',
          component: load('dashboard/pigi/NavTabs'),
          meta: {
            cookies: ['alenvi_token', 'refresh_token'],
            permission: 'Pigi'
          }
        },
        {
          path: 'settings',
          component: load('dashboard/settings/NavTabs'),
          meta: {
            cookies: ['alenvi_token', 'refresh_token'],
            permission: 'Paramètres'
          }
        },
        {
          path: 'profile/:id',
          name: 'profile',
          component: load('dashboard/profile/NavTabs'),
          meta: {
            cookies: ['alenvi_token', 'refresh_token']
          }
        }
      ]
    },

    // Always leave this last one
    { path: '*', component: load('Error404') } // Not found
  ]
});

router.beforeEach(async (to, from, next) => {
  // SI: il y a des cookies requis ET que parmi ces cookies requis, un seul n'est pas présent dans la liste
  // ALORS: Je redirige vers le login, le mec n'a pas le droit d'être là
  if (to.meta.cookies) {
    if (store.getters.refreshState) {
      await store.dispatch('getUser');
    }
    if (!Cookies.get('alenvi_token')) {
      if (await alenvi.refreshAlenviCookies()) {
        if (await checkPermission(to, store.getters.user)) {
          next();
        } else {
          next({ path: '/dashboard' })
        }
      } else {
        next({ path: '/dashboard/login' });
      }
    } else {
      if (await checkPermission(to, store.getters.user)) {
        return next();
      }
      return next({ path: '/dashboard' });
    }
  } else {
    next();
  }
});

export default router
