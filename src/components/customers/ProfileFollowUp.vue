<template>
  <div v-if="isLoaded">
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Pratique</p>
      </div>
      <div class="row gutter-profile">
        <ni-input caption="Accès / codes" v-model="customer.contact.accessCodes" @focus="saveTmp('contact.accessCodes')"
          @blur="updateCustomer('contact.accessCodes')" />
        <ni-input v-if="isAuxiliary" caption="Téléphone" type="tel" :error="$v.customer.contact.phone.$error"
          error-label="Numéro de téléphone non valide" v-model.trim="customer.contact.phone"
          @focus="saveTmp('contact.phone')" @blur="updateCustomer('contact.phone')" />
        <ni-search-address v-if="isAuxiliary" caption='Adresse principale' v-model="customer.contact.primaryAddress" color="white" disable />
        <ni-search-address v-if="isAuxiliary && customer.contact.secondaryAddress" caption='Adresse secondaire' v-model="customer.contact.secondaryAddress" color="white" disable />
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Accompagnement</p>
      </div>
      <div class="row gutter-profile">
        <ni-input  caption="Environnement du bénéficiaire" v-model="customer.followUp.environment" :rows="6" type="textarea"
          @blur="updateCustomer('followUp.environment')" @focus="saveTmp('followUp.environment')" />
        <ni-input  caption="Objectifs de l’accompagnement" v-model="customer.followUp.objectives" :rows="6" type="textarea"
          @blur="updateCustomer('followUp.objectives')" @focus="saveTmp('followUp.objectives')" />
        <ni-input  caption="Autres" v-model="customer.followUp.misc" :rows="1" type="textarea"
          @blur="updateCustomer('followUp.misc')" @focus="saveTmp('followUp.misc')" />
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Aidants</p>
      </div>
      <q-table :data="sortedHelpers" :columns="helperColumns" row-key="name" :pagination="helperPagination"
        hide-bottom />
    </div>
    <div class="q-mb-xl" v-if="customer.firstIntervention">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Auxiliaires</p>
      </div>
      <q-table :data="customerFollowUp" :columns="followUpColumns" row-key="name" :pagination.sync="followUpPagination"
        :rows-per-page-options="[]" class="table-fixed">
        <q-td slot="body-cell-identity" slot-scope="props" :props="props">
          <q-item>
            <q-item-side :avatar="props.value.picture.link | getAvatar" />
            <q-item-main>
              <span class="identity-block q-mr-sm">{{ props.value.identity | formatIdentity('Fl') }}</span>
              <span class="identity-block">({{ props.value.sector.name }})</span>
            </q-item-main>
          </q-item>
        </q-td>
      </q-table>
    </div>
  </div>
</template>

<script>
import Input from '../form/Input';
import Select from '../form/Select';
import { NotifyNegative } from '../popup/notify.js';
import { AUXILIARY_ROLES, DEFAULT_AVATAR } from '../../data/constants';
import SearchAddress from '../form/SearchAddress';
import { extend, formatIdentity } from '../../helpers/utils.js';
import { customerMixin } from '../../mixins/customerMixin.js';
import { validationMixin } from '../../mixins/validationMixin.js';
import { frPhoneNumber } from '../../helpers/vuelidateCustomVal';

export default {
  name: 'ProfileFollowUp',
  components: {
    'ni-input': Input,
    'ni-select': Select,
    'ni-search-address': SearchAddress,
  },
  mixins: [customerMixin, validationMixin],
  data () {
    return {
      isLoaded: false,
      customer: { followUp: {}, contact: {} },
      tmpInput: '',
      helpers: [],
      customerFollowUp: [],
      followUpColumns: [
        {
          name: 'identity',
          align: 'left',
          field: row => row,
        },
        {
          name: 'hours',
          align: 'center',
          label: 'Heures réalisées',
          field: row => `${Math.trunc(row.totalHours)}h`,
        },
        {
          name: 'lastEvent',
          align: 'center',
          label: 'Dernière inter.',
          field: row => this.$moment(row.lastEvent.startDate).format('DD/MM/YYYY'),
        },
      ],
      followUpPagination: { rowsPerPage: 5 },
      helperColumns: [
        {
          name: 'identity',
          label: 'Identité',
          align: 'left',
          field: row => formatIdentity(row.identity, 'LF'),
        },
        {
          name: 'email',
          label: 'Email',
          align: 'left',
          field: row => row.local.email,
        },
      ],
      helperPagination: { rowsPerPage: 0 },
    };
  },
  validations: {
    customer: {
      contact: {
        phone: { frPhoneNumber },
      },
    },
  },
  computed: {
    userProfile () {
      return this.$store.getters['rh/getUserProfile'];
    },
    currentUser () {
      return this.$store.getters['main/user'];
    },
    isAuxiliary () {
      return AUXILIARY_ROLES.includes(this.currentUser.role.name);
    },
    sortedHelpers () {
      return [...this.helpers].sort((u1, u2) => {
        return (u1.identity.lastname || '').localeCompare((u2.identity.lastname || ''));
      });
    },
  },
  async mounted () {
    await this.getCustomer(this.userProfile._id);
    await this.getUserHelpers();
    if (this.customer.firstIntervention) await this.getCustomerFollowUp();
  },
  methods: {
    async getUserHelpers () {
      try {
        this.helpers = await this.$users.showAll({ customers: this.userProfile._id });
      } catch (e) {
        this.helpers = [];
        NotifyNegative('Erreur lors de la récupération des aidants');
      }
    },
    async getCustomerFollowUp () {
      try {
        this.customerFollowUp = await this.$stats.getCustomerFollowUp({ customer: this.customer._id });
      } catch (e) {
        this.customerFollowUp = [];
        NotifyNegative('Erreur lors de la récupération des auxiliaires');
      }
    },
    async getCustomer (customerId) {
      try {
        const customer = await this.$customers.getById(customerId);
        this.mergeCustomer(customer);
        this.isLoaded = true;
        this.$v.customer.$touch();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du chargement des données');
      }
    },
    mergeCustomer (value = null) {
      const args = [this.customer, value];
      this.customer = Object.assign({}, extend(true, ...args));
    },
    saveTmp (path) {
      this.tmpInput = this.$_.get(this.customer, path);
    },
  },
  filters: {
    formatIdentity,
    getAvatar (link) {
      return link || DEFAULT_AVATAR;
    },
  },
}
</script>

<style lang="stylus" scoped>
  .identity-block
    display: inline-block;
    font-size: 12px;
  .q-item
    padding: 0;
  .table-fixed >>> table
    table-layout: fixed;

</style>
