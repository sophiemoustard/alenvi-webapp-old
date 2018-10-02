<template>
  <q-layout view="hHh Lpr lff">
    <q-layout-header>
      <q-toolbar v-if="user.role.name !== 'Auxiliaire'" class="lt-md" color="white">
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

    <q-layout-drawer :width="250" side="left" v-model="toggleDrawer">
      <side-menu :ref="sidemenusRefs" v-if="user && user.role.name !== 'Auxiliaire'" :user="user" />
      <auxiliary-side-menu :ref="sidemenusRefs" v-if="user && user.role.name === 'Auxiliaire'" :user="user" />
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
import AuxiliarySideMenu from '../components/AuxiliarySideMenu'

export default {
  components: {
    SideMenu,
    CustomerSideMenu,
    AuxiliarySideMenu
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
      return {
        link: { name: 'administrative directory' },
        content: 'Administratif'
      };
    },
    sidemenusRefs () {
      if (this.user && this.user.role.name !== 'Auxiliaire') {
        return 'defaultMenu';
      }
      return 'auxiliaryMenu';
    }
  },
  methods: {
    toggleLeft () {
      this.$store.commit('main/setToggleDrawer', !this.toggleDrawer);
    }
  },
  beforeRouteUpdate (to, from, next) {
    this.$refs[this.sidemenusRefs].collapsibleClosing(to, from);
    this.$refs[this.sidemenusRefs].collapsibleEntering(to);
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
