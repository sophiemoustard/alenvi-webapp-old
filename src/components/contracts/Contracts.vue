<template>
  <div>
    <q-card v-for="(contract, index) in sortedContracts" :key="index" class="contract-card">
      <q-card-title :style="{ color: cardTitle(contract.endDate).color }">
        {{ cardTitle(contract.endDate).msg }}
      </q-card-title>
      <p v-if="contract.status === CUSTOMER_CONTRACT" class="card-sub-title">
        Statut : {{ getContractStatus(contract) }} - Bénéficiaire : {{ contract.customer.identity.title }} {{
        contract.customer.identity.lastname }}
      </p>
      <p v-else class="card-sub-title">Statut : {{ getContractStatus(contract) }}</p>
      <q-table :data="contract.versions" :columns="columns" row-key="name" :pagination.sync="pagination" hide-bottom
        :visible-columns="visibleColumns" binary-state-sort class="table-responsive">
        <q-tr slot="body" slot-scope="props" :props="props">
          <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
            <template v-if="col.name === 'contractEmpty'">
              <div class="row justify-center table-actions">
                <q-btn flat round small color="primary" @click="dlTemplate(props.row, contract.startDate)" icon="file download" />
              </div>
            </template>
            <template v-else-if="col.name === 'contractSigned'">
              <div v-if="!props.row.link && displayUploader" class="row justify-center table-actions">
                <q-uploader :ref="`signedContract_${props.row._id}`" name="signedContract" :headers="headers" :url="docsUploadUrl(contract._id)"
                  @fail="failMsg" :additional-fields="getAdditionalFields(contract, props.row)" hide-underline
                  @uploaded="refresh" :extensions="extensions" hide-upload-button @add="uploadDocument($event, `signedContract_${props.row._id}`)" />
              </div>
              <div v-else-if="props.row.link" class="row justify-center table-actions">
                <q-btn flat round small color="primary">
                  <a :href="props.row.link" target="_blank">
                    <q-icon name="file download" />
                  </a>
                </q-btn>
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
  </div>
</template>

<script>
import { Cookies } from 'quasar';
import { contractMixin } from '../../mixins/contractMixin.js';
import { CONTRACT_STATUS_OPTIONS, CUSTOMER_CONTRACT } from '../../data/constants.js';
import { NotifyPositive, NotifyNegative } from '../../components/popup/notify.js';
import { downloadDocxFile } from '../../helpers/downloadFile';
import nationalities from '../../data/nationalities.js';

export default {
  name: 'Contracts',
  mixins: [contractMixin],
  props: {
    user: { type: Object, default: () => null },
    contracts: { type: Array, default: () => [] },
    visibleColumns: { type: Array, default: () => [] },
    displayActions: { type: Boolean, default: () => false },
    displayUploader: { type: Boolean, default: () => false }
  },
  data () {
    return {
      CUSTOMER_CONTRACT,
      pagination: { rowsPerPage: 0 },
      columns: [
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
          label: 'Contrat',
          align: 'center',
          field: 'contractEmpty',
        },
        {
          name: 'contractSigned',
          label: 'Contrat signé',
          align: 'center',
          field: 'contractSigned',
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
      return {
        'x-access-token': Cookies.get('alenvi_token') || ''
      }
    },
  },
  methods: {
    getFullNationality (nationality) {
      return nationalities[nationality];
    },
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
        { name: 'versionId', value: version._id }
      ]
    },
    getLastVersion (contract) {
      return this.$_.orderBy(contract.versions, ['startDate'], ['desc'])[0];
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
    async updateContractActivity (isActive, contract, version, contractIndex) {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Es-tu sûr(e) de vouloir activer ce contrat ?',
          ok: true,
          cancel: 'Annuler'
        });
        await this.updateEndDateOfPreviousVersion(contract._id, contractIndex);
        const queries = {
          contractId: contract._id,
          versionId: version._id,
        };
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
    async dlTemplate (contract, contractStartDate) {
      try {
        const monthlyHours = Number.parseFloat(contract.weeklyHours * 4.33).toFixed(1);
        const { identity, contact } = this.user
        const data = {
          'auxiliaryTitle': identity.title,
          'auxiliaryFirstname': identity.firstname,
          'auxiliaryLastname': identity.lastname,
          'auxiliaryAddress': contact.address.fullAddress,
          'auxiliaryBirthDate': this.$moment(identity.birthDate).format('DD/MM/YYYY'),
          'auxiliaryNationality': this.getFullNationality(identity.nationality),
          'auxiliarySSN': identity.socialSecurityNumber,
          'grossHourlyRate': contract.grossHourlyRate,
          'monthlyHours': monthlyHours,
          'salary': monthlyHours * contract.grossHourlyRate,
          'startDate': this.$moment(contract.startDate).format('DD/MM/YYYY'),
          'weeklyHours': contract.weeklyHours,
          'yearlyHours': contract.weeklyHours * 52,
          'uploadDate': this.$moment(Date.now()).format('DD/MM/YYYY'),
          'initialContractStartDate': this.$moment(contractStartDate).format('DD/MM/YYYY'),
        };
        const params = {
          driveId: contract.__index === 0 ? this.user.company.rhConfig.templates.contractWithCompany.driveId : this.user.company.rhConfig.templates.contractWithCompanyVersion.driveId,
        };

        await downloadDocxFile(params, data, 'contrat.docx');
      } catch (e) {
        console.error(e);
      }
    }
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
</style>
