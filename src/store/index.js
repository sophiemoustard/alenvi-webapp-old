import Vue from 'vue'
import Vuex from 'vuex'

import main from './main';
import calendar from './calendar';
import rh from './rh';

Vue.use(Vuex)

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation
 */

const store = new Vuex.Store({
  modules: {
    main,
    calendar,
    rh
  }
});

export default store;
