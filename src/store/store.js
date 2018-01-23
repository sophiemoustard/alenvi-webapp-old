import Vue from 'vue'
import Vuex from 'vuex'
import { Cookies } from 'quasar'

import users from '../components/models/Users'
import redirect from '../helpers/redirect'

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    user: null,
    refreshState: true,
    openModal: false,
    disableInput: true
  },
  getters: {
    user (state) {
      return state.user;
    },
    refreshState (state) {
      return state.refreshState;
    },
    getOpenModal (state) {
      return state.openModal;
    },
    disableInput (state) {
      return state.disableInput;
    }
  },
  mutations: {
    setUser (state, userData) {
      state.user = userData;
    },
    changeRefreshState (state) {
      state.refreshState = false;
    },
    controlModal (state, open) {
      state.openModal = open;
    },
    setDisableInput (state, display) {
      state.disableInput = display;
    }
  },
  actions: {
    async getUser ({ commit }) {
      try {
        if (Cookies.get('user_id')) {
          const user = await users.getById(Cookies.get('user_id'));
          commit('setUser', user);
        } else {
          redirect.redirectToLogin();
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
});
