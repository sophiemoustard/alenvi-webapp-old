<template>
  <q-layout view="hhh Lpr lff">
    <q-page-sticky v-if="$q.platform.is.mobile" position="bottom-left" :offset="[18, 18]">
      <q-btn class="menu-icon" color="primary" round dense big @click="toggleLeft" icon="menu" size="lg" />
    </q-page-sticky>

    <q-btn v-if="toggleDrawer" flat round icon="chevron_left" @click="toggleLeft" class="chevron chevron-left" />
    <q-btn v-else flat round icon="view_headline" @click="toggleLeft" class="chevron chevron-right" />
    <q-layout-drawer v-if="toggleDrawer" :width="250" side="left" v-model="toggleDrawer">
      <side-menu-coach :ref="sidemenusRefs" v-if="user && user.role.name !== 'Auxiliaire' && user.role.name !== 'Aidants'" :user="user" />
      <side-menu-auxiliary :ref="sidemenusRefs" v-if="user && user.role.name === 'Auxiliaire'" :user="user" />
      <side-menu-customer :ref="sidemenusRefs" v-if="user && user.role.name === 'Aidants'" :user="user" />
    </q-layout-drawer>
    <q-layout-drawer v-else :width="0" side="left" class="hidden-menu"></q-layout-drawer>

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

  .q-page-sticky
    z-index: 10

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
    @media (max-width: 767px)
      display: none

  .q-toolbar
    color: $primary

  .q-btn
    color: $dark-grey
    &:hover
      color: $primary

  .hidden-menu
    @media (max-width: 767px)
      display: none

  @media (max-width: 991px) and (min-width: 768px)
    /deep/ .layout-padding
      padding-left: 3em !important;
  </style>
