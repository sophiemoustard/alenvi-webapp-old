<template>

  <q-layout ref="layout" view="hHh Lpr lff" :left-breakpoint="996">

    <q-toolbar slot="header" color="white">
      <div class="logo-header">
        <img src="https://res.cloudinary.com/alenvi/image/upload/q_auto/v1507124345/images/business/alenvi_logo_complet_full.png" alt="Logo Alenvi" class="responsive">
      </div>
      <q-toolbar-title>
        <q-btn class="menu-icon-header" color="primary" flat big @click="$refs.layout.toggleLeft()">
          <q-icon name="menu"/>
        </q-btn>
        Dashboard
      </q-toolbar-title>
      <q-btn color="primary" flat big>
        <q-icon name="email" />
      </q-btn>
    </q-toolbar>

    <div slot="left">
      <side-menu></side-menu>
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

import SideMenu from './SideMenu.vue'

export default {
  components: {
    QLayout,
    QToolbar,
    QToolbarTitle,
    QBtn,
    QIcon,
    SideMenu
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .logo-header
    width: 180px
    height: 49px

  .menu-icon-header
    margin-left: 98px

  .q-toolbar
    color: $primary

  </style>
