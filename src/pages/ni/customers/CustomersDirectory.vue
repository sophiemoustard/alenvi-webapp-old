<template>
  <q-page class="neutral-background" padding>
    <div class="row items-center directory-header">
      <div class="col-xs-12 col-md-5">
        <h4 class="no-margin">Répertoire bénéficiaires</h4>
      </div>
      <div class="col-xs-12 col-md-5">
        <q-search class="no-border input-search" v-model="searchStr" placeholder="Rechercher un profil" color="white"
          inverted-light />
      </div>
      <div class="col-xs-12 col-md-2 row justify-end">
        <q-toggle v-model="activeCustomers" color="primary" label="Actifs" />
      </div>
    </div>
    <q-table :data="filteredCustomers" :columns="columns" row-key="name" binary-state-sort :rows-per-page-options="[15, 25, 35]"
      :pagination.sync="pagination" :loading="tableLoading" class="people-list q-pa-sm">
      <q-tr slot="body" slot-scope="props" :props="props" :class="['datatable-row', { 'datatable-row-inactive': !props.row.isActive }]"
        @click.native="goToCustomerProfile(props.row.customer._id)">
        <q-td v-for="col in props.cols" :key="col.name" :props="props">
          <q-item v-if="col.name === 'name'">
            <q-item-main :label="col.value.name" />
          </q-item>
          <template v-else-if="col.name === 'active'">
            <div :class="{ activeDot: col.value, inactiveDot: !col.value }"></div>
          </template>
          <template v-else-if="col.name === 'info'">
            <q-icon v-if="props.row.missingInfo" name="error" color="secondary" size="1rem" />
          </template>
          <template v-else>{{ col.value }}</template>
        </q-td>
      </q-tr>
    </q-table>
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter un bénéficiaire"
      @click="opened = true" />

    <!-- Customer creation modal -->
    <q-modal v-model="opened" @hide="resetForm" content-classes="modal-container-sm">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-8">
            <h5>Créer une nouvelle <span class="text-weight-bold">fiche bénéficiaire</span></h5>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span>
              <q-icon name="clear" @click.native="opened = false" /></span>
          </div>
        </div>
        <ni-modal-select v-model="newCustomer.identity.title" :error="$v.newCustomer.identity.title.$error" :options="civilityOptions"
          caption="Civilité" @blur="$v.newCustomer.identity.title.$touch" required-field />
        <ni-modal-input v-model="newCustomer.identity.lastname" :error="$v.newCustomer.identity.lastname.$error"
          caption="Nom" @blur="$v.newCustomer.identity.lastname.$touch" required-field />
        <ni-modal-input v-model="newCustomer.identity.firstname" caption="Prénom" />
        <div class="row margin-input last">
          <ni-search-address v-model="newCustomer.contact.address.fullAddress" @selected="selectedAddress" @blur="$v.newCustomer.contact.address.fullAddress.$touch"
            :error="$v.newCustomer.contact.address.fullAddress.$error" :error-label="addressError" in-modal required-field />
        </div>
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Créer la fiche" icon-right="add" color="primary" :loading="loading"
        @click="submit" />
    </q-modal>
  </q-page>
</template>

<script>
import { required, email } from 'vuelidate/lib/validators';

import { clear } from '../../../helpers/utils.js';
import { frAddress } from '../../../helpers/vuelidateCustomVal.js';
import SearchAddress from '../../../components/form/SearchAddress';
import NiModalInput from '../../../components/form/ModalInput';
import NiModalSelect from '../../../components/form/ModalSelect';
import { NotifyPositive, NotifyWarning, NotifyNegative } from '../../../components/popup/notify.js';
import { customerProfileValidation } from '../../../helpers/customerProfileValidation.js';
import { REQUIRED_LABEL } from '../../../data/constants';

export default {
  metaInfo: {
    title: 'Répertoire bénéficiaires',
  },
  components: {
    NiSearchAddress: SearchAddress,
    NiModalInput,
    NiModalSelect,
  },
  data () {
    return {
      userCreated: null,
      tableLoading: true,
      loading: false,
      opened: false,
      sendWelcomeMsg: true,
      civilityOptions: [
        { label: 'Monsieur', value: 'M.' },
        { label: 'Madame', value: 'Mme' },
      ],
      newCustomer: {
        identity: {
          title: '',
          lastname: '',
          firstname: '',
        },
        email: '',
        contact: {
          address: { fullAddress: '' },
        },
        isActive: true,
      },
      customersList: [],
      searchStr: '',
      activeCustomers: true,
      pagination: {
        sortBy: 'startDate',
        descending: true,
        page: 1,
        rowsPerPage: 15,
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
          style: 'width: 350px',
        },
        {
          name: 'startDate',
          label: 'Depuis le...',
          field: 'startDate',
          align: 'left',
          sortable: true,
          format: (value) => value ? this.$moment(value).format('DD/MM/YYYY') : 'N/A',
          sort: (a, b) => (this.$moment(a).toDate()) - (this.$moment(b).toDate()),
          style: 'width: 170px',
        },
        {
          name: 'info',
          label: 'Infos',
          field: 'missingInfo',
          align: 'left',
          sortable: true,
          sort: (a, b) => a - b,
          style: 'width: 30px',
        },
        {
          name: 'active',
          label: 'Actif',
          field: 'isActive',
          align: 'right',
          sortable: false,
          style: 'width: 30px',
        },
      ],
    }
  },
  validations: {
    newCustomer: {
      identity: {
        title: { required },
        lastname: { required },
      },
      email: { email },
      contact: {
        address: {
          fullAddress: { required, frAddress },
        },
      },
    },
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
        return REQUIRED_LABEL;
      } else if (!this.$v.newCustomer.contact.address.zipCode.frZipCode || !this.$v.newCustomer.contact.address.zipCode.maxLength) {
        return 'Code postal non valide';
      }
    },
    emailError () {
      if (!this.$v.newCustomer.email.required) {
        return REQUIRED_LABEL;
      } else if (!this.$v.newCustomer.email.email) {
        return 'Email non valide';
      }
    },
    addressError () {
      if (!this.$v.newCustomer.contact.address.fullAddress.required) {
        return REQUIRED_LABEL;
      }
      return 'Adresse non valide';
    },
  },
  methods: {
    async getCustomersList () {
      try {
        const customers = await this.$customers.showAll();
        this.customersList = customers.map((customer) => {
          const formattedCustomer = {
            customer: {
              _id: customer._id,
              name: customer.identity.firstname ? `${customer.identity.firstname} ${customer.identity.lastname}` : customer.identity.lastname,
            },
            startDate: customer.createdAt,
            isActive: customer.isActive,
          }
          if (customer.isActive) {
            formattedCustomer.missingInfo = customerProfileValidation(customer).error !== null;
          }
          return formattedCustomer;
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
    async submit () {
      try {
        this.loading = true;
        this.$v.newCustomer.$touch();
        if (this.$v.newCustomer.$error) return NotifyWarning('Champ(s) invalide(s)');

        const payload = this.$_.pickBy(this.newCustomer);
        const newCustomer = await this.$customers.create(payload);
        await this.$customers.createDriveFolder(newCustomer.data.data.customer._id);
        await this.getCustomersList();
        NotifyPositive('Fiche bénéficiaire créée');
        this.opened = false;
      } catch (e) {
        console.error(e);
        if (e && e.message === 'Invalid fields') return NotifyWarning('Champ(s) invalide(s)');
        NotifyNegative('Erreur lors de la création de la fiche bénéficiaire');
      } finally {
        this.loading = false;
      }
    },
    selectedAddress (item) {
      this.newCustomer.contact.address = Object.assign({}, this.newCustomer.contact.address, item);
    },
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  /deep/ .q-option .q-option-label
    font-size: 14px

</style>
