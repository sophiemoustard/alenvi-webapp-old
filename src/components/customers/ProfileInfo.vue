<template>
  <div v-if="isLoaded">
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Identité</p>
      </div>
      <div class="row gutter-profile">
        <div class="col-xs-12 col-md-6">
          <div class="row justify-between">
            <p class="input-caption">Prénom</p>
          </div>
          <q-field>
            <q-input v-model="customer.identity.firstname" color="white" inverted-light @focus="saveTmp('identity.firstname')"
              @blur="updateUser({ alenvi: 'identity.firstname', ogust: 'first_name' })" />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <div class="row justify-between">
            <p class="input-caption">Nom</p>
          </div>
          <q-field :error="$v.customer.identity.lastname.$error" error-label="Champ requis">
            <q-input v-model="customer.identity.lastname" color="white" inverted-light @focus="saveTmp('identity.lastname')"
              @blur="updateUser({ alenvi: 'identity.lastname', ogust: 'last_name' })" />
          </q-field>
        </div>
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
        <div class="col-xs-12 col-md-6">
          <div class="row justify-between">
            <p class="input-caption">Téléphone</p>
          </div>
          <q-field :error="$v.customer.contact.phone.$error" error-label="Numéro de téléphone non valide">
            <q-input v-model.trim="customer.contact.phone" type="tel" color="white" inverted-light @focus="saveTmp('contact.phone')"
              @blur="updateUser({ alenvi: 'contact.phone', ogust: 'mobile_phone' })" />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <div class="row justify-between">
            <p class="input-caption">Adresse</p>
          </div>
          <q-field :error="$v.customer.contact.address.fullAddress.$error" :error-label="addressError">
            <search-address v-model="customer.contact.address.fullAddress" color="white" inverted-light @focus="saveTmp('contact.address.fullAddress')"
              @blur="updateUser({ alenvi: 'contact.address', ogust: 'address' })"
              @selected="selectedAddress" />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <div class="row justify-between">
            <p class="input-caption">Code porte</p>
          </div>
          <q-field>
            <q-input v-model="customer.contact.doorCode" color="white" inverted-light @focus="saveTmp('contact.doorCode')"
              @blur="updateUser({ alenvi: 'contact.doorCode', ogust: 'door_code' })" />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <div class="row justify-between">
            <p class="input-caption">Code interphone</p>
          </div>
          <q-field>
            <q-input v-model="customer.contact.intercomCode" color="white" inverted-light @focus="saveTmp('contact.intercomCode')"
              @blur="updateUser({ alenvi: 'contact.intercomCode', ogust: 'intercom_code' })" />
          </q-field>
        </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Moyen de paiement</p>
      </div>
      <div class="row gutter-profile">
        <div class="col-xs-12 col-md-6">
          <div class="row justify-between">
            <p class="input-caption">Nom associé au compte bancaire</p>
          </div>
          <q-field>
            <q-input v-model="customer.payment.bankAccountOwner" color="white" inverted-light @focus="saveTmp('payment.bankAccountOwner')"
              @blur="updateUser({ alenvi: 'payment.bankAccountOwner', ogust: 'holder' })" />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <div class="row justify-between">
            <p class="input-caption">IBAN</p>
          </div>
          <q-field :error="$v.customer.payment.iban.$error" error-label="IBAN non valide">
            <q-input v-model="customer.payment.iban" color="white" inverted-light @focus="saveTmp('payment.iban')"
              @blur="updateUser({ alenvi: 'payment.iban', ogust: 'iban_number' })" />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <div class="row justify-between">
            <p class="input-caption">BIC</p>
          </div>
          <q-field :error="$v.customer.payment.bic.$error" error-label="BIC non valide">
            <q-input v-model="customer.payment.bic" color="white" inverted-light @focus="saveTmp('payment.bic')" @blur="updateUser({ alenvi: 'payment.bic', ogust: 'bic_number' })" />
          </q-field>
        </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Aidants</p>
      <div class="row gutter-profile">
        <div class="col-xs-12 col-md-6">
          <q-table
            :data="userHelpers"
            :columns="columns"
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
    <q-btn class="fixed fab-add-person" no-caps rounded color="primary" icon="add" label="Ajouter un aidant" @click="goToAddHelperPage" />
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';

import { extend } from '../../helpers/utils.js';
import SearchAddress from '../../components/SearchAddress';
import { NotifyPositive, NotifyWarning, NotifyNegative } from '../../components/popup/notify.js';
import { frPhoneNumber, iban, bic, frAddress } from '../../helpers/vuelidateCustomVal';

export default {
  components: {
    SearchAddress
  },
  data () {
    return {
      isLoaded: false,
      tmpInput: '',
      customer: {
        identity: {},
        contact: {
          address: {}
        },
        payment: {}
      },
      columns: [
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
          name: 'remove',
          label: '',
          align: 'left',
          field: '_id',
          style: 'width: 50px'
        }
      ],
      userHelpers: []
    }
  },
  computed: {
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
        bic: { required, bic },
        iban: { required, iban }
      }
    }
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
    async updateUser (paths) {
      try {
        if (this.tmpInput === this.$_.get(this.customer, paths.alenvi)) return;
        if (this.$_.get(this.$v.customer, paths.alenvi)) {
          const isValid = await this.waitForValidation(paths.alenvi);
          if (!isValid) throw new Error('Champ(s) invalide(s)');
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
    goToAddHelperPage () {
      this.$router.push({ name: 'helpers directory', query: { openmodal: true, customerid: this.userProfile._id } });
    }
  }
}
</script>

<style lang="stylus" scoped>

  .q-table-container
    box-shadow: none
    background: white

  .bg-negative
    background: white !important
    color: inherit !important

  .fab-add-person
    right: 60px
    bottom: 18px
    font-size: 16px
    z-index: 2
</style>
