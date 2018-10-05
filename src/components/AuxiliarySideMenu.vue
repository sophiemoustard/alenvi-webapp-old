<template>
  <!-- If we are another role than customer -->
  <q-list class="no-border sidemenu-alenvi sidemenu-flex">
    <q-list-header>
     <q-item class="justify-center">
      <!-- <img src="user.picture.link" alt="Image user" class="avatar"> -->
        <img src="https://res.cloudinary.com/alenvi/image/upload/v1507124345/images/business/alenvi_logo_complet_full.png" alt="Alenvi logo">
      </q-item>
    </q-list-header>
    <q-item-separator />
    <q-collapsible ref="planning" v-model="activeRoutes.planning.open" collapseIcon="expand_more">
      <template slot="header">
        <q-item-main :class="{'text-weight-bold': activeRoutes.planning.highlight }" label="Planning" />
      </template>
      <q-item :to="{ name: 'profile planning', params: { id: user._id }, query: { auxiliary: 'true', self: 'true' } }" exact>
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
    <q-item :to="{ name: 'profile customers', params: { id: user._id } }" exact>
      <q-item-main label="Bénéficiaires" />
    </q-item>
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
    <q-item>
      <q-item-main label="Equipe" />
    </q-item>
    <q-item-separator />
    <div class="sidemenu-footer">
      <q-item class="sidemenu-footer-border full-width">
        <q-item-main class="sidemenu-footer-user" :label="userFirstnameUpper" />
        <q-item-side>
          <q-icon name="person" color="black" />
        </q-item-side>
        <!-- <q-item-side>
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
        // benef: {
        //   open: false,
        //   highlight: false
        // },
        administrative: {
          open: false,
          highlight: false
        },
        // team: {
        //   open: false,
        //   hightlight: false
        // }
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

</style>
