<template>
  <q-layout view="hHh Lpr lff">
    <q-layout-header>
      <q-toolbar :class="{ 'lt-md': user.role.name !== 'Client' }" color="white">
        <q-btn color="primary" flat big @click="toggleLeft">
          <q-icon name="menu" />
        </q-btn>
        <q-toolbar-title>
          <router-link :class="{ 'router-link-active': false }" :to="layoutTitle.link">{{ layoutTitle.content }}</router-link>
        </q-toolbar-title>
        <!-- <q-btn color="primary" flat big>
        <q-icon name="email" />
      </q-btn> -->
      </q-toolbar>
    </q-layout-header>

    <q-layout-drawer v-if="user.role.name !== 'Auxiliaire'" :width="250" side="left" v-model="toggleDrawer">
      <side-menu ref="sideMenu" v-if="user && user.role.name !== 'Client'" :user="user" />
      <customer-side-menu v-if="user && user.role.name === 'Client'" :user="user" />
    </q-layout-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script>
import { mapGetters } from 'vuex'

import SideMenu from '../components/SideMenu'
import CustomerSideMenu from '../components/CustomerSideMenu'

export default {
  components: {
    SideMenu,
    CustomerSideMenu
  },
  computed: {
    ...mapGetters({
      user: 'main/user'
    }),
    toggleDrawer: {
      get () {
        return this.$store.state.main.toggleDrawer;
      },
      set (val) {
        this.$store.commit('main/setToggleDrawer', !this.toggleDrawer)
      }
    },
    layoutTitle () {
      if (this.user.role.name === 'Client') {
        return {
          link: { name: 'customer home' },
          content: 'Mon espace Alenvi'
        };
      }
      return {
        link: { path: '/dashboard/planning' },
        content: 'Dashboard'
      };
    }
  },
  methods: {
    toggleLeft () {
      this.$store.commit('main/setToggleDrawer', !this.toggleDrawer);
    }
  },
  beforeRouteUpdate (to, from, next) {
    this.$refs.sideMenu.collapsibleClosing(to, from);
    this.$refs.sideMenu.collapsibleEntering(to);
    next();
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .q-toolbar
    color: $primary
    a
     color: $primary
     text-decoration: none
    //  transition: none
    //  &:hover
      //  color: none

  </style>
