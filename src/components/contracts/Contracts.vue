<template>
  <div>
    <q-card v-for="(contract, index) in sortedContracts" :key="index" class="contract-card">
      <q-card-title :style="{ color: cardTitle(contract.endDate).color }">
        {{ cardTitle(contract.endDate).msg }}
      </q-card-title>
      <p v-if="contract.status === CUSTOMER_CONTRACT && personKey !== CUSTOMER" class="card-sub-title">
        Statut : {{ getContractStatus(contract) }} - Bénéficiaire : {{ contract.customer.identity.title }} {{
        contract.customer.identity.lastname }}
      </p>
      <p v-if="contract.status === CUSTOMER_CONTRACT && personKey === CUSTOMER" class="card-sub-title">
        Statut : {{ getContractStatus(contract) }} - Auxiliaire : {{ contract.user.identity.firstname }} {{
        contract.user.identity.lastname }}
      </p>
      <p v-if="contract.status === COMPANY_CONTRACT" class="card-sub-title">Statut : {{ getContractStatus(contract) }}</p>
      <q-table :data="contract.versions" :columns="contractColumns" row-key="name" :pagination.sync="pagination"
        hide-bottom :visible-columns="visibleColumns(contract)" binary-state-sort class="table-responsive">
        <q-tr slot="body" slot-scope="props" :props="props">
          <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
            <template v-if="col.name === 'contractEmpty'">
              <div class="row justify-center table-actions">
                <q-btn flat round small color="primary" @click="dlTemplate(props.row, contract)" icon="file download"
                  :disable="!canDownload(props.row, contract.status)" />
              </div>
            </template>
            <template v-else-if="col.name === 'contractSigned'">
              <div v-if="hasToBeSignedOnline(props.row) && shouldSignDocument(contract.status, props.row.signature)">
                <q-btn no-caps small color="primary" label="Signer" @click="openSignatureModal(props.row.signature.eversignId)" />
              </div>
              <div v-else-if="!getContractLink(props.row) && displayUploader && !hasToBeSignedOnline(props.row)" class="row justify-center table-actions">
                <q-uploader :ref="`signedContract_${props.row._id}`" name="signedContract" :headers="headers" :url="docsUploadUrl(contract._id)"
                  @fail="failMsg" :additional-fields="getAdditionalFields(contract, props.row)" hide-underline
                  @uploaded="refresh" :extensions="extensions" hide-upload-button @add="uploadDocument($event, `signedContract_${props.row._id}`)"/>
              </div>
              <div v-else-if="getContractLink(props.row)" class="row justify-center table-actions">
                <q-btn flat round small color="primary">
                  <a :href="getContractLink(props.row)" target="_blank">
                    <q-icon name="file download" />
                  </a>
                </q-btn>
              </div>
              <div v-else class="row justify-center table-actions">
                <p class="no-margin">En attente de signature</p>
              </div>
            </template>
            <template v-else-if="col.name === 'isActive'">
              <div class="row justify-center table-actions">
                <q-checkbox :disable="col.value || (props.row && 'endDate' in props.row)" :value="col.value" @input="updateContractActivity($event, contract, props.row, index)" />
              </div>
            </template>
            <template v-else>{{ col.value }}</template>
          </q-td>
        </q-tr>
      </q-table>
      <q-card-actions align="end">
        <template v-if="displayActions">
          <q-btn v-if="getActiveVersion(contract)" flat no-caps color="primary" icon="add" label="Ajouter un avenant"
            @click="openVersionCreation(contract)" />
          <q-btn v-if="getActiveVersion(contract)" flat no-caps color="grey-6" icon="clear" label="Mettre fin au contrat"
            @click="openEndContract(contract)" />
        </template>
      </q-card-actions>
    </q-card>

    <q-modal v-model="esignModal" @hide="refreshWithTimeout" content-classes="e-sign-modal-container">
      <q-modal-layout>
        <q-toolbar class="no-shadow row justify-end toolbar-padding" color="black" inverted slot="header">
          <q-icon class="cursor-pointer" name="clear" size="1.5rem" @click.native="esignModal = false" />
        </q-toolbar>
        <iframe :src="embeddedUrl" frameborder="0" class="iframe-normal"></iframe>
      </q-modal-layout>
    </q-modal>
  </div>
</template>

<script>
import { Cookies } from 'quasar';
import { contractMixin } from '../../mixins/contractMixin.js';
import { CONTRACT_STATUS_OPTIONS, CUSTOMER_CONTRACT, COACH, CUSTOMER, AUXILIARY, COMPANY_CONTRACT } from '../../data/constants.js';
import { NotifyPositive, NotifyNegative } from '../../components/popup/notify.js';
import { downloadDocxFile } from '../../helpers/downloadFile';
import { generateContractFields } from '../../helpers/generateContractFields';
import esign from '../../api/Esign.js';

export default {
  name: 'Contracts',
  mixins: [contractMixin],
  props: {
    user: { type: Object, default: () => null },
    contracts: { type: Array, default: () => [] },
    columns: { type: Array, default: () => [] },
    displayActions: { type: Boolean, default: () => false },
    displayUploader: { type: Boolean, default: () => false },
    personKey: { type: String, default: () => COACH },
  },
  data () {
    return {
      CUSTOMER_CONTRACT,
      COMPANY_CONTRACT,
      CUSTOMER,
      esignModal: false,
      embeddedUrl: '',
      loading: false,
      pagination: { rowsPerPage: 0 },
      contractColumns: [
        {
          name: 'weeklyHours',
          label: 'Volume horaire hebdomadaire',
          align: 'center',
          field: 'weeklyHours',
        },
        {
          name: 'startDate',
          label: 'Date d\'effet',
          align: 'left',
          field: 'startDate',
          format: (value) => this.$moment(value).format('DD/MM/YYYY'),
        },
        {
          name: 'endDate',
          label: 'Date de fin',
          align: 'left',
          field: 'endDate',
          format: (value) => value ? this.$moment(value).format('DD/MM/YYYY') : '∞',
        },
        {
          name: 'grossHourlyRate',
          label: 'Taux horaire',
          align: 'center',
          field: 'grossHourlyRate',
        },
        {
          name: 'contractEmpty',
          label: 'Word',
          align: 'center',
          field: 'contractEmpty',
        },
        {
          name: 'contractSigned',
          label: 'Contrat / Avenant',
          align: 'center',
          field: (val) => val.signature ? val.signature.eversignId : '',
        },
        {
          name: 'isActive',
          label: 'Actif',
          align: 'center',
          field: 'isActive',
        },
      ],
      extensions: 'image/jpg, image/jpeg, image/gif, image/png, application/pdf',
    }
  },
  computed: {
    sortedContracts () {
      const contracts = this.contracts;
      return contracts.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    },
    headers () {
      return { 'x-access-token': Cookies.get('alenvi_token') || '' };
    },
  },
  methods: {
    cardTitle (contractEndDate) {
      if (!contractEndDate) return { msg: 'Contrat en cours', color: 'green' };

      if (this.$moment().isBefore(contractEndDate)) {
        return {
          msg: `Le contrat se termine le ${this.$moment(contractEndDate).format('DD MMMM YYYY')}`,
          color: 'orange'
        }
      } else {
        return {
          msg: `Contrat terminé le: ${this.$moment(contractEndDate).format('DD MMMM YYYY')}`,
          color: 'red'
        }
      }
    },
    failMsg () {
      NotifyNegative('Echec de l\'envoi du document');
    },
    getAdditionalFields (contract, version) {
      return [
        { name: 'fileName', value: `contrat_signe_${this.user.identity.firstname}_${this.user.identity.lastname}` },
        { name: 'contractId', value: contract._id },
        { name: 'versionId', value: version._id },
        { name: 'type', value: contract.status }
      ]
    },
    getLastVersion (contract) {
      return this.$_.orderBy(contract.versions, ['startDate'], ['desc'])[0];
    },
    visibleColumns (contract) {
      if (contract.status === CUSTOMER_CONTRACT) return this.columns.filter(col => col !== 'weeklyHours');
      return this.columns;
    },
    getContractStatus (contract) {
      return CONTRACT_STATUS_OPTIONS.find(status => status.value === contract.status).label;
    },
    openVersionCreation (contract) {
      this.$emit('openVersionCreation', contract);
    },
    openEndContract (contract) {
      this.$emit('openEndContract', contract);
    },
    refresh () {
      this.$emit('refresh');
    },
    refreshWithTimeout () {
      this.$emit('refreshWithTimeout');
    },
    async updateContractActivity (isActive, contract, version, contractIndex) {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Es-tu sûr(e) de vouloir activer ce contrat ?',
          ok: true,
          cancel: 'Annuler'
        });
        await this.updateEndDateOfPreviousVersion(contract._id, contractIndex);

        const queries = { contractId: contract._id, versionId: version._id, };
        await this.$contracts.updateVersion(queries, { 'isActive': isActive });

        // Update manually checkbox because it's not dynamic
        this.sortedContracts[contractIndex].versions[version.__index].isActive = isActive;
        await this.updatePreviousVersions(contractIndex, version._id);
        this.refresh();
        NotifyPositive('Activité du contrat changée');
      } catch (e) {
        console.error(e);
        if (e.message !== '') {
          NotifyNegative('Erreur lors du changement de l\'activité du contrat');
        }
      }
    },
    // Contract edition
    async updatePreviousVersions (contractIndex, versionId) {
      for (let i = 0, l = this.contracts[contractIndex].versions.length; i < l; i++) {
        const contract = this.contracts[contractIndex];
        const currentVersion = contract.versions[i];
        if (currentVersion.isActive && currentVersion._id !== versionId) {
          const queries = {
            contractId: contract._id,
            versionId: currentVersion._id,
          };
          await this.$contracts.updateVersion(queries, { 'isActive': false });
          currentVersion.isActive = false;
        }
      }
    },
    async updateEndDateOfPreviousVersion (contractId, contractIndex) {
      const lastActiveVersion = this.getActiveVersion(this.contracts[contractIndex]);
      const lastVersion = this.getLastVersion(this.contracts[contractIndex]);

      if (lastActiveVersion) {
        const queries = {
          contractId: contractId,
          versionId: lastActiveVersion._id
        };
        const payload = { endDate: this.$moment(lastVersion.startDate).toDate() };
        await this.$contracts.updateVersion(queries, payload);
      }
    },
    // Documents
    canDownload (contract, status) {
      if (!this.user.company || !this.user.company.rhConfig || !this.user.company.rhConfig.templates) return false;

      const templates = this.user.company.rhConfig.templates;
      if (status === COMPANY_CONTRACT) {
        if (contract.__index === 0) return !!templates.contractWithCompany && !!templates.contractWithCompany.driveId;
        return !!templates.contractWithCompanyVersion && !!templates.contractWithCompanyVersion.driveId;
      }

      if (contract.__index === 0) return !!templates.contractWithCustomer && !!templates.contractWithCustomer.driveId;
      return !!templates.contractWithCustomerVersion && !!templates.contractWithCustomerVersion.driveId;
    },
    docsUploadUrl (contractId) {
      return `${process.env.API_HOSTNAME}/contracts/${contractId}/gdrive/${this.user.administrative.driveFolder.id}/upload`;
    },
    uploadDocument (files, refName) {
      if (files[0].size > 5000000) {
        this.$refs[refName][0].reset();
        NotifyNegative('Fichier trop volumineux (> 5 Mo)');
        return '';
      } else {
        this.$refs[refName][0].upload();
      }
    },
    async dlTemplate (contractVersion, parentContract) {
      try {
        const data = generateContractFields(parentContract.status, { user: this.user, contract: contractVersion, initialContractStartDate: parentContract.startDate });
        if (!this.canDownload(contractVersion, parentContract.status)) return NotifyNegative('Impossible de télécharger le contrat.');

        const params = {
          driveId: contractVersion.__index === 0 ? this.user.company.rhConfig.templates.contractWithCompany.driveId : this.user.company.rhConfig.templates.contractWithCompanyVersion.driveId,
        };

        await downloadDocxFile(params, data, 'contrat.docx');
      } catch (e) {
        console.error(e);
      }
    },
    async openSignatureModal (eversignId) {
      try {
        this.$q.loading.show();
        const document = await esign.getDocument(eversignId);
        const id = this.personKey === AUXILIARY ? 1 : 2;
        this.embeddedUrl = document.signers.find(signer => signer.id === id).embedded_signing_url;
        this.esignModal = true;
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la requête de signature en ligne du contrat');
      } finally {
        this.$q.loading.hide();
      }
    },
    hasToBeSignedOnline (contract) {
      return !!(contract.signature && contract.signature.eversignId);
    },
    shouldSignDocument (contractStatus, contractSignature) {
      switch (this.personKey) {
        case COACH:
          return contractStatus === COMPANY_CONTRACT && !contractSignature.signedBy.other;
        case AUXILIARY:
          return !contractSignature.signedBy.auxiliary;
        case CUSTOMER:
          return contractStatus === CUSTOMER_CONTRACT && !contractSignature.signedBy.other;
      }
    },
    getContractLink (contract) {
      if (this.personKey === CUSTOMER) {
        return contract.customerDoc ? contract.customerDoc.link : false;
      }
      return contract.auxiliaryDoc ? contract.auxiliaryDoc.link : false;
    },
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables';
  .contract-card
    background: white
    width: 100%
    margin-bottom: 20px

  .card-sub-title
    margin:  0 10px 10px
    font-size: 14px

  /deep/ .e-sign-modal-container
    min-width: 80vw
    min-height: 90vh

  .toolbar-padding
    padding: 20px 58px

  /deep/ .q-layout-header
    box-shadow: none

  .iframe-normal
    position: absolute
    width: 100%
    height:100%
</style>
