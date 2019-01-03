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
        <p class="nota-bene">* intègre les éventuelles majorations soir / weekend</p>
        <div v-if="customer.subscriptions && customer.subscriptions.length > 0" class="row">
          <div class="col-xs-12 row items-center no-wrap">
            <q-checkbox v-model="customer.subscriptionsAccepted" class="q-mr-sm" @input="confirmAgreement" />
            <span>J'accepte les conditions d’abonnement présentées ci-dessus ainsi que les <a href="#cgs" @click.prevent="cgsModal = true">conditions générales de services
          Alenvi</a>.<span class="text-weight-thin text-italic"> {{ agreement }}</span></span>
          </div>
        </div>
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
        <p v-if="customer.payment.mandates.length === 0">Aucun mandat.</p>
        <q-card v-if="customer.payment.mandates.length > 0 || (customer.payment.iban && customer.payment.rib)" class="contract-card">
          <q-card-title>Mandats de prélèvement</q-card-title>
          <q-card-main>
            <q-table
              :data="customer.payment.mandates"
              :columns="columnsMandates"
              row-key="name"
              hide-bottom
              :visible-columns="visibleColumnsMandates"
              binary-state-sort>
              <q-td slot="body-cell-sign" slot-scope="props" :props="props">
                <p v-if="props.row.signedAt">Mandat signé le {{$moment(props.row.signedAt).format('DD/MM/YYYY')}}</p>
                <q-btn v-else color="primary" @click="preOpenESignModal({ _id: props.row._id })">
                  Signer
                </q-btn>
              </q-td>
            </q-table>
          </q-card-main>
        </q-card>
      </div>
      <q-modal v-model="newESignModal" :content-css="modalCssContainer">
        <div class="modal-padding">
          <div class="iframe-container">
            <iframe :src="embeddedUrl" frameborder="0"></iframe>
          </div>
        </div>
      </q-modal>
      <q-modal v-model="cgsModal" :content-css="modalCssContainer">
        <div class="modal-padding">
          <div class="row justify-between items-baseline">
            <div class="col-8">
              <h5>Conditions générales de services Alenvi</h5>
            </div>
            <div class="col-1 cursor-pointer" style="text-align: right">
              <span><q-icon name="clear" size="1rem" @click.native="cgsModal = false" /></span>
            </div>
          </div>
          <ni-modal-input v-model="cgs" readOnly type="textarea" />
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
import NiModalInput from '../../components/form/ModalInput';
import { bic, iban } from '../../helpers/vuelidateCustomVal';
import { NotifyPositive, NotifyWarning, NotifyNegative } from '../../components/popup/notify';
import cgs from '../../data/cgs.js';
import { customerMixin } from '../../mixins/customerMixin.js';

export default {
  name: 'Subscriptions',
  components: {
    'ni-input': Input,
    NiModalInput
  },
  mixins: [customerMixin],
  data () {
    return {
      cgs,
      cgsModal: false,
      agreed: false,
      customer: {
        payment: {
          mandates: []
        },
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
          align: 'center',
          field: row => `${this.formatNumber(row.unitTTCRate)}€`,
          sortable: true
        },
        {
          name: 'estimatedWeeklyVolume',
          label: 'Volume hebdomadaire',
          align: 'center',
          field: row => row.service.nature === 'Horaire' ? `${row.estimatedWeeklyVolume}h` : row.estimatedWeeklyVolume,
          sortable: true
        },
        {
          name: 'weeklyRate',
          label: 'Coût hebdomadaire*',
          align: 'center',
          field: row => `${this.getWeeklyRate(row)}€`,
          sortable: true
        }
      ],
      columnsMandates: [
        {
          name: 'rum',
          label: 'RUM',
          align: 'left',
          field: 'rum'
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
      visibleColumnsMandates: ['rum', 'sign']
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
    agreement () {
      if (this.lastSubscriptionHistory && this.customer.subscriptionsAccepted) {
        return `(Accepté le ${this.$moment(this.lastSubscriptionHistory.approvalDate).format('DD/MM/YYYY')} par ${this.acceptedBy}`;
      }
    }
  },
  mounted () {
    this.getCustomer();
  },
  methods: {
    formatNumber (number) {
      return parseFloat(Math.round(number * 100) / 100).toFixed(1)
    },
    getWeeklyRate (subscription) {
      let estimatedWeeklyRate = subscription.unitTTCRate * subscription.estimatedWeeklyVolume;
      if (subscription.sundays && subscription.service.holidaySurcharge) {
        estimatedWeeklyRate += subscription.sundays * subscription.unitTTCRate * subscription.service.holidaySurcharge / 100;
      }
      if (subscription.evenings && subscription.service.eveningSurcharge) {
        estimatedWeeklyRate += subscription.evenings * subscription.unitTTCRate * subscription.service.eveningSurcharge / 100;
      }

      return estimatedWeeklyRate;
    },
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
        NotifyNegative('Erreur lors de la modification');
      } finally {
        this.tmpInput = '';
      }
    },
    async preOpenESignModal (data) {
      try {
        this.$q.loading.show({ message: 'Contact du support de signature en ligne...' });
        const sign = await this.$customers.generateMandateSignatureRequest({mandateId: data._id, _id: this.customer._id}, {
          customer: {
            name: this.customer.identity.lastname,
            email: this.customer.email
          },
          fileId: this.helper.company.rhConfig.templates.contract.driveId,
          fields: {
            title: this.customer.identity.title,
            lastname: this.customer.identity.lastname
          },
          redirect: `${window.location.href}&signed=false`,
          redirectDecline: `${window.location.href}&signed=false`
        });
        this.$q.loading.hide();
        this.embeddedUrl = sign.data.data.signatureRequest.embeddedUrl;
        this.newESignModal = true;
      } catch (e) {
        console.error(e);
        this.$q.loading.hide();
        this.newESignModal = false;
        NotifyNegative('Erreur lors de la requête de signature en ligne du mandat');
      }
    },
    async confirmAgreement () {
      try {
        if (this.customer.subscriptionsAccepted) {
          const subscriptions = this.customer.subscriptions.map(subscription => {
            const obj = {
              service: subscription.service.name,
              unitTTCRate: subscription.unitTTCRate,
              estimatedWeeklyVolume: subscription.estimatedWeeklyVolume
            };
            if (subscription.evenings) obj.evenings = subscription.evenings;
            if (subscription.sundays) obj.sundays = subscription.sundays;
            return obj;
          });
          const { birthDate, ...helperIdentity } = this.customer.identity;
          const payload = {
            subscriptions,
            helper: helperIdentity
          };
          await this.$customers.addSubscriptionHistory(this.customer._id, payload);
          await this.$store.dispatch('main/getUser', this.helper._id)
          NotifyPositive('Abonnement validé');
        }
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la validation de votre abonnement');
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
  .nota-bene
    font-size: 0.8em
    margin-bottom: 20px
  .contract-card
    background: white
    width: 100%
    margin-bottom: 10px
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
