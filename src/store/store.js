import Vue from 'vue'
import Vuex from 'vuex'
// import { Cookies } from 'quasar'

import users from '../components/models/Users'
// import redirect from '../helpers/redirect'

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    user: null,
    refreshState: true,
    openModal: false,
    disableInput: true,
    disableTimePicker: true
  },
  getters: {
    user (state) {
      return state.user;
    },
    getOpenModal (state) {
      return state.openModal;
    },
    disableInput (state) {
      return state.disableInput;
    },
    disableTimePicker (state) {
      return state.disableTimePicker;
    }
  },
  mutations: {
    setUser (state, userData) {
      state.user = userData;
    },
    changeRefreshState (state, refresh) {
      state.refreshState = refresh;
    },
    controlModal (state, open) {
      state.openModal = open;
    },
    setDisableInput (state, display) {
      state.disableInput = display;
    },
    setDisableTimePicker (state, date) {
      state.disableTimePicker = date;
    }
  },
  actions: {
    async getUser ({ commit }, userId) {
      try {
        const user = await users.getById(userId);
        commit('setUser', user);
      } catch (e) {
        console.error(e);
      }
    }
  }
});
