<template>
  <q-page padding class="neutral-background">
    <template v-if="customer !== {}">
      <div class="q-mb-lg">
        <p class="title">Services</p>
        <p v-if="customer.subscriptions.length === 0">Aucun service souscrit.</p>
        <q-card v-if="customer.subscriptions.length > 0" class="contract-card">
          <q-table
            :data="customer.subscriptions"
            :columns="columns"
            row-key="name"
            hide-bottom
            binary-state-sort>
          </q-table>
        </q-card>
      </div>
      <div class="q-mb-lg">
        <p class="title">Devis</p>
      </div>
      <div class="q-mb-lg">
        <p class="title">Paiement</p>
        <div class="row gutter-profile">
          <ni-input caption="Nom associé au compte bancaire" v-model="customer.payment.bankAccountOwner" :error="$v.customer.payment.bankAccountOwner.$error"
            @focus="saveTmp('payment.bankAccountOwner')" @blur="updateCustomer('payment.bankAccountOwner')"
          />
          <ni-input caption="IBAN" v-model="customer.payment.iban" :error="$v.customer.payment.iban.$error" :errorLabel="ibanError"
            @focus="saveTmp('payment.iban')" @blur="updateCustomer('payment.iban')"
          />
          <ni-input caption="BIC" v-model="customer.payment.bic" :error="$v.customer.payment.bic.$error" :errorLabel="bicError"
            @focus="saveTmp('payment.bic')" @blur="updateCustomer('payment.bic')"
          />
        </div>
      </div>
    </template>
    <template v-else>
      <p>Vous n'avez pas de bénéficiaire.</p>
    </template>
  </q-page>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import Input from '../../components/form/Input.vue';
import { bic, iban } from '../../helpers/vuelidateCustomVal';
import { NotifyPositive, NotifyWarning, NotifyNegative } from '../../components/popup/notify';

export default {
  name: 'Subscriptions',
  components: {
    'ni-input': Input,
  },
  data () {
    return {
      customer: {
        payment: {},
      },
      tmpInput: null,
      columns: [
        {
          name: 'name',
          label: 'Nom',
          align: 'left',
          field: row => row.service.name,
          sortable: true
        },
        {
          name: 'nature',
          label: 'Nature',
          align: 'left',
          field: row => row.service.nature,
          sortable: true
        },
        {
          name: 'ttcRate',
          label: 'Taux horaire TTC',
          align: 'left',
          field: 'unitTTCRate',
          sortable: true
        }
      ]
    }
  },
  validations: {
    customer: {
      payment: {
        bankAccountOwner: { required },
        bic: { required, bic },
        iban: { required, iban }
      }
    }
  },
  computed: {
    helper () {
      return this.$store.getters['main/user'];
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
  },
  mounted () {
    this.getCustomer();
  },
  methods: {
    async getCustomer () {
      try {
        const customerRaw = await this.$customers.getById(this.helper.customers[0]._id);
        this.customer = customerRaw.data.data.customer;
      } catch (e) {
        console.error(e);
        this.customer = {};
      }
    },
    saveTmp (path) {
      this.tmpInput = this.$_.get(this.customer, path);
    },
    async updateCustomer (path) {
      try {
        if (this.tmpInput === this.$_.get(this.customer, path)) return;
        this.$_.get(this.$v.customer, path).$touch();
        if (this.$_.get(this.$v.customer, path).$error) {
          return NotifyWarning('Champ(s) invalide(s)');
        }

        let value = this.$_.get(this.customer, path);
        if (path.match(/iban/i)) {
          value = value.split(' ').join('');
        }
        const payload = this.$_.set({}, path, value);
        payload._id = this.customer._id;
        await this.$customers.updateById(payload);

        NotifyPositive('Modification enregistrée');
      } catch (e) {
        console.error(e);
        if (e.message === 'Champ(s) invalide(s)') {
          return NotifyWarning(e.message)
        }
        console.log(e);
        NotifyNegative('Erreur lors de la modification');
      } finally {
        this.tmpInput = '';
      }
    }
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables';
  .title
    font-size: 1.5em
    margin-bottom: 20px
  .contract-card
    background: white
    width: 100%
    margin-bottom: 20px
  .q-table-container
    box-shadow: none
</style>
