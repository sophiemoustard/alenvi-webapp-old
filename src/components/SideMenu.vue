<template>
  <!-- If we are another role than customer -->
  <q-list v-if="user.role.name !== 'Client'" class="no-border sidemenu-flex">
    <q-list-header>
     <q-item class="justify-center">
      <!-- <img src="user.picture.link" alt="Image user" class="avatar"> -->
        <img id="logo-sidemenu" src="https://res.cloudinary.com/alenvi/image/upload/v1507124345/images/business/alenvi_logo_complet_full.png" alt="Alenvi logo">
      </q-item>
    </q-list-header>
    <q-item-separator />
    <q-collapsible ref="administrative" v-model="activeRoutes.administrative.open" collapseIcon="expand_more">
      <template slot="header">
        <q-item-main :class="{'text-weight-bold': activeRoutes.administrative.highlight }" label="Administratif" />
      </template>
      <q-item :to="{ name: 'administrative directory', query: { role: 'Auxiliaire' } }" exact>
        <q-item-side icon="contacts" />
        <q-item-main label="Répertoire" />
      </q-item>
      <!-- <q-item>
        <q-item-side icon="settings" />
        <q-item-main label="Configuration RH" />
      </q-item> -->
    </q-collapsible>
    <q-item-separator />
    <q-collapsible ref="planning" v-model="activeRoutes.planning.open" collapseIcon="expand_more">
      <template slot="header">
        <q-item-main :class="{'text-weight-bold': activeRoutes.planning.highlight }" label="Planning" />
      </template>
      <q-item :to="{ name: 'view planning'}" exact>
        <q-item-side icon="date range" />
        <q-item-main label="Vue planning" />
      </q-item>
      <q-item :to="{ name: 'modification planning' }" exact>
        <q-item-side icon="update" />
        <q-item-main label="Modifications planning" />
      </q-item>
      <q-item :to="{ name: 'constrained coaches' }" exact>
        <q-item-side icon="perm contact calendar" />
        <q-item-main label="Coach(s) de permanence" />
      </q-item>
    </q-collapsible>
    <q-item-separator />
    <q-collapsible ref="benef" v-model="activeRoutes.benef.open" collapseIcon="expand_more">
      <template slot="header">
        <q-item-main :class="{'text-weight-bold': activeRoutes.benef.highlight }" label="Bénéficiaires" />
      </template>
      <q-item :to="{ name: 'add helper' }" exact>
        <q-item-side icon="person add" />
        <q-item-main label="Accueil aidants" />
      </q-item>
    </q-collapsible>
    <q-item-separator />
    <div class="sidemenu-footer">
      <q-item class="sidemenu-footer-border full-width">
        <q-item-main id="sidemenu-footer-user" :label="userFirstnameUpper" />
        <!-- <q-item-side>
          <q-icon name="person" color="black" />
        </q-item-side>
        <q-item-side>
          <q-icon name="settings" color="black" />
        </q-item-side> -->
        <q-item-side>
          <q-icon name="ion-log-out" color="black" @click.native="logout" />
        </q-item-side>
      </q-item>
    </div>
  </q-list>
</template>

<script>
import { sideMenuMixin } from '../mixins/sideMenuMixin';

export default {
  props: ['user'],
  mixins: [sideMenuMixin],
  data () {
    return {
      activeRoutes: {
        planning: {
          open: false,
          highlight: false
        },
        benef: {
          open: false,
          highlight: false
        },
        administrative: {
          open: false,
          highlight: false
        }
      }
    }
  },
  mounted () {
    this.collapsibleOpening();
  },
  computed: {
    userFirstnameUpper () {
      return this.user.firstname.toUpperCase();
    }
  },
  methods: {
    collapsibleOpening () {
      if (this.$refs[this.$route.meta.parent]) {
        this.activeRoutes[this.$route.meta.parent].open = true;
        this.activeRoutes[this.$route.meta.parent].highlight = true;
      }
    },
    collapsibleClosing (to, from) {
      if (this.$refs[from.meta.parent] && to.meta.parent !== from.meta.parent) {
        this.activeRoutes[from.meta.parent].open = false;
        this.activeRoutes[from.meta.parent].highlight = false;
      }
    },
    collapsibleEntering (to) {
      if (this.$refs[to.meta.parent]) {
        this.activeRoutes[to.meta.parent].highlight = true;
      }
    },
    // changeRefreshState () {
    //   this.$store.commit('changeRefreshState');
    // }
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  #logo-sidemenu
    width: 200px

  .router-link-active
    background: none
    color: $primary

  .router-link-active > div:nth-child(2)
    color: $primary

  .sidemenu-flex
    display: flex
    flex-direction: column
    min-height: 100vh

  .sidemenu-footer
    flex-grow: 1
    display: flex
    align-items: flex-end
    justify-content: space-between
    padding-top: 0px
    padding-bottom: 0px
    // prevent border overlap from footer to last sidemenu object
    margin-top: -1px
    & .q-item
      padding: 6px 2px 0px 16px
      & .q-item-side
        cursor: pointer
    &-border
      border-top: 1px solid #e0e0e0
    // & .q-item-section + .q-item-section
    //   margin-left: 5px

  #sidemenu-footer-user
    font-size: 11px
    font-weight: bold
    color: #A3A3A3
</style>
