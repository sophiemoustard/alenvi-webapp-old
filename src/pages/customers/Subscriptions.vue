<template>
  <q-page padding class="neutral-background">
    <template v-if="customer !== {}">
      <div class="q-mb-lg">
        <p class="title">Souscriptions</p>
        <p v-if="subscriptions.length === 0">Aucun service souscrit.</p>
        <q-card v-if="subscriptions.length > 0" class="contract-card">
          <q-table :data="subscriptions" :columns="subscriptionsColumns" row-key="name" hide-bottom binary-state-sort class="table-responsive">
            <q-tr slot="body" slot-scope="props" :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
                <template v-if="col.name === 'actions'">
                  <div class="row no-wrap">
                    <q-btn flat round small color="grey" icon="history" @click.native="showHistory(col.value)" />
                  </div>
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
            </q-tr>
          </q-table>
        </q-card>
        <p v-if="subscriptions.length > 0" class="nota-bene">* intègre le financement et les éventuelles majorations soir / dimanche</p>
        <div v-if="subscriptions && subscriptions.length > 0" class="row">
          <div class="col-xs-12">
            <q-checkbox v-model="customer.subscriptionsAccepted" class="q-mr-sm" @input="confirmAgreement" />
            <span style="vertical-align: middle">J'accepte les conditions d’abonnement présentées ci-dessus ainsi que les <a href="#cgs" @click.prevent="cgsModal = true">conditions générales de services
          Alenvi</a>.<span class="text-weight-thin text-italic"> {{ agreement }}</span></span>
          </div>
        </div>
      </div>
      <div class="q-mb-lg">
        <p class="title">Justificatifs APA ou autres financements</p>
        <ni-multiple-files-uploader path="financialCertificates" alt="justificatif financement" @uploaded="getCustomer" name="financialCertificates"
          collapsibleLabel="Ajouter un certificat" :userProfile="customerUploadData" :url="docsUploadUrl" @delete="deleteDocument($event)"
          additionalFieldsName="financialCertificate" />
      </div>
      <div class="q-mb-lg">
        <p class="title">Paiement</p>
        <div class="row gutter-profile">
          <ni-input caption="Nom associé au compte bancaire" v-model="customer.payment.bankAccountOwner" :error="$v.customer.payment.bankAccountOwner.$error"
            @focus="saveTmp('payment.bankAccountOwner')" @blur="updateCustomer({ alenvi: 'payment.bankAccountOwner', ogust: 'holder' })"
          />
          <ni-input caption="IBAN" v-model="customer.payment.iban" :error="$v.customer.payment.iban.$error" :errorLabel="ibanError"
            @focus="saveTmp('payment.iban')" @blur="updateCustomer({ alenvi: 'payment.iban', ogust: 'iban_number' })"
          />
          <ni-input caption="BIC" v-model="customer.payment.bic" :error="$v.customer.payment.bic.$error" :errorLabel="bicError"
            @focus="saveTmp('payment.bic')" @blur="updateCustomer({ alenvi: 'payment.bic', ogust: 'bic_number' })"
          />
        </div>
      </div>
      <div class="q-mb-lg">
        <p class="title">Mandats de prélèvement</p>
        <p v-if="customer.payment.mandates.length === 0 || !isValidPayment">Aucun mandat.</p>
        <q-card v-if="isValidPayment && customer.payment.mandates.length > 0" class="contract-card">
          <q-card-main>
            <q-table :data="customer.payment.mandates" :columns="columnsMandates" row-key="name" hide-bottom :pagination.sync="pagination"
              :visible-columns="visibleColumnsMandates" binary-state-sort class="table-responsive">
              <q-td slot="body-cell-rum" slot-scope="props" :props="props" :data-label="props.col.label">{{ props.value }}</q-td>
              <q-td slot="body-cell-sign" slot-scope="props" :props="props" :data-label="props.col.label">
                <p class="no-margin" v-if="props.row.signedAt">Mandat signé le {{$moment(props.row.signedAt).format('DD/MM/YYYY')}}</p>
                <q-btn v-else-if="props.row.__index === customer.payment.mandates.length - 1" color="primary" @click="preOpenESignModal(props)">
                  Signer
                </q-btn>
              </q-td>
            </q-table>
          </q-card-main>
        </q-card>
      </div>
      <q-modal v-model="newESignModal" @hide="checkMandates" :content-css="modalCssContainer">
        <q-modal-layout>
          <q-toolbar class="no-shadow row justify-end toolbar-padding" color="black" inverted slot="header">
            <q-icon class="cursor-pointer" name="clear" size="1rem" @click.native="newESignModal = false" />
          </q-toolbar>
          <iframe :src="embeddedUrl" frameborder="0" class="iframe-normal"></iframe>
        </q-modal-layout>
      </q-modal>
      <q-modal v-model="cgsModal" :content-css="cgsModalCssContainer">
        <q-modal-layout>
          <q-toolbar class="no-shadow row justify-between toolbar-padding" color="black" inverted slot="header">
            <h5 class="no-margin">Conditions Générales de Service Alenvi</h5>
            <q-icon class="cursor-pointer" name="clear" size="1rem" @click.native="cgsModal = false" />
          </q-toolbar>
          <div v-html="cgs" class="modal-padding"></div>
        </q-modal-layout>
      </q-modal>
    </template>
    <template v-else>
      <p>Vous n'avez pas de bénéficiaire.</p>
    </template>

    <!-- Subscription history modal -->
    <q-modal v-model="subscriptionHistoryModal" :content-css="modalCssContainer" @hide="resetSubscriptionHistoryData">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Historique de la souscription <span class="text-weight-bold">{{selectedSubscription.service && selectedSubscription.service.name}}</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span>
              <q-icon name="clear" size="1rem" @click.native="subscriptionHistoryModal = false" /></span>
          </div>
        </div>
        <q-table class="q-mb-xl table-responsive" :data="selectedSubscription.versions" :columns="subscriptionHistoryColumns" hide-bottom binary-state-sort
          :pagination.sync="paginationHistory">
          <q-tr slot="body" slot-scope="props" :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
              <template v-if="col.name === 'startDate'"> {{ $moment(col.value).format('DD/MM/YYYY') }} </template>
              <template v-else>{{ col.value }}</template>
            </q-td>
          </q-tr>
        </q-table>
      </div>
    </q-modal>
  </q-page>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import Input from '../../components/form/Input.vue';
import NiModalInput from '../../components/form/ModalInput';
import MultipleFilesUploader from '../../components/form/MultipleFilesUploader.vue';
import { bic, iban } from '../../helpers/vuelidateCustomVal';
import { NotifyPositive, NotifyWarning, NotifyNegative } from '../../components/popup/notify';
import { customerMixin } from '../../mixins/customerMixin.js';
import { subscriptionMixin } from '../../mixins/subscriptionMixin.js';
import esign from '../../api/Esign.js';
import cgs from '../../statics/CGS.html';
import gdrive from '../../api/GoogleDrive.js';

export default {
  name: 'Subscriptions',
  components: {
    'ni-input': Input,
    'ni-multiple-files-uploader': MultipleFilesUploader,
    NiModalInput
  },
  mixins: [customerMixin, subscriptionMixin],
  data () {
    return {
      cgs,
      cgsModal: false,
      agreed: false,
      customer: {
        payment: { mandates: [] },
        subscriptions: [],
        quotes: [],
        financialCertificates: [],
        identity: {},
      },
      tmpInput: null,
      newESignModal: false,
      embeddedUrl: '',
      modalCssContainer: {
        minWidth: '80vw',
        minHeight: '90vh'
      },
      cgsModalCssContainer: {
        minWidth: '60vw',
        minHeight: '70vh',
        overflow: 'hidden'
      },
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
      visibleColumnsMandates: ['rum', 'sign'],
      pagination: {
        sortBy: 'createdAt',
        ascending: true,
        rowsPerPage: 0,
      }
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
        return `(Accepté le ${this.$moment(this.lastSubscriptionHistory.approvalDate).format('DD/MM/YYYY')} par ${this.acceptedBy})`;
      }
    },
    esignRedirection () {
      if (this.$q.platform.is.desktop) {
        return {
          redirect: `${process.env.COMPANI_HOSTNAME}/docsigned?signed=true`,
          redirectDecline: `${process.env.COMPANI_HOSTNAME}/docsigned?signed=false`
        }
      }
      return {
        redirect: `${process.env.COMPANI_HOSTNAME}/customers/subscriptions`,
        redirectDecline: `${process.env.COMPANI_HOSTNAME}/customers/subscriptions`
      }
    },
    isValidPayment () {
      return this.$v.customer.payment.bic.bic && this.$v.customer.payment.iban.iban
    },
    docsUploadUrl () {
      return this.customer.driveFolder ? `${process.env.API_HOSTNAME}/customers/${this.customer._id}/gdrive/${this.customer.driveFolder.id}/upload` : '';
    },
    customerUploadData () {
      return {
        firstname: this.customer.identity.firstname || '',
        lastname: this.customer.identity.lastname || '',
        financialCertificates: this.customer.financialCertificates,
      }
    }
  },
  async mounted () {
    await this.getCustomer();
    await this.checkMandates();
  },
  methods: {
    async getCustomer () {
      try {
        const customerRaw = await this.$customers.getById(this.helper.customers[0]._id);
        this.customer = customerRaw.data.data.customer;
        this.refreshSubscriptions();
      } catch (e) {
        console.error(e);
        this.customer = {};
      }
    },
    saveTmp (path) {
      this.tmpInput = this.$_.get(this.customer, path);
    },
    // Customer
    async updateOgustCustomer (paths) {
      let value = this.$_.get(this.customer, paths.alenvi);
      const payload = this.$_.set({}, paths.ogust, value);
      if (paths.ogust.match(/((iban|bic)_number)|holder/i)) {
        if (this.customer.payment && this.customer.payment.bankAccountOwner && this.customer.payment.iban && this.customer.payment.bic) {
          payload.bic_number = this.customer.payment.bic;
          payload.iban_number = this.customer.payment.iban;
          payload.id_tiers = this.customer.customerId;
          await this.$ogust.setBankInfo(payload);
        }
      } else {
        await this.$ogust.editOgustCustomer(this.userProfile.customerId, payload);
      }
    },
    async updateAlenviCustomer (path) {
      const value = this.$_.get(this.customer, path);
      const payload = this.$_.set({}, path, value);
      payload._id = this.customer._id;
      await this.$customers.updateById(payload);
    },
    async updateCustomer (paths) {
      try {
        if (this.tmpInput === this.$_.get(this.customer, paths.alenvi)) return;
        this.$_.get(this.$v.customer, paths.alenvi).$touch();
        if (this.$_.get(this.$v.customer, paths.alenvi).$error) {
          return NotifyWarning('Champ(s) invalide(s)');
        }
        if (paths.alenvi && paths.ogust) {
          await this.updateAlenviCustomer(paths.alenvi);
          await this.updateOgustCustomer(paths);
        } else if (paths.alenvi) {
          await this.updateAlenviCustomer(paths.alenvi);
        } else {
          await this.updateOgustCustomer(paths);
        }
        await this.$store.dispatch('main/getUser', this.helper._id);
        await this.getCustomer();
        NotifyPositive('Modification enregistrée');
        if (paths.alenvi === 'payment.iban') {
          this.$v.customer.payment.bic.$touch();
          if (!this.$v.customer.payment.bic.required) {
            return NotifyWarning('Merci de renseigner votre BIC');
          }
        }
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
    // Subscriptions
    async confirmAgreement () {
      try {
        if (this.customer.subscriptionsAccepted) {
          const subscriptions = this.customer.subscriptions.map(subscription => {
            const lastVersion = this.getSubscriptionLastVersion(subscription);
            const obj = {
              service: subscription.service.name,
              unitTTCRate: lastVersion.unitTTCRate,
              estimatedWeeklyVolume: lastVersion.estimatedWeeklyVolume,
              startDate: lastVersion.startDate,
            };
            if (lastVersion.evenings) obj.evenings = lastVersion.evenings;
            if (lastVersion.sundays) obj.sundays = lastVersion.sundays;
            return obj;
          });
          const payload = {
            subscriptions,
            helper: {
              firstname: this.helper.firstname || '',
              lastname: this.helper.lastname || '',
              title: this.helper.administrative && this.helper.administrative.identity ? this.helper.administrative.identity.title : ''
            }
          };
          await this.$customers.addSubscriptionHistory(this.customer._id, payload);
          await this.getCustomer();
          NotifyPositive('Abonnement validé');
        }
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la validation de votre abonnement');
        this.customer.subscriptionsAccepted = !this.customer.subscriptionsAccepted
      }
    },
    // Financial certificates
    async deleteDocument (driveId) {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Es-tu sûr(e) de vouloir supprimer ce document ?',
          ok: true,
          cancel: 'Annuler'
        });
        await gdrive.removeFileById({ id: driveId });

        const payload = { 'financialCertificates': { driveId } };
        await this.$customers.updateCertificates(this.customer._id, payload);
        this.getCustomer();
        NotifyPositive('Document supprimé');
      } catch (e) {
        console.error(e);
        if (e.message === '') return NotifyPositive('Suppression annulée');

        NotifyNegative('Erreur lors de la suppression du document');
      }
    },
    // Mandate
    async preOpenESignModal (data) {
      try {
        this.$q.loading.show({ message: 'Contact du support de signature en ligne...' });
        const sign = await this.$customers.generateMandateSignatureRequest({ mandateId: data._id, _id: this.customer._id }, {
          customer: {
            name: this.customer.identity.lastname,
            email: this.helper.local.email
          },
          fileId: this.helper.company.customersConfig.templates.debitMandate.driveId,
          fields: {
            bankAccountOwner: this.customer.payment.bankAccountOwner || '',
            customerAddress: this.customer.contact.address.fullAddress || '',
            ics: this.helper.company.ics || '',
            rum: data.rum || '',
            bic: this.customer.payment.bic || '',
            iban: this.customer.payment.iban || '',
            companyName: this.helper.company.name || '',
            companyAddress: this.helper.company.address.fullAddress || '',
            downloadDate: this.$moment().format('DD/MM/YYYY')
          },
          ...this.esignRedirection
        });
        await this.getCustomer();
        this.$q.loading.hide();
        this.embeddedUrl = sign.data.data.signatureRequest.embeddedUrl;
        if (this.$q.platform.is.mobile) {
          window.location.href = this.embeddedUrl;
        } else {
          this.newESignModal = true;
        }
      } catch (e) {
        console.error(e);
        this.$q.loading.hide();
        this.newESignModal = false;
        NotifyNegative('Erreur lors de la requête de signature en ligne du mandat');
      }
    },
    async checkMandates () {
      try {
        if (this.customer.payment.mandates.length === 0) return;
        const mandates = this.customer.payment.mandates.filter(mandate => !mandate.drive && mandate.everSignId);
        if (mandates.length === 0) return;
        const hasSignedPromises = [];
        for (const mandate of mandates) {
          const hasSigned = await this.hasSignedDoc(mandate.everSignId);
          if (hasSigned) {
            hasSignedPromises.push(this.$customers.saveSignedDoc({ _id: this.customer._id, mandateId: mandate._id }),
              this.$ogust.createSepaInfo({ id_tiers: this.customer.customerId, rum: mandate.rum, signature_date: this.$moment().format('YYYYMMDD') }));
          }
        }
        await Promise.all(hasSignedPromises);
        await this.getCustomer();
      } catch (e) {
        console.error(e);
      }
    },
    async hasSignedDoc (docId) {
      try {
        const docRaw = await esign.getDocument(docId);
        return docRaw.data.data.document.log.some(el => el.event === 'document_signed');
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

  .toolbar-padding
    padding: 20px 58px

  /deep/ .q-layout-header
    box-shadow: none

  .iframe-normal
    position: absolute
    width: 100%
    height:100%

  .q-card-container
    padding: 0

</style>
