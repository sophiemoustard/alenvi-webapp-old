<template>
  <div>
    <div class="row">
      <template v-if="contracts">
        <q-card v-for="(contract, index) in sortedContracts" :key="index" class="contract-card">
          <q-card-title :style="{ color: cardTitle(contract.endDate).color }">
            {{ cardTitle(contract.endDate).msg }}
          </q-card-title>
          <p v-if="contract.status === CUSTOMER_CONTRACT" class="card-sub-title">
            Statut : {{ getContractStatus(contract) }} - Bénéficiaire : {{ contract.customer.identity.title }} {{ contract.customer.identity.lastname }}
          </p>
          <p v-else class="card-sub-title">Statut : {{ getContractStatus(contract) }}</p>
          <q-table :data="contract.versions" :columns="columns" row-key="name" :pagination.sync="pagination"
            hide-bottom :visible-columns="visibleColumns" binary-state-sort class="table-responsive">
            <q-tr slot="body" slot-scope="props" :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
                <template v-if="col.name === 'contractEmpty'">
                  <div class="row justify-center table-actions">
                    <q-btn flat round small color="primary" @click="dlTemplate(props.row, contract.startDate)" icon="file download" />
                  </div>
                </template>
                <template v-else-if="col.name === 'contractSigned'">
                  <div v-if="!props.row.link" class="row justify-center table-actions">
                    <q-uploader :ref="`signedContract_${props.row._id}`" name="signedContract" :headers="headers" :url="docsUploadUrl(contract._id)"
                      @fail="failMsg" :additional-fields="getAdditionalFields(contract, props.row)" hide-underline @uploaded="refreshContracts"
                      :extensions="extensions" hide-upload-button @add="uploadDocument($event, `signedContract_${props.row._id}`)" />
                  </div>
                  <div v-else class="row justify-center table-actions">
                    <q-btn flat round small color="primary">
                      <a :href="props.row.link" target="_blank">
                        <q-icon name="file download" />
                      </a>
                    </q-btn>
                  </div>
                </template>
                <template v-else-if="col.name === 'isActive'">
                  <div class="row justify-center table-actions">
                    <q-checkbox :disable="col.value || (props.row && 'endDate' in props.row)" :value="col.value"
                      @input="updateContractActivity($event, contract, props.row, index)" />
                  </div>
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
            </q-tr>
          </q-table>
          <q-card-actions align="end">
            <q-btn v-if="getActiveVersion(contract)" flat no-caps color="primary" icon="add" label="Ajouter un avenant"
              @click="openVersionCreationModal(contract)" />
            <q-btn v-if="getActiveVersion(contract)" flat no-caps color="grey-6" icon="clear" label="Mettre fin au contrat"
              @click="openEndContractModal(contract)" />
          </q-card-actions>
        </q-card>
      </template>
      <q-btn :disable="!hasBasicInfo" class="fixed fab-add-person" no-caps rounded color="primary" icon="add" label="Créer un nouveau contrat"
        @click="openCreationModal" />
      <div v-if="!hasBasicInfo" class="missingBasicInfo">
        <p>/!\ Il manque une ou des information(s) importante(s) pour pouvoir créer un nouveau contrat parmi:</p>
        <ul>
          <li>Nom de famille</li>
          <li>Nationalité</li>
          <li>Adresse complète (sauf complément)</li>
          <li>Date de naissance</li>
        </ul>
      </div>
    </div>

    <!-- New contract modal -->
    <q-modal v-model="newContractModal" content-classes="modal-container-sm" @hide="resetContractCreationModal">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Créer un <span class="text-weight-bold">nouveau contrat</span></h5>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span><q-icon name="clear" @click.native="newContractModal = false" /></span>
          </div>
        </div>
        <ni-modal-select caption="Statut" :error="$v.newContract.status.$error" :options="statusOptions" v-model="newContract.status"
          @blur="$v.newContract.status.$touch" separator required-field @input="resetContractCustomer" />
        <ni-modal-select v-if="newContract.status === CUSTOMER_CONTRACT" caption="Bénéficiaire" :error="$v.newContract.customer.$error"
          :options="customerOptions" v-model="newContract.customer" @blur="$v.newContract.customer.$touch" separator
          required-field />
        <ni-modal-input caption="Volume horaire hebdomadaire" :error="$v.newContract.weeklyHours.$error" type="number"
          v-model="newContract.weeklyHours" @blur="$v.newContract.weeklyHours.$touch" suffix="hr" required-field />
        <ni-modal-input v-if="newContract.status === COMPANY_CONTRACT" caption="Taux horaire" :error="$v.newContract.grossHourlyRate.$error"
          type="number" v-model="newContract.grossHourlyRate" @blur="$v.newContract.grossHourlyRate.$touch" suffix="€" required-field />
        <ni-datetime-picker caption="Date d'effet" :error="$v.newContract.startDate.$error" v-model="newContract.startDate"
          in-modal required-field />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Créer le contrat" icon-right="add" color="primary" :loading="loading"
        @click="createContract" />
    </q-modal>

    <!-- New version modal -->
    <q-modal v-model="newContractVersionModal" content-classes="modal-container-sm" @hide="resetVersionCreationModal">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Créer une <span class="text-weight-bold">version</span></h5>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span><q-icon name="clear" @click.native="newContractVersionModal = false" /></span>
          </div>
        </div>
        <ni-modal-input caption="Volume horaire hebdomadaire" :error="$v.newContractVersion.weeklyHours.$error" v-model="newContractVersion.weeklyHours"
          type="number" @blur="$v.newContractVersion.weeklyHours.$touch" suffix="hr" required-field />
        <ni-modal-input v-if="contractSelected.status === COMPANY_CONTRACT" caption="Taux horaire" :error="$v.newContractVersion.grossHourlyRate.$error"
          v-model="newContractVersion.grossHourlyRate" type="number" @blur="$v.newContractVersion.grossHourlyRate.$touch" suffix="€" required-field />
        <ni-datetime-picker caption="Date d'effet" :error="$v.newContractVersion.startDate.$error" v-model="newContractVersion.startDate"
          :min="getMinimalStartDate(contractSelected)" in-modal required-field />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Créer l'avenant" icon-right="add" color="primary" :loading="loading"
        @click="createVersion" />
    </q-modal>

    <!-- End contract modal -->
    <q-modal v-model="endContractModal" content-classes="modal-container-sm" @hide="resetEndContractModal">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Terminer un <span class="text-weight-bold">contrat</span></h5>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close" style="text-align: right">
            <span><q-icon name="clear" @click.native="endContractModal = false" /></span>
          </div>
        </div>
        <ni-datetime-picker caption="Date de notification" v-model="endContract.endNotificationDate" in-modal
          required-field @blur="$v.endContract.endNotificationDate.$touch" :error="$v.endContract.endNotificationDate.$error" />
        <ni-datetime-picker caption="Date de fin de contrat" v-model="endContract.endDate" :min="minEndContractDate"
          in-modal required-field @blur="$v.endContract.endDate.$touch" :error="$v.endContract.endDate.$error" />
        <ni-modal-select caption="Motif" :options="endContractReasons" v-model="endContract.endReason" required-field
          @blur="$v.endContract.endReason.$touch" :error="$v.endContract.endReason.$error" @input="resetOtherMisc" />
        <ni-modal-input caption="Autres" v-if="endContract.endReason === OTHER" v-model="endContract.otherMisc"
          required-field @blur="$v.endContract.otherMisc.$touch" :error="$v.endContract.otherMisc.$error" />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Mettre fin au contrat" icon-right="clear" color="primary"
        :loading="loading" @click="endExistingContract" />
    </q-modal>
  </div>
</template>

<script>
import { Cookies } from 'quasar';
import { required, requiredIf } from 'vuelidate/lib/validators';
import ModalSelect from '../form/ModalSelect.vue';
import ModalInput from '../form/ModalInput.vue';
import DatetimePicker from '../form/DatetimePicker.vue';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '../popup/notify';
import { downloadDocxFile } from '../../helpers/downloadFile';
import nationalities from '../../data/nationalities.js';
import { END_CONTRACT_REASONS, OTHER, CONTRACT_STATUS_OPTIONS, CUSTOMER_CONTRACT, COMPANY_CONTRACT } from '../../data/constants';

export default {
  name: 'ProfileContracts',
  components: {
    'ni-modal-select': ModalSelect,
    'ni-modal-input': ModalInput,
    'ni-datetime-picker': DatetimePicker,
  },
  data () {
    return {
      loading: false,
      pagination: { rowsPerPage: 0 },
      newContractModal: false,
      newContractVersionModal: false,
      endContractModal: false,
      endContract: {
        endDate: '',
        endNotificationDate: '',
        endReason: '',
        contract: {},
      },
      OTHER,
      endContractReasons: END_CONTRACT_REASONS,
      contracts: [],
      contractSelected: {},
      newContract: {
        status: '',
        customer: '',
        weeklyHours: '',
        startDate: '',
        grossHourlyRate: ''
      },
      newContractVersion: {
        weeklyHours: '',
        startDate: '',
        grossHourlyRate: ''
      },
      CUSTOMER_CONTRACT,
      COMPANY_CONTRACT,
      customerOptions: [],
      visibleColumns: ['weeklyHours', 'startDate', 'endDate', 'grossHourlyRate', 'contractEmpty', 'contractSigned', 'isActive'],
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
        {
          name: 'ogustContractId',
          label: 'ogustContractId',
          align: 'left',
          field: 'ogustContractId',
          sortable: false,
          required: false
        }
      ],
      extensions: 'image/jpg, image/jpeg, image/gif, image/png, application/pdf',
    }
  },
  validations: {
    newContract: {
      status: { required },
      customer: { required: requiredIf((item) => {
        return item.status === CUSTOMER_CONTRACT;
      }) },
      weeklyHours: { required },
      startDate: { required },
      grossHourlyRate: { required },
    },
    newContractVersion: {
      weeklyHours: { required },
      startDate: { required },
      grossHourlyRate: { required },
    },
    endContract: {
      endNotificationDate: { required },
      endDate: { required },
      endReason: { required },
      otherMisc: { required: requiredIf((item) => {
        return item.endReason === OTHER;
      }) },
    },
  },
  computed: {
    getUser () {
      return this.$store.getters['rh/getUserProfile'];
    },
    headers () {
      return {
        'x-access-token': Cookies.get('alenvi_token') || ''
      }
    },
    sortedContracts () {
      const contracts = this.contracts;
      return contracts.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    },
    hasBasicInfo () {
      if (this.getUser.identity && this.getUser.identity.lastname && this.getUser.identity.birthDate && this.getUser.identity.nationality &&
        this.getUser.contact && this.getUser.contact.address && this.getUser.contact.zipCode && this.getUser.contact.city) {
        return true;
      }
      return false;
    },
    hasActiveContract () {
      if (this.contracts.length === 0) return false;
      for (let i = 0; i < this.contracts.length; i++) {
        const activeVersion = this.contracts[i].versions.find(version => version.isActive);
        if (this.contracts[i].status === COMPANY_CONTRACT && activeVersion) return true;
      }

      return false;
    },
    statusOptions () {
      if (!this.hasActiveContract) return CONTRACT_STATUS_OPTIONS;

      return CONTRACT_STATUS_OPTIONS.filter(option => option.value === CUSTOMER_CONTRACT);
    },
    minEndContractDate () {
      if (this.endContractModal) {
        const activeVersion = this.getActiveVersion(this.endContract.contract);
        return this.$moment(activeVersion.startDate).add(1, 'day').toISOString();
      }
      return '';
    }
  },
  async mounted () {
    await this.refreshContracts();
    await this.getCustomersWithCustomerContractSubscriptions();
    this.newContract.grossHourlyRate = this.getUser.company.rhConfig.providerContracts.grossHourlyRate;
  },
  methods: {
    getFullNationality (nationality) {
      return nationalities[nationality];
    },
    getActiveVersion (contract) {
      return contract.versions ? contract.versions.find(version => version.isActive) : null;
    },
    getLastVersion (contract) {
      return this.$_.orderBy(contract.versions, ['startDate'], ['desc'])[0];
    },
    getMinimalStartDate (contract) {
      const activeVersion = this.getActiveVersion(contract);
      return activeVersion ? this.$moment(activeVersion.startDate).toISOString() : '';
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
    getContractStatus (contract) {
      return CONTRACT_STATUS_OPTIONS.find(status => status.value === contract.status).label;
    },
    failMsg () {
      NotifyNegative('Echec de l\'envoi du document');
    },
    async refreshContracts () {
      try {
        const contracts = await this.$contracts.list({ user: this.getUser._id });
        this.contracts = contracts;
      } catch (e) {
        this.contracts = [];
        console.error(e);
      }
    },
    async getCustomersWithCustomerContractSubscriptions () {
      try {
        const customers = await this.$customers.showAllWithCustomerContractSubscriptions();
        this.customerOptions = customers.map(cus => ({
          label: `${cus.identity.title} ${cus.identity.lastname}`,
          value: cus._id
        }));
      } catch (e) {
        this.customerOptions = [];
        console.error(e);
      }
    },
    // Contract creation
    resetContractCustomer () {
      this.newContract.customer = '';
      this.$v.newContract.customer.$reset();
    },
    openCreationModal () {
      this.newContract.user = this.getUser._id;
      this.newContractModal = true;
    },
    resetContractCreationModal () {
      this.newContractModal = false;
      this.newContract = {};
      this.newContract.grossHourlyRate = this.getUser.company.rhConfig.providerContracts.grossHourlyRate;
      this.$v.newContract.$reset();
    },
    async createContract () {
      try {
        this.$v.newContract.$touch();
        if (this.$v.newContract.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = {
          startDate: this.newContract.startDate,
          status: this.newContract.status,
          user: this.newContract.user,
          versions: [{
            weeklyHours: this.newContract.weeklyHours,
            startDate: this.newContract.startDate,
          }],
        };
        if (payload.status === CUSTOMER_CONTRACT) payload.customer = this.newContract.customer;
        else payload.versions[0].grossHourlyRate = this.newContract.grossHourlyRate;

        await this.$contracts.create(this.$_.pickBy(payload));
        await this.refreshContracts();
        this.resetContractCreationModal();
        NotifyPositive('Contrat créé');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création du contrat');
      } finally {
        this.loading = false;
      }
    },
    // Contract edition
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
        await this.refreshContracts();
        NotifyPositive('Activité du contrat changée');
      } catch (e) {
        console.error(e);
        if (e.message !== '') {
          NotifyNegative('Erreur lors du changement de l\'activité du contrat');
        }
      }
    },
    // Version creation
    openVersionCreationModal (contract) {
      this.newContractVersion.grossHourlyRate = this.getUser.company.rhConfig.providerContracts.grossHourlyRate;
      this.newContractVersion.contractId = contract._id;
      this.contractSelected = contract;
      this.newContractVersionModal = true;
    },
    resetVersionCreationModal () {
      this.newContractVersionModal = false;
      this.newContractVersion = {};
      this.newContractVersion.grossHourlyRate = this.getUser.company.rhConfig.providerContracts.grossHourlyRate;
      this.$v.newContractVersion.$reset();
    },
    async createVersion () {
      try {
        this.$v.newContractVersion.$touch();
        if (this.$v.newContractVersion.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const contractId = this.newContractVersion.contractId;
        delete this.newContractVersion.contractId;
        await this.$contracts.createVersion(contractId, this.newContractVersion);
        await this.refreshContracts();
        this.resetVersionCreationModal();
        NotifyPositive('Version créée');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création de la version du contrat');
      } finally {
        this.loading = false;
      }
    },
    // End contract
    async openEndContractModal (contract) {
      this.endContract.contract = contract;
      this.endContractModal = true
    },
    resetEndContractModal () {
      this.endContractModal = false;
      this.endContract = {};
      this.$v.endContract.$reset();
    },
    resetOtherMisc () {
      if (this.endContract.endReason !== OTHER && this.endContract.otherMisc) {
        delete this.endContract.otherMisc;
        this.$v.endContract.otherMisc.$reset();
      }
    },
    async endExistingContract () {
      try {
        this.$v.endContract.$touch();
        if (this.$v.endContract.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        await this.$contracts.update(this.endContract.contract._id, this.$_.omit(this.endContract, ['contract']));
        await this.refreshContracts();
        this.resetEndContractModal();
        NotifyPositive('Contrat terminé');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la mise à jour du contrat');
      } finally {
        this.loading = false;
      }
    },
    // Documents
    getAdditionalFields (contract, version) {
      return [
        { name: 'fileName', value: `contrat_signe_${this.getUser.identity.firstname}_${this.getUser.identity.lastname}` },
        { name: 'contractId', value: contract._id },
        { name: 'versionId', value: version._id }
      ]
    },
    docsUploadUrl (contractId) {
      return `${process.env.API_HOSTNAME}/contracts/${contractId}/gdrive/${this.getUser.administrative.driveFolder.id}/upload`;
    },
    async dlTemplate (contract, contractStartDate) {
      try {
        const monthlyHours = Number.parseFloat(contract.weeklyHours * 4.33).toFixed(1);
        const { identity, contact } = this.getUser
        const data = {
          'auxiliaryTitle': identity.title,
          'auxiliaryFirstname': identity.firstname,
          'auxiliaryLastname': identity.lastname,
          'auxiliaryAddress': `${contact.address} ${contact.zipCode} ${contact.city}`,
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
          driveId: contract.__index === 0 ? this.getUser.company.rhConfig.templates.contract.driveId : this.getUser.company.rhConfig.templates.amendment.driveId,
        };

        await downloadDocxFile(params, data, 'contrat.docx');
      } catch (e) {
        console.error(e);
      }
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
  }
};
</script>

<style lang="stylus" scoped>
  @import '~variables';
  .contract-card
    background: white
    width: 100%
    margin-bottom: 20px

  .missingBasicInfo
    color: red
    background: white
    padding: 10px
    margin-left: auto
    margin-right: auto

  .card-sub-title
    margin:  0 10px 10px
    font-size: 14px

</style>
