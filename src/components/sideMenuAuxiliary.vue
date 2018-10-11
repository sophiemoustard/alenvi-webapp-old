<template>
  <!-- If we are another role than customer -->
  <q-list class="no-border sidemenu-alenvi sidemenu-flex">
    <q-list-header>
      <q-item class="justify-center">
        <!-- <img src="user.picture.link" alt="Image user" class="avatar"> -->
        <img src="https://res.cloudinary.com/alenvi/image/upload/v1507124345/images/business/alenvi_logo_complet_full.png"
          alt="Alenvi logo">
      </q-item>
    </q-list-header>
    <q-item-separator />
    <q-collapsible ref="planning" v-model="activeRoutes.planning.open" collapseIcon="expand_more">
      <template slot="header">
        <q-item-main :class="{'text-weight-bold': activeRoutes.planning.highlight }" label="Planning" />
      </template>
      <q-item :to="{ name: 'profile planning', params: { id: user._id }, query: { auxiliary: 'true', self: 'true' } }"
        exact>
        <q-item-side icon="event" />
        <q-item-main label="Le mien" />
      </q-item>
      <q-item :to="{ name: 'profile planning', params: { id: user._id }, query: { auxiliary: 'true' } }" exact>
        <q-item-side icon="face" />
        <q-item-main label="Auxiliaires" />
      </q-item>
      <q-item :to="{ name: 'profile planning', params: { id: user._id }, query: { customer: 'true' } }" exact>
        <q-item-side icon="people" />
        <q-item-main label="Bénéficiaires" />
      </q-item>
    </q-collapsible>
    <q-item-separator />
    <q-collapsible ref="benef" v-model="activeRoutes.benef.open" collapseIcon="expand_more">
      <template slot="header">
        <q-item-main :class="{'text-weight-bold': activeRoutes.benef.highlight }" label="Bénéficiaires" />
      </template>
      <q-item :to="{ name: 'profile customers', params: { id: user._id } }" exact>
        <q-item-side icon="account_box" />
        <q-item-main label="Fiches" />
      </q-item>
    </q-collapsible>
    <q-item-separator />
    <q-collapsible ref="administrative" v-model="activeRoutes.administrative.open" collapseIcon="expand_more">
      <template slot="header">
        <q-item-main :class="{'text-weight-bold': activeRoutes.administrative.highlight }" label="Administratif" />
      </template>
      <!-- <q-item :to="{ name: 'view planning'}" exact> -->
      <q-item :to="{ name: 'personal info', params: { id: user._id }}" exact>
        <q-item-side icon="person" />
        <q-item-main label="Infos personnelles" />
      </q-item>
      <q-item :to="{ name: 'profile salaries', params: { id: user._id }}" exact>
        <q-item-side icon="layers" />
        <q-item-main label="Paye" />
      </q-item>
      <q-item :to="{ name: 'profile docs', params: { id: user._id }}" exact>
        <q-item-side icon="insert_drive_file" />
        <q-item-main label="Documents" />
      </q-item>
    </q-collapsible>
    <q-item-separator />
    <q-collapsible ref="team" v-model="activeRoutes.team.open" collapseIcon="expand_more">
      <template slot="header">
        <q-item-main :class="{'text-weight-bold': activeRoutes.team.highlight }" label="Equipe" />
      </template>
      <q-item :to="{ name: 'team directory', params: { id: user._id }}" exact>
        <q-item-side icon="group" />
        <q-item-main label="Répertoire" />
      </q-item>
    </q-collapsible>
    <q-item-separator />
    <div class="sidemenu-footer">
      <q-item class="sidemenu-footer-border full-width">
        <q-item-main class="sidemenu-footer-user" :label="userFirstnameUpper" />
        <q-item-side>
          <q-icon class="messenger-blue-text" name="mdi-facebook-messenger" @click.native="connectToBotMessenger" />
        </q-item-side>
        <q-item-side>
          <router-link tag="i" class="q-icon material-icons text-black" :to="{ name: 'account info' }" exact>person</router-link>
        </q-item-side>
        <!-- <q-item-side>
          <q-icon name="settings" color="black" />
        </q-item-side> -->
        <!-- <q-item-side>
          <q-icon name="ion-log-out" color="black" @click.native="logout" />
        </q-item-side> -->
      </q-item>
    </div>
  </q-list>
</template>

<script>
import { Cookies } from 'quasar';

import {
  sideMenuMixin
} from '../mixins/sideMenuMixin';

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
        },
        team: {
          open: false,
          hightlight: false
        }
      }
    }
  },
  mounted () {
    this.collapsibleOpening();
  },
  methods: {
    connectToBotMessenger () {
      const token = Cookies.get('alenvi_token');
      window.location.href = `${process.env.MESSENGER_LINK}?ref=${token}`
    }
  }
}

</script>

<style lang="stylus" scoped>
  @import '~variables'
  .messenger-blue-text
    color: $messenger-blue

  .q-layout-drawer .q-list .router-link-active
    color: $primary !important
</style>
