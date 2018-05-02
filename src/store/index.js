import Vue from 'vue';
import Vuex from 'vuex';

import main from './main';
import calendar from './calendar';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    main,
    calendar
  }
});

export default store;
