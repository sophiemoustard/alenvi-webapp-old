<template>
  <q-list class="no-border sidemenu-alenvi sidemenu-flex">
    <q-list-header>
     <q-item class="justify-center">
        <img src="https://res.cloudinary.com/alenvi/image/upload/v1539605431/images/business/Compani/compani_logo_1L_RVB_S.png" alt="Compani logo">
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
        <q-item-main class="sidemenu-footer-user" :label="userFirstnameUpper" />
        <!-- <q-item-side>
          <q-icon name="person" color="black" @click.native="toAccountInfo"/>
        </q-item-side> -->
        <!-- <q-item-side>
          <q-icon name="settings" color="black" />
        </q-item-side> -->
        <q-item-side>
          <router-link tag="i" class="q-icon material-icons text-black" :to="{ name: 'account info', params: { id: user._id } }" exact>person</router-link>
        </q-item-side>
        <!-- <q-item-side>
          <q-icon name="ion-log-out" color="black" @click.native="logout" />
        </q-item-side> -->
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
  methods: {

  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .q-layout-drawer .q-list .router-link-active
    color: $primary !important
</style>
