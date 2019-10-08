<template>
  <q-page class="neutral-background" padding>
    <ni-directory-header title="Répertoire bénéficiaires" toggleLabel="Clients" :toggle="onlyClients" display-toggle
      @updateSearch="updateSearch" />
    <q-table :data="filteredCustomers" :columns="columns" row-key="name" binary-state-sort
      :rows-per-page-options="[15, 25, 35]" :pagination.sync="pagination" :loading="tableLoading"
      class="people-list q-pa-sm">
      <q-tr slot="body" slot-scope="props" :props="props" class="datatable-row"
        @click.native="goToCustomerProfile(props.row._id)">
        <q-td v-for="col in props.cols" :key="col.name" :props="props">
          <q-item v-if="col.name === 'fullName'">
            <q-item-main :label="col.value" />
          </q-item>
          <template v-else-if="col.name === 'client'">
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
        <ni-select in-modal v-model="newCustomer.identity.title" :error="$v.newCustomer.identity.title.$error"
          :options="civilityOptions" caption="Civilité" @blur="$v.newCustomer.identity.title.$touch" required-field />
        <ni-input in-modal v-model="newCustomer.identity.lastname" :error="$v.newCustomer.identity.lastname.$error"
          caption="Nom" @blur="$v.newCustomer.identity.lastname.$touch" required-field />
        <ni-input in-modal v-model="newCustomer.identity.firstname" caption="Prénom" />
        <div class="row margin-input last">
          <ni-search-address v-model="newCustomer.contact.primaryAddress" @blur="$v.newCustomer.contact.primaryAddress.$touch"
            :error="$v.newCustomer.contact.primaryAddress.$error" :error-label="addressError" in-modal required-field />
        </div>
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Créer la fiche" icon-right="add" color="primary"
        :loading="loading" @click="submit" />
    </q-modal>
  </q-page>
</template>

<script>
import { required, email } from 'vuelidate/lib/validators';

import { frAddress } from '../../../helpers/vuelidateCustomVal.js';
import SearchAddress from '../../../components/form/SearchAddress';
import Input from '../../../components/form/Input';
import Select from '../../../components/form/Select';
import DirectoryHeader from '../../../components/DirectoryHeader';
import { NotifyPositive, NotifyWarning, NotifyNegative } from '../../../components/popup/notify.js';
import { customerProfileValidation } from '../../../helpers/customerProfileValidation.js';
import { REQUIRED_LABEL } from '../../../data/constants';
import { validationMixin } from '../../../mixins/validationMixin.js';
import { formatIdentity } from '../../../helpers/utils';

export default {
  name: 'CustomersDirectory',
  metaInfo: {
    title: 'Répertoire bénéficiaires',
  },
  mixins: [validationMixin],
  components: {
    'ni-search-address': SearchAddress,
    'ni-input': Input,
    'ni-select': Select,
    'ni-directory-header': DirectoryHeader,
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
          primaryAddress: { fullAddress: '' },
        },
      },
      customersList: [],
      searchStr: '',
      onlyClients: false,
      pagination: {
        sortBy: 'createdAt',
        descending: true,
        page: 1,
        rowsPerPage: 15,
      },
      columns: [
        {
          name: 'fullName',
          label: 'Nom',
          field: 'identity',
          format: value => value ? value.fullName : '',
          align: 'left',
          sortable: true,
          sort: (a, b) => {
            const aLastname = a.lastname;
            const bLastname = b.lastname;
            return aLastname.toLowerCase() < bLastname.toLowerCase() ? -1 : 1
          },
          style: 'width: 350px',
        },
        {
          name: 'createdAt',
          label: 'Depuis le...',
          field: 'createdAt',
          align: 'left',
          sortable: true,
          format: (value) => value ? this.$moment(value).format('DD/MM/YYYY') : 'N/A',
          sort: (a, b) => (this.$moment(a).toDate()) - (this.$moment(b).toDate()),
          style: 'width: 85px',
        },
        {
          name: 'firstIntervention',
          label: '1ère intervention',
          field: 'firstIntervention',
          align: 'left',
          sortable: false,
          format: (value) => value && value.startDate ? this.$moment(value.startDate).format('DD/MM/YYYY') : '',
          style: 'width: 85px',
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
          name: 'client',
          label: 'Client',
          field: 'firstIntervention',
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
        primaryAddress: {
          zipCode: { required },
          street: { required },
          city: { required },
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
    clientsCustomerList () {
      return this.onlyClients ? this.customersList.filter(customer => customer.firstIntervention) : this.customersList;
    },
    filteredCustomers () {
      return this.clientsCustomerList.filter(customer => customer.identity.fullName.match(new RegExp(this.searchStr, 'i')));
    },
    zipCodeError () {
      if (!this.$v.newCustomer.contact.primaryAddress.zipCode.required) {
        return REQUIRED_LABEL;
      } else if (!this.$v.newCustomer.contact.primaryAddress.zipCode.frZipCode || !this.$v.newCustomer.contact.primaryAddress.zipCode.maxLength) {
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
      if (!this.$v.newCustomer.contact.primaryAddress.fullAddress.required) {
        return REQUIRED_LABEL;
      }
      return 'Adresse non valide';
    },
  },
  methods: {
    updateSearch (value) {
      this.searchStr = value;
    },
    async getCustomersList () {
      try {
        const customers = await this.$customers.list();
        this.customersList = customers.map((customer) => {
          return {
            ...customer,
            identity: {
              ...customer.identity,
              fullName: formatIdentity(customer.identity, 'FL'),
            },
            missingInfo: customerProfileValidation(customer).error !== null,
          };
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
      this.newCustomer = {
        identity: {
          title: '',
          lastname: '',
          firstname: '',
        },
        email: '',
        contact: {
          primaryAddress: { fullAddress: '' },
        },
      };
    },
    async submit () {
      try {
        this.loading = true;
        this.$v.newCustomer.$touch();
        const isValid = await this.waitForFormValidation(this.$v.newCustomer);
        if (!isValid) return NotifyWarning('Champ(s) invalide(s)');

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
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  /deep/ .q-option .q-option-label
    font-size: 14px

</style>
