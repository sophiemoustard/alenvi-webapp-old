<template>
  <q-layout view="hHh Lpr lff">
    <q-layout-header>
      <q-toolbar class="row justify-between lt-md" color="white">
        <q-btn color="primary" flat round dense big @click="toggleLeft">
          <q-icon name="menu" style="width: 24px; height: 24px" />
        </q-btn>
        <img style="height: 20px" src="https://res.cloudinary.com/alenvi/image/upload/v1539605431/images/business/Compani/compani_logo_1L_RVB_S.png" alt="">
        <!-- <q-toolbar-title>
          <router-link :class="{ 'router-link-active': false }" :to="layoutTitle.link">{{ layoutTitle.content }}</router-link>
        </q-toolbar-title> -->
        <!-- <q-btn color="primary" flat big>
        <q-icon name="email" />
      </q-btn> -->
      </q-toolbar>
    </q-layout-header>

    <q-layout-drawer :width="250" side="left" v-model="toggleDrawer">
      <side-menu-coach :ref="sidemenusRefs" v-if="user && user.role.name !== 'Auxiliaire'" :user="user" />
      <side-menu-auxiliary :ref="sidemenusRefs" v-if="user && user.role.name === 'Auxiliaire'" :user="user" />
    </q-layout-drawer>

    <q-page-container>
      <router-view :key="$route.fullPath"/>
    </q-page-container>

  </q-layout>
</template>

<script>
import { mapGetters } from 'vuex'

import sideMenuCoach from '../components/sideMenuCoach'
import sideMenuAuxiliary from '../components/sideMenuAuxiliary'

export default {
  components: {
    sideMenuCoach,
    sideMenuAuxiliary
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
