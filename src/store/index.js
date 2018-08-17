import Vue from 'vue'
import Vuex from 'vuex'

import main from './main';
import calendar from './calendar';
import rh from './rh';
// import example from './module-example'

Vue.use(Vuex)

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation
 */

// export default function (/* { ssrContext } */) {
// const Store = new Vuex.Store({
//   modules: {
//     example
//   }
// })
//   const Store = new Vuex.Store({
//     modules: {
//       main,
//       calendar
//     }
//   });

//   return Store
// }

const store = new Vuex.Store({
  modules: {
    main,
    calendar,
    rh
  }
});

export default store;
