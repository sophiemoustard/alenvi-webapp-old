import Vue from 'vue'
import VueRouter from 'vue-router'
import VueMeta from 'vue-meta'
import { Cookies } from 'quasar'

import routes from './routes'
import alenvi from '../helpers/alenvi'
import store from '../store/index'
import { checkPermission } from '../helpers/checkPermission'

Vue.use(VueRouter)
Vue.use(VueMeta);

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation
 */

// export default function (/* { store, ssrContext } */) {

//   return Router
// }
const Router = new VueRouter({
  scrollBehavior: () => ({ y: 0 }),
  routes,

  // Leave these as is and change from quasar.conf.js instead!
  // quasar.conf.js -> build -> vueRouterMode
  mode: process.env.VUE_ROUTER_MODE,
  base: process.env.VUE_ROUTER_BASE
})

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
          next('/401');
        }
      } else {
        next({ path: '/login', query: { from: to.fullPath } });
      }
    } else {
      if (store.state.main.refreshState) {
        await store.dispatch('main/getUser', Cookies.get('user_id'));
      }
      if (await checkPermission(to, store.getters['main/user'])) {
        store.commit('main/changeRefreshState', false);
        next();
      } else {
        next('/401');
      }
    }
  } else {
    next();
  }
});

// Router.beforeEach(async (to, from, next) => {
//   if (to.meta.cookies) {
//     if (!Cookies.get('alenvi_token') || !Cookies.get('user_id')) {
//       if (await alenvi.refreshAlenviCookies()) {
//         if (store.state.main.refreshState) {
//           await store.dispatch('main/getUser', Cookies.get('user_id'));
//         }
//         if (await checkPermission(to, store.getters['main/user'])) {
//           store.commit('main/changeRefreshState', false);
//           next();
//         } else {
//           if (store.getters['main/user'].role.name === 'Client') {
//             store.commit('main/changeRefreshState', false);
//             return next({ path: '/dashboard/customer/home' });
//           }
//           store.commit('main/changeRefreshState', false);
//           next({ path: '/dashboard' });
//         }
//       } else {
//         next({ path: '/login', query: { from: to.path } });
//       }
//     } else {
//       if (store.state.main.refreshState) {
//         await store.dispatch('main/getUser', Cookies.get('user_id'));
//       }
//       if (await checkPermission(to, store.getters['main/user'])) {
//         store.commit('main/changeRefreshState', false);
//         next();
//       } else if (store.getters['main/user'].role.name === 'Client') {
//         store.commit('main/changeRefreshState', false);
//         next({ path: '/dashboard/customer/home' });
//       } else {
//         store.commit('main/changeRefreshState', false);
//         next({ path: '/dashboard' });
//       }
//     }
//   } else {
//     next();
//   }
// });

export default Router;
