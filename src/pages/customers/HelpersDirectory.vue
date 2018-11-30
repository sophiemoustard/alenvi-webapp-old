<template>
  <q-page class="neutral-background" padding>
    <div class="row items-center directory-header">
      <div class="col-xs-12 col-md-6">
        <h4 class="no-margin">Aidants</h4>
      </div>
      <div class="col-xs-12 col-md-6">
        <q-search class="no-border input-search" v-model="searchStr" placeholder="Rechercher un aidant" color="white" inverted-light />
      </div>
    </div>
    <q-table
      :data="filteredHelpers"
      :columns="columns"
      row-key="name"
      binary-state-sort
      :rows-per-page-options="[15, 25, 35]"
      :pagination.sync="pagination"
      :loading="tableLoading">
    </q-table>
    <q-btn class="fixed fab-add-person" no-caps rounded color="primary" icon="add" label="Ajouter une personne" @click="opened = true" />
    <!-- <q-modal v-model="opened" @hide="resetForm" :content-css="modalCssContainer">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-8">
            <h5>Créer une nouvelle <span class="text-weight-bold">fiche bénéficiaire</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span><q-icon name="clear" size="1rem" @click.native="opened = false" /></span>
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Civilité</p>
              <q-icon v-if="$v.newCustomer.identity.title.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.newCustomer.identity.title.$error" error-label="Champ requis">
              <q-select :options="civilityOptions" v-model="newCustomer.identity.title" color="white" inverted-light separator
               @blur="$v.newCustomer.identity.title.$touch" />
            </q-field>
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Nom</p>
              <q-icon v-if="$v.newCustomer.identity.lastname.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.newCustomer.identity.lastname.$error" error-label="Champ requis">
              <q-input v-model="newCustomer.identity.lastname" color="white" inverted-light @blur="$v.newCustomer.identity.lastname.$touch" />
            </q-field>
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <p class="input-caption">Prénom</p>
            <q-field error-label=" ">
              <q-input v-model="newCustomer.identity.firstname" color="white" inverted-light />
            </q-field>
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Email</p>
              <q-icon v-if="$v.newCustomer.email.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.newCustomer.email.$error" error-label="Champ requis">
              <q-input v-model="newCustomer.email" color="white" inverted-light @blur="$v.newCustomer.email.$touch" />
            </q-field>
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Adresse</p>
              <q-icon v-if="$v.newCustomer.contact.address.fullAddress.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.newCustomer.contact.address.fullAddress.$error" error-label="Champ requis">
              <search-address v-model="newCustomer.contact.address.fullAddress" @selected="selectedAddress" @blur="$v.newCustomer.contact.address.fullAddress.$touch" />
            </q-field>
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Mode de paiement</p>
              <q-icon v-if="$v.ogust.method_of_payment.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.ogust.method_of_payment.$error" error-label="Champ requis">
              <select-ogust-list v-model="ogust.method_of_payment" listType="customer.method_of_payment" color="white" inverted-light @myBlur="$v.ogust.method_of_payment.$touch" />
            </q-field>
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Origine</p>
              <q-icon v-if="$v.ogust.origin.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.ogust.origin.$error" error-label="Champ requis">
              <select-ogust-list v-model="ogust.origin" listType="customer.origin" color="white" inverted-light @myBlur="$v.ogust.origin.$touch" />
            </q-field>
          </div>
        </div>
        <div class="row margin-input last">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Géré par</p>
              <q-icon v-if="$v.ogust.managerId.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.ogust.managerId.$error" error-label="Champ requis">
              <select-ogust-list v-model="ogust.managerId" @myBlur="$v.ogust.managerId.$touch" listType="customer.manager" filter />
            </q-field>
          </div>
        </div>
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Créer la fiche" icon-right="add" color="primary" :loading="loading" @click="submit" />
    </q-modal> -->
  </q-page>
</template>

<script>
export default {
  data () {
    return {
      tableLoading: true,
      helpers: [],
      searchStr: '',
      columns: [
        {
          name: 'name',
          label: 'Nom',
          field: 'name',
          align: 'left',
          sortable: true,
          sort: (a, b) => {
            const aArr = a.split(' ');
            const bArr = b.split(' ');
            return aArr[aArr.length - 1].toLowerCase() < bArr[bArr.length - 1].toLowerCase() ? -1 : 1
          },
          style: 'width: 350px'
        },
        {
          name: 'startDate',
          label: 'Depuis le...',
          field: 'startDate',
          align: 'left',
          sortable: true,
          format: (value) => this.$moment(value).format('DD/MM/YYYY'),
          sort: (a, b) => (this.$moment(a).toDate()) - (this.$moment(b).toDate()),
          style: 'width: 170px'
        },
        {
          name: 'customer',
          label: 'Bénéficiaire',
          field: 'customers',
          align: 'left',
          sortable: false,
          style: 'width: 100px'
        }
      ],
      pagination: {
        sortBy: 'startDate',
        descending: true,
        page: 1,
        rowsPerPage: 15
      }
    }
  },
  computed: {
    filteredHelpers () {
      return this.helpers.filter(helper => Object.values(helper).some(val => String(val).toLowerCase().match(new RegExp(this.searchStr, 'i'))));
    }
  },
  async mounted () {
    await this.getHelpers();
  },
  methods: {
    async getHelpers () {
      try {
        const helpers = await this.$users.showAll({ role: 'Aidants' });
        this.helpers = helpers.map((helper) => ({
          name: helper.firstname ? `${helper.firstname} ${helper.lastname}` : helper.lastname,
          startDate: helper.createdAt,
          customers: helper.customers.map(customer => customer.identity.firstname
            ? `${customer.identity.firstname} ${customer.identity.lastname}` : customer.identity.lastname).join(' - ')
        }));
      } catch (e) {
        console.error(e);
      } finally {
        this.tableLoading = false;
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  /deep/ .q-table
    border-spacing: 0 12px
    border-collapse: separate
    &-container
      box-shadow: none
    &-horizontal-separator tbody td
      border: none
    & thead
      border: none
      & tr
        height: 48px
    & th
      padding: 0px 12px
      &.sortable:hover .q-icon, &.sorted .q-icon
        color: $primary
    & tbody tr
      background: $white
      &:hover
        background: $white
        box-shadow: 0px 0px 3px 0px rgba(0, 0, 0, 0.2)
        & td
          border-top: 1px solid $light-grey
          border-bottom: 1px solid $light-grey
          &:first-child
            border-left: 1px solid $light-grey
          &:last-child
            border-right: 1px solid $light-grey
    & td
      padding: 8px 12px
      & .q-item
        // padding: 8px 16px 8px 0px
        min-height: 30px
        padding: 0
        &-main
          flex: 0 1 auto
        & .q-item-side
          min-width: 30px
          max-height: 30px
          & .q-item-avatar
            width: 29px
            height: 29px
            border: 1px solid #979797
        & .q-item-section + .q-item-section
          margin-left: 20px
    &-container
      & .q-table-bottom
        padding-left: 12px
      & .q-table-nodata > i
        display: none

  .input-search
    font-size: 14px
    & /deep/ .q-if-control.q-icon
      margin-right: 8px
</style>
