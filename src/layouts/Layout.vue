<template>
  <q-layout view="hHh Lpr lff">
    <q-layout-header>
      <q-toolbar class="row justify-between lt-md" color="white">
        <q-btn color="primary" flat round dense big @click="toggleLeft">
          <q-icon name="menu" style="width: 24px; height: 24px" />
        </q-btn>
        <img style="height: 20px" src="https://res.cloudinary.com/alenvi/image/upload/v1546865717/images/business/Compani/compani_texte_rose_1000.png" alt="">
      </q-toolbar>
    </q-layout-header>

    <template v-if="!this.$q.platform.is.mobile">
      <q-btn v-if="toggleDrawer " flat round icon="chevron_left" @click="toggleLeft" class="chevron chevron-left" />
      <q-btn v-else flat round icon="view_headline" @click="toggleLeft" class="chevron chevron-right" />
    </template>
    <q-layout-drawer v-if="toggleDrawer" :width="250" side="left" v-model="toggleDrawer">
      <side-menu-coach :ref="sidemenusRefs" v-if="user && user.role.name !== 'Auxiliaire' && user.role.name !== 'Aidants'" :user="user" />
      <side-menu-auxiliary :ref="sidemenusRefs" v-if="user && user.role.name === 'Auxiliaire'" :user="user" />
      <side-menu-customer :ref="sidemenusRefs" v-if="user && user.role.name === 'Aidants'" :user="user" />
    </q-layout-drawer>
    <template v-else>
      <q-layout-drawer v-if="!this.$q.platform.is.mobile" :width="0" side="left" class="hidden-menu"></q-layout-drawer>
    </template>

    <q-page-container>
      <router-view :key="$route.fullPath"/>
    </q-page-container>

  </q-layout>
</template>

<script>
import { mapGetters } from 'vuex'

import SideMenuCoach from '../components/menu/SideMenuCoach'
import SideMenuAuxiliary from '../components/menu/SideMenuAuxiliary'
import SideMenuCustomer from '../components/menu/SideMenuCustomer'

export default {
  components: {
    SideMenuCoach,
    SideMenuAuxiliary,
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
    if (this.toggleDrawer) {
      this.$refs[this.sidemenusRefs].collapsibleClosing(to, from);
      this.$refs[this.sidemenusRefs].collapsibleEntering(to);
    }

    next();
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .chevron
    background-color: white
    border: 1px solid $light-grey
    top: 5px
    position: fixed
    height: 2em;
    width: 2em;
    z-index: 5000
    &-left
      left: 235px
    &-right
      left: 15px

  .q-toolbar
    color: $primary
    a
     color: $primary
     text-decoration: none

  .q-btn
    color: $dark-grey
    &:hover
      color: $primary
  </style>
