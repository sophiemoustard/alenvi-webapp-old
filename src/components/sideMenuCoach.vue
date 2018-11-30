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
      <ni-menu-item name="administrative directory" :query="{ role: 'Auxiliaire' }" icon="contacts" label="Répertoire" />
      <ni-menu-item name="rh config" :params="{ id: user._id }" icon="settings" label="Configuration RH" :displayItem="user.role.name === 'Admin'" />
    </q-collapsible>
    <q-item-separator />
    <q-collapsible ref="planning" v-model="activeRoutes.planning.open" collapseIcon="expand_more">
      <template slot="header">
        <q-item-main :class="{'text-weight-bold': activeRoutes.planning.highlight }" label="Planning" />
      </template>
      <ni-menu-item name="view planning" icon="date range" label="Vue planning" />
      <ni-menu-item name="modification planning" icon="update" label="Modifications planning" />
      <ni-menu-item name="constrained coaches" icon="perm contact calendar" label="Coach(s) de permanence" />
    </q-collapsible>
    <q-item-separator />
    <q-collapsible ref="benef" v-model="activeRoutes.benef.open" collapseIcon="expand_more">
      <template slot="header">
        <q-item-main :class="{'text-weight-bold': activeRoutes.benef.highlight }" label="Bénéficiaires" />
      </template>
      <ni-menu-item name="customers directory" icon="contacts" label="Répertoire bénéficiaires" />
      <ni-menu-item name="helpers directory" icon="people" label="Aidants" />
    </q-collapsible>
    <q-item-separator />
    <ni-side-menu-footer :label="userFirstnameUpper" :userId="user._id" @myClick="connectToBotMessenger" />
  </q-list>
</template>

<script>
import { sideMenuMixin } from '../mixins/sideMenuMixin';
import MenuItem from './menu/MenuItem.vue';
import SideMenuFooter from './menu/sideMenuFooter.vue';

export default {
  props: {
    user: Object,
  },
  mixins: [sideMenuMixin],
  components: {
    'ni-menu-item': MenuItem,
    'ni-side-menu-footer': SideMenuFooter,
  },
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
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .q-layout-drawer .q-list .router-link-active
    color: $primary !important
</style>
