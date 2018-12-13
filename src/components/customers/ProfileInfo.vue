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
          <div class="row justify-between">
            <p class="input-caption">Date de naissance</p>
          </div>
          <q-field>
            <q-datetime type="date" format="DD/MM/YYYY" v-model="customer.identity.birthDate" color="white"
              inverted-light popover @focus="saveTmp('identity.birthDate')" @blur="updateUser({ alenvi: 'identity.birthDate', ogust: 'date_of_birth' })"
              ok-label="OK" cancel-label="Fermer" />
          </q-field>
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
        <p class="text-weight-bold">Moyen de paiement</p>
      </div>
      <div class="row gutter-profile">
        <ni-input caption="Nom associé au compte bancaire" :error="$v.customer.payment.bankAccountOwner.$error" errorLabel="Champ requis"
          v-model="customer.payment.bankAccountOwner" @focus="saveTmp('payment.bankAccountOwner')" @blur="updateUser({ alenvi: 'payment.bankAccountOwner', ogust: 'holder' })" />
        <ni-input caption="IBAN" :error="$v.customer.payment.iban.$error" errorLabel="IBAN non valide"
          v-model="customer.payment.iban" @focus="saveTmp('payment.iban')" @blur="updateUser({ alenvi: 'payment.iban', ogust: 'iban_number' })" />
        <ni-input caption="BIC" :error="$v.customer.payment.bic.$error" errorLabel="BIC non valide"
          v-model="customer.payment.bic" @focus="saveTmp('payment.bic')" @blur="updateUser({ alenvi: 'payment.bic', ogust: 'bic_number' })" />
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Abonnements</p>
      </div>
      <q-card>
        <q-card-main>
          <q-table
            :data="subscriptions"
            :columns="subscriptionsColumns"
            row-key="name"
            table-style="font-size: 1rem"
            hide-bottom>
            <q-td slot="body-cell-remove" slot-scope="props" :props="props">
              <q-icon name="delete" size="1.2rem" color="grey" class="cursor-pointer" @click.native="removeSubscriptions(props.value)" />
            </q-td>
          </q-table>
        </q-card-main>
        <q-card-actions align="end">
          <q-btn flat no-caps color="primary" icon="add" label="Ajouter un abonnement" @click="addSubscription = true"/>
        </q-card-actions>
      </q-card>
    </div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Aidants</p>
      <div class="row gutter-profile">
        <div class="col-xs-12 col-md-6">
          <q-table
            :data="userHelpers"
            :columns="helpersColumns"
            row-key="name"
            table-style="font-size: 1rem"
            hide-bottom>
            <q-td slot="body-cell-remove" slot-scope="props" :props="props">
              <q-icon name="delete" size="1.2rem" color="grey" class="cursor-pointer" @click.native="removeHelper(props.value)" />
            </q-td>
          </q-table>
        </div>
      </div>
    </div>
    <q-btn class="fixed fab-add-person" no-caps rounded color="primary" icon="add" label="Ajouter un aidant" @click="addHelper = true" />

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
            <h5>Ajouter un <span class="text-weight-bold">abonnement</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span><q-icon name="clear" size="1rem" @click.native="addSubscription = false" /></span>
          </div>
        </div>
        <ni-modal-select caption="Service" :options="serviceOptions" v-model="newSubscription.service" :error="$v.newSubscription.service.$error"
          @blur="$v.newSubscription.service.$touch"
        />
        <ni-modal-input v-model="newSubscription.unitTTCRate" :error="$v.newSubscription.unitTTCRate.$error" caption="Prix unitaire TTC"
          @blur="$v.newSubscription.unitTTCRate.$touch"
        />
        <ni-modal-input v-model="newSubscription.estimatedWeeklyVolume" :error="$v.newSubscription.estimatedWeeklyVolume.$error"
          caption="Volume hebdomadaire estimatif" @blur="$v.newSubscription.estimatedWeeklyVolume.$touch"
        />
        <div class="row margin-input">
          <div class="col-12">
            <q-checkbox v-model="newSubscription.sundays"> dimanches inclus</q-checkbox>
          </div>
        </div>
        <div class="row margin-input last">
          <div class="col-12">
            <q-checkbox v-model="newSubscription.evenings"> soirées inclues</q-checkbox>
          </div>
        </div>
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Ajouter un abonnement" icon-right="add" color="primary" :loading="loading" @click="submitSubscription" />
    </q-modal>
  </div>
</template>

<script>
import { required, email } from 'vuelidate/lib/validators';
import randomize from 'randomatic';

import { extend, clear } from '../../helpers/utils.js';
import { NotifyPositive, NotifyWarning, NotifyNegative } from '../../components/popup/notify.js';
import SearchAddress from '../form/SearchAddress';
import Input from '../form/Input.vue';
import NiModalInput from '../form/ModalInput';
import NiModalSelect from '../form/ModalSelect';
import { frPhoneNumber, iban, bic, frAddress } from '../../helpers/vuelidateCustomVal';

export default {
  name: 'ProfileInfo',
  components: {
    NiSearchAddress: SearchAddress,
    NiInput: Input,
    NiModalInput,
    NiModalSelect,
  },
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
      subscriptions: {},
      customer: {
        identity: {},
        contact: {
          address: {}
        },
        payment: {},
        subscriptions: {},
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
          align: 'left',
          field: 'unitTTCRate',
        },
        {
          name: 'estimatedWeeklyVolume',
          label: 'Volume hebdomadaire estimatif',
          align: 'left',
          field: 'estimatedWeeklyVolume',
        },
        {
          name: 'sundays',
          label: 'dont dimanches',
          align: 'left',
          field: 'sundays',
        },
        {
          name: 'evenings',
          label: 'dont soirées (après 20h)',
          align: 'left',
          field: 'evenings',
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
        evenings: false,
        sundays: false,
      },
    }
  },
  computed: {
    company () {
      return this.$store.getters['main/company'];
    },
    serviceOptions () {
      if (!this.company.customersConfig || !this.company.customersConfig.services) {
        return [];
      }

      return this.company.customersConfig.services.map(service => ({
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
    const customerRaw = await this.$customers.getById(this.userProfile._id);
    const customer = customerRaw.data.data.customer;
    this.subscriptions = customer.subscriptions;
    this.mergeUser(customer);
    this.$v.customer.$touch();
    this.isLoaded = true;
  },
  methods: {
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
    async getUserHelpers () {
      try {
        this.userHelpers = await this.$users.showAll({ customers: this.userProfile._id });
      } catch (e) {
        console.error(e);
      }
    },
    async refreshSubscriptions () {
      try {
        this.subscriptions = await this.$customers.getSubscriptions(this.customer._id);
      } catch (e) {
        console.error(e);
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
      } catch (e) {
        console.error(e);
        if (e.message === 'Champ(s) invalide(s)') {
          return NotifyWarning(e.message)
        }
        NotifyNegative('Erreur lors de la modification');
      } finally {
        this.$store.commit('rh/saveUserProfile', this.customer);
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

        await this.$customers.addSubscription(this.customer._id, this.newSubscription);
        this.resetSubscriptionForm();
        this.refreshSubscriptions();
        NotifyPositive('Abonnement ajouté');
      } catch (e) {
        NotifyNegative("Erreur lors de l'ajout d'un abonnement");
      } finally {
        this.loading = false;
      }
    },
    async removeSubscriptions (subscriptionId) {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Es-tu sûr(e) de vouloir supprimer cet abonnement ?',
          ok: true,
          cancel: 'Annuler'
        });

        const params = { subscriptionId, _id: this.customer._id };

        await this.$customers.removeSubscription(params);
        await this.refreshSubscriptions();
        NotifyPositive('Abonnement supprimé');
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
      this.newSubscription = Object.assign({}, clear(this.newSubscription));
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

  /deep/ .q-option-inner
    margin-right: 5px

  .margin-input
    margin-bottom: 6px
    &.last
      margin-bottom: 24px

  .q-table-container
    box-shadow: none
    // background: white

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
</style>
