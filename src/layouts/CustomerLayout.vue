<template>
  <q-layout view="hHh Lpr lff">
    <q-layout-header>
      <q-toolbar color="white">
        <q-btn color="primary" flat dense round big @click="toggleLeft">
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

    <q-layout-drawer side="left" v-model="toggleDrawer">
      <side-menu-customer v-if="user" :user="user" />
    </q-layout-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script>
import { mapGetters } from 'vuex'

import SideMenuCustomer from '../components/SideMenuCustomer'

export default {
  components: {
    SideMenuCustomer
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
      if (this.user.role.name === 'Aidants') {
        return {
          link: { name: 'customer home' },
          content: 'Mon espace Alenvi'
        };
      }
      return {
        link: { name: 'customer home' },
        content: 'Mon espace Alenvi'
      };
    }
  },
  methods: {
    toggleLeft () {
      this.$store.commit('main/setToggleDrawer', !this.toggleDrawer);
    }
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
