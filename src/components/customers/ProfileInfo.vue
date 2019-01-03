<template>
  <div v-if="isLoaded">
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Identité</p>
      </div>
      <div class="row gutter-profile">
        <ni-input caption="Prénom" v-model="customer.identity.firstname" @focus="saveTmp('identity.firstname')" @blur="updateUser({ alenvi: 'identity.firstname', ogust: 'first_name' })" />
        <ni-input caption="Nom" :error="$v.customer.identity.lastname.$error" errorLabel="Champ requis" v-model="customer.identity.lastname" @focus="saveTmp('identity.lastname')" @blur="updateUser({ alenvi: 'identity.lastname', ogust: 'last_name' })" />
        <div class="col-xs-12 col-md-6">
          <ni-datetime-picker v-model="customer.identity.birthDate" @focus="saveTmp('identity.birthDate')" caption="Date de naissance"
            @blur="updateUser({ alenvi: 'identity.birthDate', ogust: 'date_of_birth' })"
          />
        </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Contact</p>
      </div>
      <div class="row gutter-profile">
        <ni-input caption="Téléphone" type="tel" :error="$v.customer.contact.phone.$error" errorLabel="Numéro de téléphone non valide"
          v-model.trim="customer.contact.phone" @focus="saveTmp('contact.phone')" @blur="updateUser({ alenvi: 'contact.phone', ogust: 'mobile_phone' })" />
        <ni-search-address v-model="customer.contact.address.fullAddress" color="white" inverted-light @focus="saveTmp('contact.address.fullAddress')"
          @blur="updateUser({ alenvi: 'contact.address', ogust: 'address' })" @selected="selectedAddress" :error-label="addressError"
          :error="$v.customer.contact.address.fullAddress.$error"
        />
        <ni-input caption="Code porte" v-model="customer.contact.doorCode" @focus="saveTmp('contact.doorCode')" @blur="updateUser({ alenvi: 'contact.doorCode', ogust: 'door_code' })" />
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Souscriptions</p>
      </div>
      <q-card>
        <q-card-main>
          <q-table :data="customer.subscriptions" :columns="subscriptionsColumns" row-key="name" table-style="font-size: 1rem" hide-bottom>
            <q-td slot="body-cell-remove" slot-scope="props" :props="props">
              <q-icon name="delete" size="1.2rem" color="grey" class="cursor-pointer" @click.native="removeSubscriptions(props.value)" />
            </q-td>
          </q-table>
        </q-card-main>
        <q-card-actions align="end">
          <q-btn :disable="serviceOptions.length === 0" flat no-caps color="primary" icon="add" label="Ajouter une souscription" @click="addSubscription = true"/>
        </q-card-actions>
      </q-card>
      <div v-if="customer.subscriptions && customer.subscriptions.length > 0" class="row">
          <div class="col-xs-12 row no-wrap">
            <q-checkbox v-model="customer.subscriptionsAccepted" disable class="q-mr-sm" />
            <span>Validation en ligne des souscriptions<span class="text-weight-thin text-italic"> {{ acceptedByHelper }}</span></span>
          </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Devis</p>
      </div>
      <q-card>
        <q-card-main>
          <q-table :data="customer.quotes" :columns="quoteColumns" row-key="name" table-style="font-size: 1rem" hide-bottom :pagination.sync="pagination"
            :visible-columns="visibleQuoteColumns" binary-state-sort
          >
            <q-td slot="body-cell-emptyQuote" slot-scope="props" :props="props">
              <q-btn flat round small color="primary" @click="downloadQuote(props.row)">
                <q-icon name="file download" />
              </q-btn>
            </q-td>
            <q-td slot="body-cell-signedQuote" slot-scope="props" :props="props">
              <div v-if="!props.row.drive || !props.row.drive.link" class="row justify-between">
                <q-uploader :ref="`signedQuote_${props.row._id}`" name="signedQuote" hide-underline :url="docsUploadUrl" :headers="headers"
                  extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf" hide-upload-button @add="uploadDocument($event, `signedQuote_${props.row._id}`)"
                  @uploaded="refreshQuotes" @fail="failMsg" :additional-fields="[
                    { name: 'quoteId', value: props.row._id },
                    { name: 'fileName', value: `devis_signe_${customer.identity.firstname}_${customer.identity.lastname}` }
                  ]"
                />
              </div>
              <q-btn v-else flat round small color="primary">
                <a :href="props.row.drive.link" download>
                  <q-icon name="file download" />
                </a>
              </q-btn>
            </q-td>
            <q-td slot="body-cell-signed" slot-scope="props" :props="props">
              <div :class="[{ activeDot: props.value, inactiveDot: !props.value }]" />
            </q-td>
          </q-table>
        </q-card-main>
        <q-card-actions align="end">
          <q-btn :disabled="this.customer.subscriptions.length === 0" flat no-caps color="primary" icon="add" label="Générer un devis" @click="generateQuote"/>
        </q-card-actions>
      </q-card>
    </div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Aidants</p>
      <q-card>
        <q-card-main>
          <q-table :data="userHelpers" :columns="helpersColumns" row-key="name" table-style="font-size: 1rem" hide-bottom>
            <q-td slot="body-cell-remove" slot-scope="props" :props="props">
              <q-icon name="delete" size="1.2rem" color="grey" class="cursor-pointer" @click.native="removeHelper(props.value)" />
            </q-td>
          </q-table>
        </q-card-main>
        <q-card-actions align="end">
          <q-btn flat no-caps color="primary" icon="add" label="Ajouter un aidant" @click="addHelper = true" />
        </q-card-actions>
      </q-card>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Moyen de paiement</p>
      </div>
      <div class="row gutter-profile q-mb-lg">
        <ni-input caption="Nom associé au compte bancaire" :error="$v.customer.payment.bankAccountOwner.$error" errorLabel="Champ requis"
          v-model="customer.payment.bankAccountOwner" @focus="saveTmp('payment.bankAccountOwner')" @blur="updateUser({ alenvi: 'payment.bankAccountOwner', ogust: 'holder' })" />
        <ni-input caption="IBAN" :error="$v.customer.payment.iban.$error" errorLabel="IBAN non valide"
          v-model="customer.payment.iban" @focus="saveTmp('payment.iban')" @blur="updateUser({ alenvi: 'payment.iban', ogust: 'iban_number' })" />
        <ni-input caption="BIC" :error="$v.customer.payment.bic.$error" errorLabel="BIC non valide"
          v-model="customer.payment.bic" @focus="saveTmp('payment.bic')" @blur="updateUser({ alenvi: 'payment.bic', ogust: 'bic_number' })" />
      </div>
      <q-card>
        <q-card-title>Mandats de prélèvement</q-card-title>
        <q-card-main>
          <q-table :columns="mandateColumns" :data="customer.payment.mandates" hide-bottom :pagination.sync="pagination" :visible-columns="visibleMandateColumns"
            binary-state-sort>
            <q-td slot="body-cell-emptyMandate" slot-scope="props" :props="props">
              <q-btn v-if="customer.payment.mandates && props.row.__index == customer.payment.mandates.length - 1" flat round small color="primary" @click="downloadMandate(props.row)">
                <q-icon name="file download" />
              </q-btn>
            </q-td>
            <q-td slot="body-cell-signed" slot-scope="props" :props="props">
              <div :class="[{ activeDot: props.value, inactiveDot: !props.value }]" />
            </q-td>
            <q-td slot="body-cell-signedMandate" slot-scope="props" :props="props">
              <div v-if="!props.row.drive || !props.row.drive.link" class="row justify-between">
                <q-uploader :ref="`signedMandate_${props.row._id}`" name="signedMandate" :url="docsUploadUrl" :headers="headers" hide-underline
                  extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf" hide-upload-button @add="uploadDocument($event, `signedMandate_${props.row._id}`)"
                  @uploaded="refreshMandates" @fail="failMsg" :additional-fields="[
                    { name: 'mandateId', value: props.row._id },
                    { name: 'fileName', value: `mandat_signe_${customer.identity.firstname}_${customer.identity.lastname}` }
                  ]"
                />
              </div>
              <q-btn v-else flat round small color="primary">
                <a :href="props.row.drive.link" download>
                  <q-icon name="file download" />
                </a>
              </q-btn>
            </q-td>
            <q-td slot="body-cell-signedAt" slot-scope="props" :props="props">
              <ni-datetime-picker v-model="customer.payment.mandates[props.row.__index].signedAt" withBorders @blur="updateSignedAt(props.row)"
                @focus="saveTmpSignedAt(props.row.__index)"
              />
            </q-td>
          </q-table>
        </q-card-main>
      </q-card>
    </div>

    <!-- Add helper modal -->
    <q-modal v-model="addHelper" @hide="resetHelperForm" :content-css="modalCssContainer">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-8">
            <h5>Ajouter une <span class="text-weight-bold">personne</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span><q-icon name="clear" size="1rem" @click.native="addHelper = false" /></span>
          </div>
        </div>
        <ni-modal-input v-model="newHelper.lastname" :error="$v.newHelper.lastname.$error" caption="Nom" @blur="$v.newHelper.lastname.$touch" />
        <ni-modal-input v-model="newHelper.firstname" :error="$v.newHelper.firstname.$error" caption="Prénom" @blur="$v.newHelper.firstname.$touch" />
        <ni-modal-input v-model="newHelper.local.email" last :error="$v.newHelper.local.email.$error" caption="Email"
          @blur="$v.newHelper.local.email.$touch" :errorLabel="emailError" />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Ajouter un aidant" icon-right="add" color="primary" :loading="loading" @click="submitHelper" />
    </q-modal>

    <!-- Add subscription modal -->
    <q-modal v-model="addSubscription" @hide="resetSubscriptionForm" :content-css="modalCssContainer">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-8">
            <h5>Ajouter une <span class="text-weight-bold">souscription</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span><q-icon name="clear" size="1rem" @click.native="addSubscription = false" /></span>
          </div>
        </div>
        <ni-modal-select caption="Service" :options="serviceOptions" v-model="newSubscription.service" :error="$v.newSubscription.service.$error"
          @blur="$v.newSubscription.service.$touch" @input="updateNewSubscription"
        />
        <ni-modal-input v-model="newSubscription.unitTTCRate" :error="$v.newSubscription.unitTTCRate.$error" caption="Prix unitaire TTC"
          @blur="$v.newSubscription.unitTTCRate.$touch" type="number"
        />
        <ni-modal-input v-model="newSubscription.estimatedWeeklyVolume" :error="$v.newSubscription.estimatedWeeklyVolume.$error"
          caption="Volume hebdomadaire estimatif" @blur="$v.newSubscription.estimatedWeeklyVolume.$touch" type="number"
        />
        <ni-modal-input v-if="newSubscription.nature !== 'Forfaitaire'" v-model="newSubscription.sundays" caption="Dont dimanche (h)" type="number" />
        <ni-modal-input v-if="newSubscription.nature !== 'Forfaitaire'" v-model="newSubscription.evenings" caption="Dont soirée (h)" last type="number" />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Ajouter une souscription" icon-right="add" color="primary" :loading="loading" @click="submitSubscription" />
    </q-modal>
  </div>
</template>

<script>
import { Cookies } from 'quasar';
import { required, email } from 'vuelidate/lib/validators';
import randomize from 'randomatic';

import { extend, clear } from '../../helpers/utils.js';
import { NotifyPositive, NotifyWarning, NotifyNegative } from '../../components/popup/notify.js';
import SearchAddress from '../form/SearchAddress';
import Input from '../form/Input.vue';
import NiModalInput from '../form/ModalInput';
import NiModalSelect from '../form/ModalSelect';
import { frPhoneNumber, iban, bic, frAddress } from '../../helpers/vuelidateCustomVal';
import DatetimePicker from '../form/DatetimePicker';
import { downloadDocxFile } from '../../helpers/downloadFile';
import { customerMixin } from '../../mixins/customerMixin.js';

export default {
  name: 'ProfileInfo',
  components: {
    NiSearchAddress: SearchAddress,
    NiInput: Input,
    NiModalInput,
    NiModalSelect,
    'ni-datetime-picker': DatetimePicker,
  },
  mixins: [customerMixin],
  data () {
    return {
      loading: false,
      addHelper: false,
      addSubscription: false,
      isLoaded: false,
      tmpInput: '',
      modalCssContainer: {
        minWidth: '30vw'
      },
      customer: {
        identity: {},
        contact: {
          address: {}
        },
        payment: {
          mandates: [],
        },
        subscriptions: [],
        quotes: [],
      },
      subscriptionsColumns: [
        {
          name: 'service',
          label: 'Service',
          align: 'left',
          field: row => row.service.name,
        },
        {
          name: 'nature',
          label: 'Nature du service',
          align: 'left',
          field: row => row.service.nature,
        },
        {
          name: 'unitTTCRate',
          label: 'Prix unitaire TTC',
          align: 'center',
          field: row => `${this.formatNumber(row.unitTTCRate)}€`,
        },
        {
          name: 'estimatedWeeklyVolume',
          label: 'Volume hebdomadaire estimatif',
          align: 'center',
          field: row => row.service.nature === 'Horaire' ? `${row.estimatedWeeklyVolume}h` : row.estimatedWeeklyVolume,
        },
        {
          name: 'sundays',
          label: 'dont dimanches',
          align: 'center',
          field: row => row.service.nature === 'Horaire' && row.sundays ? `${row.sundays}h` : row.sundays,
        },
        {
          name: 'evenings',
          label: 'dont soirées (après 20h)',
          align: 'center',
          field: row => row.service.nature === 'Horaire' && row.evenings ? `${row.evenings}h` : row.evenings,
        },
        {
          name: 'remove',
          label: '',
          align: 'left',
          field: '_id',
        },
      ],
      helpersColumns: [
        {
          name: 'lastname',
          label: 'Nom',
          align: 'left',
          field: 'lastname'
        },
        {
          name: 'firstname',
          label: 'Prénom',
          align: 'left',
          field: 'firstname'
        },
        {
          name: 'startDate',
          label: 'Depuis le...',
          field: 'createdAt',
          align: 'left',
          format: (value) => this.$moment(value).format('DD/MM/YYYY'),
          sort: (a, b) => (this.$moment(a).toDate()) - (this.$moment(b).toDate()),
        },
        {
          name: 'remove',
          label: '',
          align: 'left',
          field: '_id',
          style: 'width: 50px'
        }
      ],
      quoteColumns: [
        {
          name: 'quoteNumber',
          label: 'Numéro du devis',
          align: 'left',
          field: 'quoteNumber',
        },
        {
          name: 'emptyQuote',
          label: 'Devis',
          align: 'left',
          field: 'emptyQuote',
        },
        {
          name: 'signedQuote',
          label: 'Devis signé',
          align: 'left',
          field: 'signedQuote',
        },
        {
          name: 'signed',
          label: 'Signé',
          align: 'left',
          field: row => row.drive && row.drive.id,
        },
        {
          name: 'createdAt',
          label: '',
          field: 'createdAt',
          align: 'left',
          sortable: true,
          format: (value) => this.$moment(value).format('DD/MM/YYYY'),
          sort: (a, b) => (this.$moment(a).toDate()) - (this.$moment(b).toDate()),
        },
      ],
      userHelpers: [],
      newHelper: {
        lastname: '',
        firstname: '',
        local: { email: '' }
      },
      newSubscription: {
        service: '',
        unitTTCRate: '',
        estimatedWeeklyVolume: '',
      },
      visibleMandateColumns: ['rum', 'emptyMandate', 'signedMandate', 'signed', 'signedAt'],
      visibleQuoteColumns: ['quoteNumber', 'emptyQuote', 'signedQuote', 'signed'],
      mandateColumns: [
        {
          name: 'rum',
          label: 'RUM',
          align: 'left',
          field: 'rum',
        },
        {
          name: 'emptyMandate',
          label: 'Mandat',
          align: 'left',
          field: 'emptyMandate',
        },
        {
          name: 'signedMandate',
          label: 'Mandat signé',
          align: 'left',
          field: 'signedMandate',
        },
        {
          name: 'signed',
          label: 'Signé',
          align: 'left',
          field: 'signedAt',
        },
        {
          name: 'signedAt',
          label: 'Date de signature',
          align: 'left',
          field: 'signedAt',
        },
        {
          name: 'createdAt',
          label: '',
          field: 'createdAt',
          align: 'left',
          sortable: true,
          format: (value) => this.$moment(value).format('DD/MM/YYYY'),
          sort: (a, b) => (this.$moment(a).toDate()) - (this.$moment(b).toDate()),
        },
      ],
      pagination: {
        sortBy: 'createdAt',
        ascending: true,
        rowsPerPage: 0,
      },
    }
  },
  computed: {
    docsUploadUrl () {
      return `${process.env.API_HOSTNAME}/customers/${this.customer._id}/gdrive/${this.customer.driveFolder.id}/upload`;
    },
    headers () {
      return {
        'x-access-token': Cookies.get('alenvi_token') || ''
      }
    },
    company () {
      return this.$store.getters['main/company'];
    },
    serviceOptions () {
      if (!this.company.customersConfig || !this.company.customersConfig.services) {
        return [];
      }

      const subscribedServices = this.customer.subscriptions.map(subscription => subscription.service._id);
      const availableServices = this.company.customersConfig.services.filter(service => !subscribedServices.includes(service._id));

      return availableServices.map(service => ({
        label: service.name,
        value: service._id,
      }));
    },
    userProfile () {
      return this.$store.getters['rh/getUserProfile'];
    },
    addressError () {
      if (!this.$v.customer.contact.address.fullAddress.required) {
        return 'Champ requis';
      }
      return 'Adresse non valide';
    },
    ibanError () {
      if (!this.$v.customer.payment.iban.required) {
        return 'Champ requis';
      } else if (!this.$v.customer.payment.iban.iban) {
        return 'IBAN non valide';
      }
    },
    bicError () {
      if (!this.$v.customer.payment.bic.required) {
        return 'Champ requis';
      } else if (!this.$v.customer.payment.bic.bic) {
        return 'BIC non valide';
      }
    },
    emailError () {
      if (!this.$v.newHelper.local.email.required) {
        return 'Champ requis';
      } else if (!this.$v.newHelper.local.email.email) {
        return 'Email non valide';
      }
    },
    acceptedByHelper () {
      if (this.lastSubscriptionHistory && this.customer.subscriptionsAccepted) {
        return `le ${this.$moment(this.lastSubscriptionHistory.approvalDate).format('DD/MM/YYYY')} par ${this.acceptedBy}`;
      }
    }
  },
  validations: {
    customer: {
      identity: {
        lastname: { required }
      },
      contact: {
        phone: { frPhoneNumber },
        address: {
          fullAddress: { required, frAddress }
        }
      },
      payment: {
        bankAccountOwner: { required },
        bic: { required, bic },
        iban: { required, iban }
      }
    },
    newHelper: {
      lastname: { required },
      firstname: { required },
      local: {
        email: { required, email }
      }
    },
    newSubscription: {
      service: { required },
      unitTTCRate: { required },
      estimatedWeeklyVolume: { required },
    },
  },
  watch: {
    userProfile (value) {
      if (!this.$_.isEqual(value, this.customer)) {
        this.mergeUser(value);
      }
    }
  },
  async mounted () {
    await this.getUserHelpers();
    await this.refreshCustomer();
    this.isLoaded = true;
  },
  methods: {
    formatNumber (number) {
      return parseFloat(Math.round(number * 100) / 100).toFixed(1)
    },
    updateNewSubscription () {
      if (this.newSubscription.service !== '') {
        const selectedService = this.company.customersConfig.services.find(service => service._id === this.newSubscription.service);
        this.newSubscription.unitTTCRate = selectedService.defaultUnitAmount;
        this.newSubscription.nature = selectedService.nature;
      }
    },
    mergeUser (value = null) {
      const args = [this.customer, value];
      this.customer = Object.assign({}, extend(true, ...args));
    },
    selectedAddress (item) {
      this.customer.contact.address = Object.assign({}, this.customer.contact.address, item);
    },
    saveTmp (path) {
      this.tmpInput = this.$_.get(this.customer, path)
    },
    saveTmpSignedAt (index) {
      this.tmpInput = this.customer.payment.mandates[index].signedAt;
    },
    async getUserHelpers () {
      try {
        this.userHelpers = await this.$users.showAll({ customers: this.userProfile._id });
      } catch (e) {
        console.error(e);
      }
    },
    async refreshSubscriptions () {
      try {
        this.customer.subscriptions = await this.$customers.getSubscriptions(this.customer._id);

        this.$store.commit('rh/saveUserProfile', this.customer);
        this.$v.customer.$touch();
      } catch (e) {
        console.error(e);
      }
    },
    async refreshMandates () {
      try {
        this.customer.payment.mandates = await this.$customers.getMandates(this.customer._id);

        this.$store.commit('rh/saveUserProfile', this.customer);
        this.$v.customer.$touch();
      } catch (e) {
        console.error(e);
      }
    },
    async refreshQuotes () {
      try {
        this.customer.quotes = await this.$customers.getQuotes(this.customer._id);

        this.$store.commit('rh/saveUserProfile', this.customer);
        this.$v.customer.$touch();
      } catch (e) {
        console.error(e);
      }
    },
    async refreshCustomer () {
      const customerRaw = await this.$customers.getById(this.userProfile._id);
      const customer = customerRaw.data.data.customer;
      this.mergeUser(customer);

      this.$store.commit('rh/saveUserProfile', this.customer);
      this.$v.customer.$touch();
    },
    async updateSignedAt (mandate) {
      try {
        if (!mandate.signedAt || this.tmpInput === mandate.signedAt) return;
        const params = {
          _id: this.customer._id,
          mandateId: mandate._id,
        };
        await this.$customers.updateMandate(params, mandate);
        this.refreshMandates();
        NotifyPositive('Modification enregistrée');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification');
      }
    },
    async updateUser (paths) {
      try {
        if (this.tmpInput === this.$_.get(this.customer, paths.alenvi)) return;
        if (this.$_.get(this.$v.customer, paths.alenvi)) {
          const isValid = await this.waitForValidation(paths.alenvi);
          if (!isValid) return NotifyWarning('Champ(s) invalide(s)');
        }
        if (paths.alenvi && paths.ogust) {
          await this.updateAlenviCustomer(paths.alenvi);
          await this.updateOgustCustomer(paths);
        } else if (paths.alenvi) {
          await this.updateAlenviCustomer(paths.alenvi);
        } else {
          await this.updateOgustCustomer(paths);
        }
        NotifyPositive('Modification enregistrée');
        if (paths.alenvi.match(/iban/i)) {
          this.refreshCustomer();
        }

        this.$store.commit('rh/saveUserProfile', this.customer);
      } catch (e) {
        console.error(e);
        if (e.message === 'Champ(s) invalide(s)') {
          return NotifyWarning(e.message)
        }
        NotifyNegative('Erreur lors de la modification');
      } finally {
        this.tmpInput = '';
      }
    },
    async updateAlenviCustomer (path) {
      let value = this.$_.get(this.customer, path);
      if (path.match(/iban/i)) {
        value = value.split(' ').join('');
      }
      const payload = this.$_.set({}, path, value);
      payload._id = this.userProfile._id;
      await this.$customers.updateById(payload);
    },
    async updateOgustCustomer (paths) {
      let value = this.$_.get(this.customer, paths.alenvi);
      if (paths.ogust.match(/date_of_birth/i)) {
        value = this.$moment(value).format('YYYYMMDD');
      }
      if (paths.ogust.match(/iban_number/i)) {
        value = value.split(' ').join('');
      }
      const payload = this.$_.set({}, paths.ogust, value);
      if (paths.ogust.match(/((iban|bic)_number)|holder/i)) {
        if (this.customer.payment && this.customer.payment.bankAccountOwner && this.customer.payment.iban && this.customer.payment.bic) {
          payload.bic_number = this.customer.payment.bic;
          payload.iban_number = this.customer.payment.iban;
          payload.id_tiers = this.userProfile.customerId;
          await this.$ogust.setEmployeeBankInfo(payload);
        }
      } else if (paths.ogust === 'address') {
        const { street, zipCode, city } = payload.address;
        const addressPayload = {
          line: street,
          zip: zipCode,
          city,
          id_address: this.userProfile.contact.ogustAddressId
        }
        await this.$ogust.setAddress(addressPayload);
      } else {
        await this.$ogust.editOgustCustomer(this.userProfile.customerId, payload);
      }
    },
    async removeHelper (helperId) {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Es-tu sûr(e) de vouloir supprimer cet aidant ?',
          ok: true,
          cancel: 'Annuler'
        });
        const helper = this.userHelpers.find(helper => helper._id === helperId);
        const { ogustInterlocId } = helper;
        await this.$ogust.deleteContact(ogustInterlocId);
        await this.$users.deleteById(helperId);
        NotifyPositive('Aidant supprimé');
        await this.getUserHelpers();
      } catch (e) {
        console.error(e);
      }
    },
    waitForValidation (path) {
      return new Promise((resolve) => {
        if (path === 'contact.address') {
          const unwatch = this.$watch(() => !this.$v.customer.contact.address.$pending, (notPending) => {
            if (notPending) {
              if (unwatch) {
                unwatch();
              }
              resolve(!this.$v.customer.contact.address.$error);
            }
          }, { immediate: true });
        } else {
          this.$_.get(this.$v.customer, path).$touch();
          resolve(!this.$_.get(this.$v.customer, path).$error);
        }
      })
    },
    async createOgustHelper () {
      const payload = {
        id_customer: this.userProfile.customerId.toString(),
        last_name: this.newHelper.lastname,
        first_name: this.newHelper.firstname,
        email: this.newHelper.local.email
      };
      const newHelper = await this.$ogust.createContact(payload);
      return newHelper;
    },
    async createAlenviHelper () {
      this.newHelper.local.password = randomize('0', 6);
      this.newHelper.customers = [this.userProfile._id];
      this.newHelper.role = 'Aidants';
      await this.$users.create(this.newHelper);
    },
    async sendWelcomingEmail () {
      await this.$email.sendWelcome({
        sender: { email: 'support@alenvi.io' },
        receiver: {
          email: this.newHelper.local.email,
          password: this.newHelper.local.password
        }
      });
    },
    async submitHelper () {
      try {
        this.loading = true;
        this.$v.newHelper.$touch();
        if (this.$v.newHelper.$error) {
          throw new Error('Invalid fields');
        }
        const newHelper = await this.createOgustHelper();
        this.newHelper.ogustInterlocId = newHelper.data.data.contact.id_interloc;
        await this.createAlenviHelper();
        NotifyPositive('Aidant créé');
        await this.sendWelcomingEmail();
        NotifyPositive('Email envoyé');
        await this.getUserHelpers();
        this.addHelper = false
      } catch (e) {
        console.error(e);
        if (e && e.message === 'Invalid fields') {
          this.loading = false;
          NotifyWarning('Champ(s) invalide(s)');
          return;
        }
        if (e && e.response && e.response.status === 409) {
          NotifyNegative('Cet email est déjà utilisé par un compte existant');
          return;
        }
        NotifyNegative('Erreur lors de la création de l\'aidant');
      } finally {
        this.loading = false;
      }
    },
    async submitSubscription () {
      try {
        this.loading = true;
        this.$v.newSubscription.$touch();
        if (this.$v.newSubscription.$error) {
          return NotifyWarning('Champ(s) invalide(s)');
        }
        if (this.newSubscription.nature) delete this.newSubscription.nature;

        await this.$customers.addSubscription(this.customer._id, this.newSubscription);
        this.resetSubscriptionForm();
        this.refreshSubscriptions();
        this.addSubscription = false;
        NotifyPositive('Souscription ajoutée');
      } catch (e) {
        console.error(e);
        if (e.data.statusCode === 409) {
          return NotifyNegative(e.data.message);
        }
        NotifyNegative("Erreur lors de l'ajout d'un souscription");
      } finally {
        this.loading = false;
      }
    },
    async removeSubscriptions (subscriptionId) {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Es-tu sûr(e) de vouloir supprimer cette souscription ?',
          ok: true,
          cancel: 'Annuler'
        });

        const params = { subscriptionId, _id: this.customer._id };

        await this.$customers.removeSubscription(params);
        await this.refreshSubscriptions();
        NotifyPositive('Souscription supprimée');
      } catch (e) {
        console.error(e);
      }
    },
    resetHelperForm () {
      this.$v.newHelper.$reset();
      this.newHelper = Object.assign({}, clear(this.newHelper));
    },
    resetSubscriptionForm () {
      this.$v.newSubscription.$reset();
      this.newSubscription = {
        service: '',
        unitTTCRate: '',
        estimatedWeeklyVolume: '',
      };
    },
    async downloadMandate (doc) {
      try {
        const data = {
          bankAccountOwner: this.customer.payment.bankAccountOwner,
          customerAddress: this.customer.contact.address.fullAddress,
          downloadDate: this.$moment(Date.now()).format('DD/MM/YYYY'),
          ics: this.company.ics,
          rum: doc.rum,
          bic: this.customer.payment.bic || '',
          iban: this.customer.payment.iban || '',
          companyName: this.company.name,
          companyAddress: this.company.address.fullAddress,
        };
        const params = { driveId: this.company.customersConfig.templates.debitMandate.driveId };

        await downloadDocxFile(params, data, 'mandat.docx');
        NotifyPositive('Mandat téléchargé.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du téléchargement du mandat.');
      }
    },
    async uploadDocument (files, refName) {
      if (files[0].size > 5000000) {
        this.$refs[refName].reset();
        NotifyNegative('Fichier trop volumineux (> 5 Mo)');
        return '';
      } else {
        this.$refs[refName].upload();
      }
    },
    async downloadQuote (doc) {
      try {
        const subscriptions = this.customer.subscriptions.map(subscription => {
          let estimatedWeeklyRate = subscription.unitTTCRate * subscription.estimatedWeeklyVolume;
          if (subscription.sundays && subscription.service.holidaySurcharge) {
            estimatedWeeklyRate += subscription.sundays * subscription.unitTTCRate * subscription.service.holidaySurcharge / 100;
          }
          if (subscription.evenings && subscription.service.eveningSurcharge) {
            estimatedWeeklyRate += subscription.evenings * subscription.unitTTCRate * subscription.service.eveningSurcharge / 100;
          }

          return {
            serviceName: subscription.service.name,
            serviceNature: subscription.service.nature,
            unitTTCRate: subscription.unitTTCRate ? `${this.formatNumber(subscription.unitTTCRate)}€` : '',
            weeklyVolume: subscription.estimatedWeeklyVolume,
            sundays: subscription.sundays || '',
            evenings: subscription.evenings || '',
            weeklyRate: estimatedWeeklyRate ? `${this.formatNumber(estimatedWeeklyRate)}€` : '',
          }
        });

        const data = {
          quoteNumber: doc.quoteNumber,
          customerFirstname: this.customer.identity.firstname,
          customerLastname: this.customer.identity.lastname,
          customerAddress: this.customer.contact.address.fullAddress,
          companyName: this.company.name,
          companyAddress: this.company.address.fullAddress,
          rcs: this.company.rcs,
          subscriptions,
          downloadDate: this.$moment(Date.now()).format('DD/MM/YYYY'),
        }
        const params = { driveId: this.company.customersConfig.templates.quote.driveId };
        await downloadDocxFile(params, data, 'devis.docx');
        NotifyPositive('Devis téléchargé.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du téléchargement du devis.');
      }
    },
    async generateQuote () {
      try {
        const subscriptions = this.customer.subscriptions.map(subscription => ({
          serviceName: subscription.service.name,
          unitTTCRate: subscription.unitTTCRate,
          estimatedWeeklyVolume: subscription.estimatedWeeklyVolume,
          sundays: subscription.sundays,
          evenings: subscription.evenings,
        }));
        const payload = { subscriptions };
        await this.$customers.addQuote(this.customer._id, payload);
        await this.refreshQuotes();
        NotifyPositive('Devis généré');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la génération du devis');
      }
    },
    failMsg () {
      NotifyNegative('Echec de l\'envoi du document');
    },
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables';

  /deep/ .bg-negative
    background: white !important
    color: inherit !important

  .q-card
    background: white
    width: 100%
    margin-bottom: 20px

  .q-checkbox
    font-size: 12px
    margin-bottom: 10px

  /deep/ .q-card-title
    font-size: 16px

  /deep/ .q-option-inner
    margin-right: 5px

  /deep/ i.q-checkbox-icon
    opacity: 1 !important

  .margin-input
    margin-bottom: 6px
    &.last
      margin-bottom: 24px

  .q-table-container
    box-shadow: none

  .modal
    &-padding
      padding: 24px 58px 0px 58px
    &-btn
      border-radius: 0

  /deep/ .q-uploader .q-if-inner
    display: none

  /deep/ .q-uploader input
    cursor: pointer !important

  /deep/ .q-uploader-pick-button
    color: $primary
    font-size: 1.5rem
    cursor: pointer !important

  .activeDot
    background: $tertiary
    width: 9px
    height: 9px
    border-radius: 50%
    display: inline-block

  .inactiveDot
    background: $secondary
    width: 9px
    height: 9px
    border-radius: 50%
    display: inline-block

  a
    color: $primary
    text-decoration: none
</style>
