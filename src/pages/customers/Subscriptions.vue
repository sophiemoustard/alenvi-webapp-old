<template>
  <q-page padding class="neutral-background">
    <template v-if="customer !== {}">
      <div class="q-mb-lg">
        <p class="title">Services</p>
        <p v-if="customer.subscriptions.length === 0">Aucun service souscrit.</p>
        <q-card v-if="customer.subscriptions.length > 0" class="contract-card">
          <q-table
            :data="customer.subscriptions"
            :columns="columnsSubs"
            row-key="name"
            hide-bottom
            binary-state-sort>
          </q-table>
        </q-card>
      </div>
      <div class="q-mb-lg">
        <p class="title">Devis</p>
        <p v-if="customer.quotes.length === 0">Aucun devis.</p>
        <q-card v-if="customer.quotes.length > 0" class="contract-card">
          <q-table
            :data="customer.quotes"
            :columns="columnsQuotes"
            row-key="name"
            hide-bottom
            :visible-columns="visibleColumnsQuotes"
            binary-state-sort>
            <q-td slot="body-cell-document" slot-scope="props" :props="props">
              <q-btn v-if="props.row.signedAt" flat round small color="primary">
                <a :href="props.row.drive.link" download>
                  <q-icon name="file download" />
                </a>
              </q-btn>
              <p v-else>/</p>
            </q-td>
            <q-td slot="body-cell-sign" slot-scope="props" :props="props">
              <p v-if="props.row.signedAt">Devis et CG signés le {{$moment(props.row.signedAt).format('DD/MM/YYYY')}}</p>
              <q-btn v-else color="primary" @click="preOpenESignModal({ ref: props.row.name, type: 'quote', _id: props.row._id })">
                Signer le devis et les CG
              </q-btn>
            </q-td>
          </q-table>
        </q-card>
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
      <q-modal v-model="newESignModal" :content-css="modalCssContainer">
        <div class="modal-padding">
          <div class="iframe-container">
            <iframe :src="embeddedUrl" frameborder="0"></iframe>
          </div>
        </div>
      </q-modal>
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
        subscriptions: [],
        quotes: []
      },
      tmpInput: null,
      newESignModal: false,
      embeddedUrl: '',
      modalCssContainer: {
        minWidth: '80vw',
        minHeight: '90vh'
      },
      columnsSubs: [
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
          label: 'Prix unitaire TTC',
          align: 'left',
          field: row => `${row.unitTTCRate}€`,
          sortable: true
        }
      ],
      columnsQuotes: [
        {
          name: 'number',
          label: 'Numéro devis',
          align: 'left',
          field: 'quoteNumber',
          sortable: true
        },
        {
          name: 'document',
          label: 'Document',
          align: 'left',
          field: row => row.drive.link,
          sortable: true
        },
        {
          name: 'sign',
          label: 'Signature',
          align: 'left',
          field: 'signedAt',
          sortable: true
        },
        {
          name: 'createdAt',
          align: 'left',
          field: 'createdAt',
          sortable: true,
          format: (value) => this.$moment(value).format('DD/MM/YYYY'),
          sort: (a, b) => (this.$moment(a).toDate()) - (this.$moment(b).toDate())
        },
        {
          name: '_id',
          field: '_id',
        }
      ],
      visibleColumnsQuotes: ['number', 'document', 'sign']
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
        console.log(this.customer);
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
    },
    async preOpenESignModal (data) {
      try {
        const test = await this.$esign.requestSignature({
          ref: data.ref,
          type: data.type,
          customer: {
            name: this.customer.identity.lastname,
            email: this.customer.email
          },
          fileId: '1dWQ6hqH_9PgNhw30fKKVroQBG-WTA5Ek', // Future company's template id
          fields: {
            title: this.customer.identity.title,
            lastname: this.customer.identity.lastname
          },
          redirect: `${window.location.href}?${data.type}Id=${data._id}&type=${data.type}&signed=true`,
          redirectDecline: `${window.location.href}&signed=false}`
        });
        this.embeddedUrl = test.data.signatureRequest.embeddedUrl;
        console.log(test);
        this.newESignModal = true;
      } catch (e) {
        console.error(e);
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
  a
    color: $primary
    text-decoration: none
  .modal
    &-padding
      padding: 24px 58px 0px 58px
    &-btn
      border-radius: 0
  .iframe-container
    overflow: hidden
    padding-top: 60%
    position: relative

  .iframe-container iframe
    border: 0
    height: 100%
    left: 0
    position: absolute
    top: 0
    width: 100%
</style>
