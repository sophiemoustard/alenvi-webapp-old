<template>
  <q-list class="no-border sidemenu-alenvi sidemenu-flex">
    <q-list-header>
     <q-item class="justify-center">
        <img src="https://res.cloudinary.com/alenvi/image/upload/v1546865717/images/business/Compani/compani_texte_rose_1000.png" alt="Compani logo">
      </q-item>
    </q-list-header>
    <q-item-separator />
    <q-collapsible ref="administrative" v-model="activeRoutes.administrative.open" collapseIcon="expand_more">
      <template slot="header">
        <q-item-main :class="{'text-weight-bold': activeRoutes.administrative.highlight }" label="Administratif" />
      </template>
      <ni-menu-item name="administrative directory" icon="contacts" label="Répertoire" />
    </q-collapsible>
    <q-item-separator />
    <q-collapsible ref="planning" v-model="activeRoutes.planning.open" collapseIcon="expand_more">
      <template slot="header">
        <q-item-main :class="{'text-weight-bold': activeRoutes.planning.highlight }" label="Planning" />
      </template>
      <ni-menu-item name="auxiliaries planning" icon="date range" label="Auxiliaires" />
      <ni-menu-item name="customers planning" icon="date range" label="Bénéficiaires" />
      <ni-menu-item name="constrained coaches" icon="perm contact calendar" label="Coach(s) de permanence" />
    </q-collapsible>
    <q-item-separator />
    <q-collapsible ref="benef" v-model="activeRoutes.benef.open" collapseIcon="expand_more">
      <template slot="header">
        <q-item-main :class="{'text-weight-bold': activeRoutes.benef.highlight }" label="Bénéficiaires" />
      </template>
      <ni-menu-item name="customers directory" icon="contacts" label="Répertoire bénéficiaires" />
    </q-collapsible>
    <q-item-separator />
    <q-collapsible v-if="user.role.name === 'Admin'" ref="billing" v-model="activeRoutes.billing.open"
      collapseIcon="expand_more">
      <template slot="header">
        <q-item-main :class="{'text-weight-bold': activeRoutes.billing.highlight }" label="Facturation" />
      </template>
      <ni-menu-item name="to bill" :params="{ id: user._id }" icon="credit_card" label="À facturer" />
      <ni-menu-item name="credit note" :params="{ id: user._id }" icon="mdi-credit-card-refund" label="Avoirs" />
      <ni-menu-item name="clients balances" :params="{ id: user._id }" icon="mdi-scale-balance" label="Balances clients" />
      <ni-menu-item name="debits archive" :params="{ id: user._id }" icon="mdi-archive" label="Archive prélèvements" />
    </q-collapsible>
    <q-item-separator />
    <q-collapsible v-if="user.role.name === 'Admin'" ref="pay" v-model="activeRoutes.pay.open"
      collapseIcon="expand_more">
      <template slot="header">
        <q-item-main :class="{'text-weight-bold': activeRoutes.pay.highlight }" label="Paie" />
      </template>
      <ni-menu-item name="to pay" :params="{ id: user._id }" icon="euro_symbol" label="À payer" />
      <ni-menu-item name="contract ends" :params="{ id: user._id }" icon="description" label="Fins de contrats" />
      <ni-menu-item name="absences" :params="{ id: user._id }" icon="calendar_today" label="Absences" />
    </q-collapsible>
    <q-item-separator />
    <q-collapsible v-if="user.role.name === 'Admin'" ref="configuration" v-model="activeRoutes.configuration.open"
      collapseIcon="expand_more">
      <template slot="header">
        <q-item-main :class="{'text-weight-bold': activeRoutes.configuration.highlight }" label="Configuration" />
      </template>
      <ni-menu-item name="rh config" :params="{ id: user._id }" icon="settings" label="Configuration RH" />
      <ni-menu-item name="customers config" :params="{ id: user._id }" icon="settings" label="Configuration bénéficiaires" />
      <ni-menu-item name="tags config" :params="{ id: user._id }" icon="list_alt" label="Tags" />
    </q-collapsible>
    <q-item-separator />
    <ni-side-menu-footer :label="userFirstnameUpper" :userId="user._id" />
  </q-list>
</template>

<script>
import { sideMenuMixin } from '../../mixins/sideMenuMixin';
import MenuItem from './MenuItem.vue';
import SideMenuFooter from './SideMenuFooter.vue';

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
          highlight: false,
        },
        benef: {
          open: false,
          highlight: false,
        },
        administrative: {
          open: false,
          highlight: false,
        },
        billing: {
          open: false,
          highlight: false,
        },
        pay: {
          open: false,
          highlight: false,
        },
        configuration: {
          open: false,
          highlight: false,
        },
      },
    };
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
