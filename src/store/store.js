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
    disableTimePicker: true,
    showFilter: false,
    ogustUser: null,
    auxiliariesChosen: null,
    ogustToken: null,
    toggleDrawer: true
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
    },
    showFilter (state) {
      return state.showFilter;
    },
    ogustUser (state) {
      return state.ogustUser;
    },
    auxiliariesChosen (state) {
      return state.auxiliariesChosen;
    },
    ogustToken (state) {
      return state.ogustToken;
    },
    toggleDrawer (state) {
      return state.toggleDrawer;
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
    },
    toggleFilter (state, toggle) {
      state.showFilter = toggle;
    },
    setOgustUser (state, ogustUserData) {
      state.ogustUser = ogustUserData;
    },
    setAuxiliariesChosen (state, auxiliaries) {
      state.auxiliariesChosen = auxiliaries;
    },
    getOgustToken (state, token) {
      state.ogustToken = token;
    },
    setToggleDrawer (state, toggle) {
      state.toggleDrawer = toggle;
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
