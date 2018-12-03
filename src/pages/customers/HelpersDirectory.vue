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
    <q-modal v-model="opened" @hide="resetForm" :content-css="modalCssContainer">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-8">
            <h5>Ajouter une <span class="text-weight-bold">personne</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span><q-icon name="clear" size="1rem" @click.native="opened = false" /></span>
          </div>
        </div>
        <ni-modal-input :error="$v.newHelper.lastname.$error" caption="Nom" @blur="$v.newHelper.lastname.$touch" errorLabel="Champ requis" />
        <ni-modal-input :error="$v.newHelper.firstname.$error" caption="Prénom" @blur="$v.newHelper.firstname.$touch" errorLabel="Champ requis" />
        <ni-modal-select :error="$v.newHelper.customers.$error" caption="Bénéficiaires" @blur="$v.newHelper.customers.$touch"
          errorLabel="Champ requis" :options="customers" filter filterPlaceholder="Rechercher" />
        <ni-modal-input last :error="$v.newHelper.local.email.$error" caption="Email" @blur="$v.newHelper.local.email.$touch" errorLabel="Champ requis" />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Ajouter une personne" icon-right="add" color="primary" :loading="loading" />
    </q-modal>
  </q-page>
</template>

<script>
import { required, email } from 'vuelidate/lib/validators';
import { clear } from '../../helpers/utils.js';
import NiSelectCustomer from '../../components/customers/SelectCustomer';
import NiModalInput from '../../components/form/ModalInput';
import NiModalSelect from '../../components/form/ModalSelect';

export default {
  components: {
    NiSelectCustomer,
    NiModalInput,
    NiModalSelect
  },
  data () {
    return {
      loading: false,
      opened: false,
      tableLoading: true,
      helpers: [],
      searchStr: '',
      customers: [],
      modalCssContainer: {
        minWidth: '30vw'
      },
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
      },
      newHelper: {
        lastname: '',
        firstname: '',
        local: { email: '' },
        customers: ''
      }
    }
  },
  validations: {
    newHelper: {
      lastname: { required },
      firstname: { required },
      customers: { required },
      local: {
        email: { required, email }
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
    await this.getCustomers();
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
    },
    async getCustomers () {
      try {
        const customersRaw = await this.$customers.showAll({ isActive: true });
        const customers = customersRaw.data.data.customers;
        this.customers = customers.map(customer => {
          return {
            label: `${customer.identity.title} ${customer.identity.lastname}`,
            value: customer._id
          }
        })
      } catch (e) {
        console.error(e);
      }
    },
    resetForm () {
      this.$v.newHelper.$reset();
      this.newHelper = Object.assign({}, clear(this.newHelper));
    },
    // selectedCustomer (customer) {
    //   this.newHelper.customers = customer._id;
    // },
    handleCustomer (event) {
      this.customers = event;
      this.newHelper.customers = event
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

  .modal
    &-padding
      padding: 24px 58px 0px 58px
    &-btn
      border-radius: 0

  .fab-add-person
    right: 60px
    bottom: 18px
    font-size: 16px
    z-index: 2
</style>
