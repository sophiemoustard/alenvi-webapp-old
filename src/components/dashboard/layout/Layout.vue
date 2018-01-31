<template>

  <q-layout ref="layout" view="hHh Lpr lff" :left-breakpoint="992">

    <q-toolbar slot="header" color="white">
      <q-btn color="primary" flat big @click="$refs.layout.toggleLeft()">
        <q-icon name="menu"/>
      </q-btn>
      <q-toolbar-title>
        <router-link :class="{ 'router-link-active': false }" :to="layoutTitle.link">{{ layoutTitle.content }}</router-link>
      </q-toolbar-title>
      <!-- <q-btn color="primary" flat big>
        <q-icon name="email" />
      </q-btn> -->
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
  QIcon } from 'quasar'

import { mapGetters } from 'vuex'

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
  computed: {
    ...mapGetters([
      'user'
    ]),
    layoutTitle () {
      if (this.user.role.name === 'Client') {
        return {
          link: { name: 'customer home' },
          content: 'Votre espace Alenvi'
        };
      }
      return {
        link: { path: '/dashboard/planning' },
        content: 'Dashboard'
      };
    }
  },
  methods: {

  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .q-toolbar
    color: $primary
  
  a
    color: $primary 
    transition: none 
    &:hover
      color: none

  </style>
