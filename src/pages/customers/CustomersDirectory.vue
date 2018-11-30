<template>
  <q-page class="neutral-background" padding>
    <div class="row items-center directory-header">
      <div class="col-xs-12 col-md-5">
        <h4 class="no-margin">Répertoire bénéficiaires</h4>
      </div>
      <div class="col-xs-12 col-md-5">
        <q-search class="no-border input-search" v-model="searchStr" placeholder="Rechercher un profil" color="white" inverted-light />
      </div>
      <div class="col-xs-12 col-md-2 row justify-end">
        <q-toggle v-model="activeCustomers" color="primary" label="Actifs" />
      </div>
    </div>
    <q-table
      :data="filteredCustomers"
      :columns="columns"
      row-key="name"
      binary-state-sort
      :rows-per-page-options="[15, 25, 35]"
      :pagination.sync="pagination"
      :loading="tableLoading">
      <q-tr
        slot="body"
        slot-scope="props"
        :props="props"
        :class="['datatable-row', { 'datatable-row-inactive': !props.row.isActive }]"
        @click.native="goToCustomerProfile(props.row.customer._id)">
        <q-td v-for="col in props.cols"
          :key="col.name"
          :props="props">
          <q-item v-if="col.name === 'name'">
            <q-item-main :label="col.value.name" />
          </q-item>
          <template v-else-if="col.name === 'active'">
            <div :class="{ activeDot: col.value, inactiveDot: !col.value }"></div>
          </template>
          <template v-else>{{ col.value }}</template>
        </q-td>
      </q-tr>
    </q-table>
    <q-btn class="fixed fab-add-person" no-caps rounded color="primary" icon="add" label="Ajouter une personne" @click="opened = true" />
    <q-modal v-model="opened" @hide="resetForm" :content-css="modalCssContainer">
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
            <ni-input caption="Nom" :error="$v.newCustomer.identity.lastname.$error" v-model="newCustomer.identity.lastname"
              @myBlur="$v.newCustomer.identity.lastname.$touch" withBorders
            />
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <ni-input caption="Prénom" v-model="newCustomer.identity.firstname" withBorders />
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Adresse</p>
              <q-icon v-if="$v.newCustomer.contact.address.fullAddress.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.newCustomer.contact.address.fullAddress.$error" :error-label="addressError">
              <ni-search-address v-model="newCustomer.contact.address.fullAddress" @selected="selectedAddress" @blur="$v.newCustomer.contact.address.fullAddress.$touch" />
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
              <ni-select-ogust-list v-model="ogust.method_of_payment" listType="customer.method_of_payment" color="white" inverted-light @myBlur="$v.ogust.method_of_payment.$touch" />
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
              <ni-select-ogust-list v-model="ogust.origin" listType="customer.origin" color="white" inverted-light @myBlur="$v.ogust.origin.$touch" />
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
              <ni-select-ogust-list v-model="ogust.managerId" @myBlur="$v.ogust.managerId.$touch" listType="customer.manager" filter />
            </q-field>
          </div>
        </div>
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Créer la fiche" icon-right="add" color="primary" :loading="loading" @click="submit" />
    </q-modal>
  </q-page>
</template>

<script>
import { required, email } from 'vuelidate/lib/validators';

import { clear } from '../../helpers/utils.js';
import { frAddress } from '../../helpers/vuelidateCustomVal.js'
import SelectOgustList from '../../components/form/SelectOgustList';
import SearchAddress from '../../components/form/SearchAddress';
import Input from '../../components/form/Input.vue';

export default {
  metaInfo: {
    title: 'Répertoire bénéficiaires'
  },
  components: {
    'ni-select-ogust-list': SelectOgustList,
    'ni-search-address': SearchAddress,
    'ni-input': Input,
  },
  data () {
    return {
      userCreated: null,
      tableLoading: true,
      loading: false,
      opened: false,
      sendWelcomeMsg: true,
      modalCssContainer: {
        minWidth: '30vw'
      },
      civilityOptions: [
        {
          label: 'Monsieur',
          value: 'M.'
        },
        {
          label: 'Madame',
          value: 'Mme'
        }
      ],
      newCustomer: {
        identity: {
          title: '',
          lastname: '',
          firstname: ''
        },
        email: '',
        customerId: '',
        contact: {
          ogustAddressId: '',
          address: {
            fullAddress: '',
          }
        },
        isActive: true
      },
      ogust: {
        managerId: '',
        method_of_payment: '',
        origin: ''
      },
      customersList: [],
      searchStr: '',
      activeCustomers: true,
      pagination: {
        sortBy: 'startDate', // String, column "name" property value
        descending: true,
        page: 1,
        rowsPerPage: 15 // current rows per page being displayed
      },
      columns: [
        {
          name: 'name',
          label: 'Nom',
          field: row => row.customer,
          align: 'left',
          sortable: true,
          sort: (a, b) => {
            const aArr = a.name.split(' ');
            const bArr = b.name.split(' ');
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
          name: 'active',
          label: 'Actif',
          field: 'isActive',
          align: 'right',
          sortable: false,
          style: 'width: 30px'
        }
      ]
    }
  },
  validations: {
    newCustomer: {
      identity: {
        title: { required },
        lastname: { required }
      },
      email: { email },
      contact: {
        address: {
          fullAddress: { required, frAddress }
        }
      },
    },
    ogust: {
      managerId: { required },
      method_of_payment: { required },
      origin: { required }
    }
  },
  async mounted () {
    this.getCustomersList();
  },
  computed: {
    currentUser () {
      return this.$store.getters['main/user'];
    },
    activeCustomerList () {
      if (this.activeCustomers) {
        return this.customersList.filter(customer => customer.isActive);
      }
      return this.customersList.filter(customer => !customer.isActive);
    },
    filteredCustomers () {
      return this.activeCustomerList.filter(customer => customer.customer.name.match(new RegExp(this.searchStr, 'i')));
    },
    zipCodeError () {
      if (!this.$v.newCustomer.contact.address.zipCode.required) {
        return 'Champ requis';
      } else if (!this.$v.newCustomer.contact.address.zipCode.frZipCode || !this.$v.newCustomer.contact.address.zipCode.maxLength) {
        return 'Code postal non valide';
      }
    },
    emailError () {
      if (!this.$v.newCustomer.email.required) {
        return 'Champ requis';
      } else if (!this.$v.newCustomer.email.email) {
        return 'Email non valide';
      }
    },
    addressError () {
      if (!this.$v.newCustomer.contact.address.fullAddress.required) {
        return 'Champ requis';
      }
      return 'Adresse non valide';
    }
  },
  methods: {
    async getCustomersList () {
      try {
        const customersRaw = await this.$customers.showAll();
        const customers = customersRaw.data.data.customers;
        this.customersList = customers.map((customer) => {
          return {
            customer: {
              _id: customer._id,
              name: customer.identity.firstname ? `${customer.identity.firstname} ${customer.identity.lastname}` : customer.identity.lastname,
            },
            startDate: customer.createdAt,
            isActive: customer.isActive
          }
        });
        this.tableLoading = false;
      } catch (e) {
        this.tableLoading = false;
        console.error(e);
      }
    },
    goToCustomerProfile (userId) {
      this.$router.push({ name: 'customers profile', params: { id: userId } });
    },
    resetForm () {
      this.$v.newCustomer.$reset();
      this.newCustomer = Object.assign({}, clear(this.newCustomer));
    },
    async createAlenviCustomer () {
      const payload = this.$_.pickBy(this.newCustomer);
      const newCustomer = await this.$customers.create(payload);
      return newCustomer;
    },
    async createOgustCustomer () {
      const ogustPayload = {
        title: this.newCustomer.identity.title,
        last_name: this.newCustomer.identity.lastname,
        first_name: this.newCustomer.identity.firstname,
        email: this.newCustomer.email,
        main_address: {
          line: this.newCustomer.contact.address.street,
          zip: this.newCustomer.contact.address.zipCode,
          city: this.newCustomer.contact.address.city
        },
        method_of_payment: this.ogust.method_of_payment,
        origin: this.ogust.origin,
        manager: this.ogust.managerId
      };
      const cleanPayload = this.$_.pickBy(ogustPayload);
      const newCustomer = await this.$ogust.createCustomer(cleanPayload);
      return newCustomer;
    },
    async submit () {
      try {
        this.loading = true;
        this.$v.newCustomer.$touch();
        if (this.$v.newCustomer.$error) {
          throw new Error('Invalid fields');
        }
        const newCustomer = await this.createOgustCustomer();
        this.newCustomer.customerId = newCustomer.data.data.customer.id_customer;
        const customer = await this.$ogust.getCustomerById(this.newCustomer.customerId);
        this.newCustomer.contact.ogustAddressId = customer.main_address.id_address;
        this.customerCreated = await this.createAlenviCustomer();
        await this.getCustomersList();
        this.$q.notify({
          color: 'positive',
          icon: 'done',
          detail: 'Fiche auxiliaire créée',
          position: 'bottom-left',
          timeout: 2500
        });
        this.loading = false;
        this.opened = false;
      } catch (e) {
        console.error(e);
        if (e && e.message === 'Invalid fields') {
          this.loading = false;
          this.$q.notify({
            color: 'negative',
            icon: 'warning',
            detail: 'Champ(s) invalide(s)',
            position: 'bottom-left',
            timeout: 2500
          });
          return;
        }
        if (e && e.message === 'Existing email') {
          this.loading = false;
          this.$q.notify({
            color: 'negative',
            icon: 'warning',
            detail: 'Cet email est déjà utilisé par un compte existant',
            position: 'bottom-left',
            timeout: 2500
          });
          return;
        }
        if (e && e.response) {
          console.error(e.response);
          if (e.response.status === 409) {
            this.$q.notify({
              color: 'negative',
              icon: 'warning',
              detail: 'Email déjà existant',
              position: 'bottom-left',
              timeout: 2500
            });
            this.loading = false;
            return;
          }
        }
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de la création de la fiche auxiliaire',
          position: 'bottom-left',
          timeout: 2500
        });
        this.loading = false;
      }
    },
    selectedAddress (item) {
      this.newCustomer.contact.address = Object.assign({}, this.newCustomer.contact.address, item);
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .input-caption
    margin-bottom: 4px

  .input-search
    font-size: 14px
    & /deep/ .q-if-control.q-icon
      margin-right: 8px

  .btn-icon
    &-disabled
      color: $light-grey
    &-enabled
      color: $primary

  .q-table-container
    box-shadow: none

  .btn-directory.q-btn /deep/
    box-shadow: none
    &.q-focusable:focus > .q-focus-helper
      background: transparent
      box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.5)

  /deep/ .q-table
    border-spacing: 0 12px
    border-collapse: separate
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
    & td
      padding: 8px 12px
      & .q-item
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

  .datatable-row
    cursor: pointer
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
    &-inactive
      background: rgba(255, 255, 255, 0.5)
      &:hover
        background: rgba(255, 255, 255, 0.5)

  .activeDot
    background: $tertiary
    width: 9px
    height: 9px
    border-radius: 50%
    display: inline-block

  .inactiveDot
    background: $primary-dark
    width: 9px
    height: 9px
    border-radius: 50%
    display: inline-block

  .fab-add-person
    right: 60px
    bottom: 18px
    font-size: 16px
    z-index: 2

  .modal
    &-padding
      padding: 24px 58px 0px 58px
    &-btn
      border-radius: 0

  .q-if-inverted
    border: 1px solid $light-grey

  .bg-negative
    background: none !important
    color: inherit !important

  .margin-input
    margin-bottom: 6px
    &.last
      margin-bottom: 24px

  /deep/ .q-option .q-option-label
    font-size: 14px

  .q-field-bottom
    padding-top: 2px

</style>
