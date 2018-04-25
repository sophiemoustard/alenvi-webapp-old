import Vue from 'vue';
import VueRouter from 'vue-router';
import VueMeta from 'vue-meta'
import { Cookies } from 'quasar'

import routes from './routes'
import alenvi from '../helpers/alenvi'
import store from '../store/index'
import { checkPermission } from '../helpers/checkPermission'

Vue.use(VueRouter);
Vue.use(VueMeta);

const Router = new VueRouter({
  /*
   * NOTE! Change Vue Router mode from quasar.conf.js -> build -> vueRouterMode
   *
   * If you decide to go with "history" mode, please also set "build.publicPath"
   * to something other than an empty string.
   * Example: '/' instead of ''
   */

  // Leave as is and change from quasar.conf.js instead!
  mode: process.env.VUE_ROUTER_MODE,
  base: process.env.VUE_ROUTER_BASE,
  scrollBehavior: () => ({ y: 0 }),
  routes,
});

/*
// Inform Google Analytics
Router.beforeEach((to, from, next) => {
  if (typeof ga !== 'undefined') {
    ga('set', 'page', to.path)
    ga('send', 'pageview')
  }
  next()
})
*/
Router.beforeEach(async (to, from, next) => {
  if (to.meta.cookies) {
    if (!Cookies.get('alenvi_token') || !Cookies.get('user_id')) {
      if (await alenvi.refreshAlenviCookies()) {
        if (store.state.main.refreshState) {
          await store.dispatch('main/getUser', Cookies.get('user_id'));
        }
        if (await checkPermission(to, store.getters['main/user'])) {
          store.commit('main/changeRefreshState', false);
          next();
        } else {
          if (store.getters['main/user'].role.name === 'Client') {
            store.commit('main/changeRefreshState', false);
            return next({ path: '/dashboard/customer/home' });
          }
          store.commit('main/changeRefreshState', false);
          next({ path: '/dashboard' });
        }
      } else {
        next({ path: '/401' });
      }
    } else {
      if (store.state.main.refreshState) {
        await store.dispatch('main/getUser', Cookies.get('user_id'));
      }
      if (await checkPermission(to, store.getters['main/user'])) {
        store.commit('main/changeRefreshState', false);
        next();
      } else if (store.getters['main/user'].role.name === 'Client') {
        store.commit('main/changeRefreshState', false);
        next({ path: '/dashboard/customer/home' });
      } else {
        store.commit('main/changeRefreshState', false);
        next({ path: '/dashboard' });
      }
    }
  } else {
    next();
  }
})

export default Router;
