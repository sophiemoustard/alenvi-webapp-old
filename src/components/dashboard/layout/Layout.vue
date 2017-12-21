<template>

  <q-layout ref="layout" view="hHh Lpr lff" :left-breakpoint="992">

    <q-toolbar slot="header" color="white">
      <q-btn color="primary" flat big @click="$refs.layout.toggleLeft()">
        <q-icon name="menu"/>
      </q-btn>
      <q-toolbar-title>
        Dashboard
      </q-toolbar-title>
      <q-btn color="primary" flat big>
        <q-icon name="email" />
      </q-btn>
    </q-toolbar>

    <div slot="left">
      <side-menu v-if="user" :user="user"></side-menu>
    </div>

    <router-view/>

  </q-layout>

</template>

<script>
import {
  QLayout,
  QToolbar,
  QToolbarTitle,
  QBtn,
  QIcon,
  Cookies } from 'quasar'

import users from '../../models/Users'
import SideMenu from './SideMenu.vue'

export default {
  components: {
    QLayout,
    QToolbar,
    QToolbarTitle,
    QBtn,
    QIcon,
    SideMenu
  },
  async mounted (to, from, next) {
      try {
        if (Cookies.get('user_id')) {
          this.user = await users.getById(Cookies.get('user_id'));
        } else {
          next({ path: '/dashboard/login' });
        }
      } catch (e) {
        console.error(e);
      }
  },
  data () {
    return {
      user: null
    }
  },
  methods: {
    setUserInfo (user) {
      this.user = user;
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .q-toolbar
    color: $primary

  </style>
