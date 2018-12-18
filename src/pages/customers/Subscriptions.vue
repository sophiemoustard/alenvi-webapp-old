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
              <q-btn v-else color="primary" @click="newESignModal = true">
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
          <!-- <div class="row justify-between items-baseline">
            <div class="col-11">
              <h5>Signer mon <span class="text-weight-bold">devis</span></h5>
            </div>
            <div class="col-1 cursor-pointer" style="text-align: right">
              <span>
                <q-icon name="clear" size="1rem" @click.native="newESignModal = false" /></span>
            </div>
          </div> -->
          <div class="iframe-container">
            <iframe src="https://companitest.eversign.com/document/932691d9cb6d4b909d97a4e67646d4ff-9e28d3a1c7894f9498cb5d917ce76725/sign" frameborder="0"></iframe>
          </div>
          <!-- <ni-modal-select caption="Type d'absence" :error="$v.newAbsence.reason.$error" :options="reasonOptions" v-model="newAbsence.reason"
            separator @blur="$v.newAbsence.reason.$touch"
          />
          <ni-modal-datetime-picker caption="Date de départ" :error="$v.newAbsence.startDate.$error" v-model="newAbsence.startDate"
            :min="$moment().startOf('month').toISOString()"
          />
          <ni-modal-select caption="Durée" :error="$v.newAbsence.startDuration.$error" :options="dateOptions" v-model="newAbsence.startDuration"
            separator
          />
          <ni-modal-datetime-picker caption="Date de fin" :error="$v.newAbsence.endDate.$error" v-model="newAbsence.endDate"
            :disable="!newAbsence.startDate"
          />
          <ni-modal-select caption="Durée" :error="$v.newAbsence.endDuration.$error" :options="dateOptions" v-model="newAbsence.endDuration"
            separator :disable="!newAbsence.endDate || newAbsence.endDate <= newAbsence.startDate"
          /> -->
        </div>
        <!-- <q-btn class="full-width modal-btn" no-caps label="Confirmer" color="primary" :loading="loading" @click="addAbsence" /> -->
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
  async mounted () {
    try {
      await this.getCustomer();
      const test = await this.$esign.requestSignature({
        type: 'devis',
        customer: {
          name: this.customer.identity.lastname,
          email: this.customer.email
        },
        fileId: '1dWQ6hqH_9PgNhw30fKKVroQBG-WTA5Ek',
        fields: {
          title: this.customer.identity.title,
          lastname: this.customer.identity.lastname
        }
      });
      console.log('test', test);
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
    async getCustomer () {
      try {
        const customerRaw = await this.$customers.getById(this.helper.customers[0]._id);
        this.customer = customerRaw.data.data.customer;
        // this.customer.quotes = [
        //   {
        //     quoteNumber: '5552224424223',
        //     idEverSign: 'eFJ211200k',
        //     drive: {
        //       driveId: '1212312321',
        //       link: 'https://www.readersdigest.ca/wp-content/uploads/sites/14/2011/01/4-ways-cheer-up-depressed-cat.jpg'
        //     },
        //     signedAt: this.$moment().add(-1, 'days').toDate(),
        //     createdAt: this.$moment().add(-1, 'days').toDate()
        //   },
        //   {
        //     quoteNumber: '5552224424242',
        //     idEverSign: 'eFJ2112kkO',
        //     drive: {
        //       driveId: '12213321321321',
        //       link: 'https://www.readersdigest.ca/wp-content/uploads/sites/14/2011/01/4-ways-cheer-up-depressed-cat.jpg'
        //     },
        //     signedAt: this.$moment().toDate(),
        //     createdAt: this.$moment().toDate()
        //   }
        // ]
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
