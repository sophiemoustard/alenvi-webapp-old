<template>
  <div>
    <div class="row">
      <ni-contracts v-if="contracts" :contracts="contracts" :user="getUser" @openEndContract="openEndContractModal"
        @openVersionEdition="openVersionEditionModal" @openVersionCreation="openVersionCreationModal" :personKey="COACH"
        @refresh="refreshContracts" :columns="contractVisibleColumns" display-actions display-uploader
        @refreshWithTimeout="refreshContractsWithTimeout" @deleteVersion="deleteVersion" />
      <q-btn :disable="!hasBasicInfo" class="fixed fab-custom" no-caps rounded color="primary" icon="add"
        label="Créer un nouveau contrat" @click="openCreationModal" />
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
    <ni-modal v-model="newContractModal" @hide="resetContractCreationModal">
      <template slot="title">
        Créer un <span class="text-weight-bold">nouveau contrat</span>
      </template>
      <ni-select in-modal caption="Statut" :error="$v.newContract.status.$error" :options="statusOptions"
        v-model="newContract.status" separator required-field @blur="$v.newContract.status.$touch"
        @input="resetContract" />
      <ni-select v-if="newContract.status === CUSTOMER_CONTRACT" in-modal caption="Bénéficiaire"
        :error="$v.newContract.customer.$error" :options="customerOptions" v-model="newContract.customer"
        @blur="$v.newContract.customer.$touch" separator required-field />
      <ni-input in-modal v-if="newContract.status === COMPANY_CONTRACT" caption="Volume horaire hebdomadaire"
        :error="$v.newContract.weeklyHours.$error" type="number" v-model="newContract.weeklyHours"
        @blur="$v.newContract.weeklyHours.$touch" suffix="hr" required-field />
      <ni-input in-modal caption="Taux horaire" :error="$v.newContract.grossHourlyRate.$error" type="number"
        v-model="newContract.grossHourlyRate" @blur="$v.newContract.grossHourlyRate.$touch" suffix="€" required-field />
      <ni-datetime-picker caption="Date d'effet" :error="$v.newContract.startDate.$error" :min="companyContractMinStartDate"
        v-model="newContract.startDate" in-modal required-field />
      <div class="row margin-input last">
        <div class="col-12">
          <q-checkbox v-model="newContract.shouldBeSigned" label="Signature en ligne" />
        </div>
      </div>
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Créer le contrat" icon-right="add" color="primary"
          :loading="loading" @click="createContract" />
      </template>
    </ni-modal>

    <!-- New version modal -->
    <ni-modal v-model="newVersionModal" @hide="resetVersionCreationModal">
      <template slot="title">
        Créer une <span class="text-weight-bold">version</span>
      </template>
      <ni-input in-modal v-if="selectedContract.status === COMPANY_CONTRACT" caption="Volume horaire hebdomadaire"
        :error="$v.newVersion.weeklyHours.$error" v-model="newVersion.weeklyHours" type="number"
        @blur="$v.newVersion.weeklyHours.$touch" suffix="hr" required-field />
      <ni-input in-modal caption="Taux horaire" :error="$v.newVersion.grossHourlyRate.$error"
        v-model="newVersion.grossHourlyRate" type="number" suffix="€" required-field
        @blur="$v.newVersion.grossHourlyRate.$touch" />
      <ni-datetime-picker caption="Date d'effet" :error="$v.newVersion.startDate.$error" v-model="newVersion.startDate"
        :min="newVersionMinStartDate" in-modal required-field />
      <div class="row margin-input last">
        <div class="col-12">
          <q-checkbox v-model="newVersion.shouldBeSigned" label="Signature en ligne" />
        </div>
      </div>
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Créer l'avenant" icon-right="add" color="primary"
          :loading="loading" @click="createVersion" />
      </template>
    </ni-modal>

    <!-- Edition modal -->
    <version-edition-modal :isOpened="versionEditionModal" :editedVersion="editedVersion" :loading="loading"
      :validations="$v.editedVersion" :minStartDate="editedVersionMinStartDate" :isVersionUpdated="isVersionUpdated"
      @hide="resetVersionEditionModal" @editVersion="editVersion"/>

    <!-- End contract modal -->
    <ni-modal v-model="endContractModal" @hide="resetEndContractModal">
      <template slot="title">
        Terminer un <span class="text-weight-bold">contrat</span>
      </template>
      <ni-datetime-picker caption="Date de notification" v-model="endContract.endNotificationDate" in-modal
        required-field @blur="$v.endContract.endNotificationDate.$touch"
        :error="$v.endContract.endNotificationDate.$error" />
      <ni-datetime-picker caption="Date de fin de contrat" v-model="endContract.endDate" :min="contractMinEndDate"
        in-modal required-field @blur="$v.endContract.endDate.$touch" :error="$v.endContract.endDate.$error" />
      <ni-select in-modal caption="Motif" :options="endContractReasons" v-model="endContract.endReason" required-field
        @blur="$v.endContract.endReason.$touch" :error="$v.endContract.endReason.$error" @input="resetOtherMisc" />
      <ni-input in-modal caption="Autres" v-if="endContract.endReason === OTHER" v-model="endContract.otherMisc"
        required-field @blur="$v.endContract.otherMisc.$touch" :error="$v.endContract.otherMisc.$error" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Mettre fin au contrat" icon-right="clear" color="primary"
          :loading="loading" @click="endExistingContract" />
      </template>
    </ni-modal>
  </div>
</template>

<script>
import { required, requiredIf, minValue } from 'vuelidate/lib/validators';
import { minDate } from '../../helpers/vuelidateCustomVal';
import Select from '../form/Select';
import Input from '../form/Input';
import DatetimePicker from '../form/DatetimePicker';
import Contracts from '../contracts/Contracts';
import Modal from '../Modal';
import VersionEditionModal from '../contracts/VersionEditionModal.vue';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '../popup/notify';
import { END_CONTRACT_REASONS, OTHER, CONTRACT_STATUS_OPTIONS, CUSTOMER_CONTRACT, COMPANY_CONTRACT, COACH } from '../../data/constants';
import { contractMixin } from '../../mixins/contractMixin.js';
import { formatIdentity } from '../../helpers/utils';

export default {
  name: 'ProfileContracts',
  mixins: [contractMixin],
  components: {
    'ni-select': Select,
    'ni-input': Input,
    'ni-datetime-picker': DatetimePicker,
    'ni-contracts': Contracts,
    'ni-modal': Modal,
    'version-edition-modal': VersionEditionModal,
  },
  data () {
    return {
      OTHER,
      COACH,
      contracts: [],
      CUSTOMER_CONTRACT,
      COMPANY_CONTRACT,
      customers: [],
      contractVisibleColumns: ['weeklyHours', 'startDate', 'endDate', 'grossHourlyRate', 'contractEmpty', 'contractSigned', 'archives', 'actions'],
      // New contract
      newContractModal: false,
      newContract: {
        status: '',
        customer: '',
        weeklyHours: '',
        startDate: '',
        grossHourlyRate: '',
        shouldBeSigned: true,
      },
      // New version
      newVersionModal: false,
      newVersion: {
        weeklyHours: '',
        startDate: '',
        grossHourlyRate: '',
        shouldBeSigned: true,
      },
      // End contract
      endContractModal: false,
      endContract: {
        endDate: '',
        endNotificationDate: '',
        endReason: '',
        contract: {},
      },
      endContractReasons: END_CONTRACT_REASONS,
    }
  },
  validations () {
    return {
      newContract: {
        status: { required },
        customer: { required: requiredIf((item) => item.status === CUSTOMER_CONTRACT) },
        weeklyHours: { required: requiredIf((item) => item.status === COMPANY_CONTRACT) },
        startDate: { required },
        grossHourlyRate: { required },
      },
      newVersion: {
        weeklyHours: this.selectedContract.status === CUSTOMER_CONTRACT ? {} : { required },
        startDate: { required },
        grossHourlyRate: { required },
      },
      editedVersion: {
        grossHourlyRate: { required, minValue: minValue(0) },
        startDate: { required, minDate: this.editedVersionMinStartDate ? minDate(this.editedVersionMinStartDate) : '' },
      },
      endContract: {
        endNotificationDate: { required },
        endDate: { required },
        endReason: { required },
        otherMisc: { required: requiredIf((item) => item.endReason === OTHER) },
      },
    }
  },
  computed: {
    mainUser () {
      return this.$store.getters['main/user'];
    },
    getUser () {
      return this.$store.getters['rh/getUserProfile'];
    },
    userCompany () {
      return this.getUser.company;
    },
    hasBasicInfo () {
      if (this.getUser.identity && this.getUser.identity.lastname && this.getUser.identity.birthDate && this.getUser.identity.nationality &&
        this.getUser.contact && this.getUser.contact.address && this.getUser.contact.address.street && this.getUser.contact.address.city) {
        return true;
      }
      return false;
    },
    hasCompanyContract () {
      if (this.contracts.length === 0) return false;
      for (let i = 0; i < this.contracts.length; i++) {
        if (this.contracts[i].status === COMPANY_CONTRACT && !this.contracts[i].endDate) return true;
      }

      return false;
    },
    statusOptions () {
      if (!this.hasCompanyContract) return CONTRACT_STATUS_OPTIONS;

      return CONTRACT_STATUS_OPTIONS.filter(option => option.value === CUSTOMER_CONTRACT);
    },
    companyContractMinStartDate () {
      if (this.contracts.length === 0) return '';
      const endedCompanyContract = this.contracts
        .filter(contract => contract.status === COMPANY_CONTRACT && contract.endDate)
        .sort((a, b) => b.startDate - a.startDate);

      if (endedCompanyContract.length === 0) return '';

      return this.$moment(endedCompanyContract[0].endDate).add(1, 'd').toISOString();
    },
    contractMinEndDate () {
      if (this.endContractModal) {
        const lastVersion = this.endContract.contract.versions[this.endContract.contract.versions.length - 1];
        return this.$moment(lastVersion.startDate).add(1, 'day').toISOString();
      }
      return '';
    },
    customerOptions () {
      return this.customers.map(cus => ({
        label: formatIdentity(cus.identity, 'FL'),
        value: cus._id,
      }));
    },
    newVersionMinStartDate () {
      const lastVersion = this.selectedContract.versions[this.selectedContract.versions.length - 1];
      return lastVersion ? this.$moment(lastVersion.startDate).toISOString() : '';
    },
    isPreviousPayImpacted () {
      const startOfMonth = this.$moment().startOf('M');
      return startOfMonth.isAfter(this.selectedVersion.startDate) || startOfMonth.isAfter(this.editedVersion.startDate)
    },
  },
  async mounted () {
    await this.refreshContracts();
    await this.getCustomersWithCustomerContractSubscriptions();
  },
  methods: {
    getContractTemplate (contract) {
      return contract.status === COMPANY_CONTRACT
        ? this.$_.get(this.userCompany, 'rhConfig.templates.contractWithCompany')
        : this.$_.get(this.userCompany, 'rhConfig.templates.contractWithCustomer');
    },
    getVersionTemplate (contract) {
      return contract.status === COMPANY_CONTRACT
        ? this.$_.get(this.userCompany, 'rhConfig.templates.contractWithCompanyVersion')
        : this.$_.get(this.userCompany, 'rhConfig.templates.contractWithCustomerVersion');
    },
    async getCustomersWithCustomerContractSubscriptions () {
      try {
        this.customers = await this.$customers.listWithCustomerContractSubscriptions();
      } catch (e) {
        this.customers = [];
        console.error(e);
      }
    },
    async refreshContracts () {
      try {
        this.contracts = await this.$contracts.list({ user: this.getUser._id });
        const promises = [];
        for (const contract of this.contracts) {
          const version = contract.versions[contract.versions.length - 1];
          promises.push(this.$events.list({ status: contract.status, auxiliary: contract.user._id, startDate: version.startDate }));
        }

        const events = await Promise.all(promises);
        for (let i = 0, l = events.length; i < l; i++) {
          this.contracts[i].versions = this.contracts[i].versions.map((version, index) => {
            if (index !== this.contracts[i].versions.length - 1) return { ...version, canBeDeleted: false };
            return { ...version, canBeDeleted: index !== 0 || events[i].length === 0 };
          })
        }
      } catch (e) {
        this.contracts = [];
        console.error(e);
      }
    },
    // Contract creation
    resetContract (val) {
      this.newContract.customer = '';
      this.newContract.grossHourlyRate = val === COMPANY_CONTRACT
        ? this.$_.get(this.getUser, 'company.rhConfig.contractWithCompany.grossHourlyRate')
        : this.$_.get(this.getUser, 'company.rhConfig.contractWithCustomer.grossHourlyRate');
      this.$v.newContract.customer.$reset();
    },
    openCreationModal () {
      this.newContract.user = this.getUser._id;
      this.newContractModal = true;
    },
    resetContractCreationModal () {
      this.newContractModal = false;
      this.newContract = {
        status: '',
        customer: '',
        weeklyHours: '',
        startDate: '',
        grossHourlyRate: '',
        shouldBeSigned: true,
      };
      this.$v.newContract.$reset();
    },
    async getContractCreationPayload () {
      const payload = {
        startDate: this.newContract.startDate,
        status: this.newContract.status,
        user: this.newContract.user,
        versions: [{
          startDate: this.newContract.startDate,
          grossHourlyRate: this.newContract.grossHourlyRate,
        }],
      };
      if (this.newContract.status === CUSTOMER_CONTRACT) payload.customer = this.newContract.customer;
      if (this.newContract.status === COMPANY_CONTRACT) payload.versions[0].weeklyHours = this.newContract.weeklyHours;

      if (this.newContract.shouldBeSigned) {
        const template = this.getContractTemplate(this.newContract);
        payload.versions[0].signature = await this.getSignaturePayload(this.newContract, '', template);
      }

      return this.$_.pickBy(payload);
    },
    async createContract () {
      try {
        const template = this.getContractTemplate(this.newContract);
        if (!template || !template.driveId) return NotifyNegative('Template manquant');

        this.$v.newContract.$touch();
        if (this.$v.newContract.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = await this.getContractCreationPayload();
        await this.$contracts.create(payload);
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
    // Version creation
    openVersionCreationModal (contract) {
      this.newVersion.grossHourlyRate = contract.status === COMPANY_CONTRACT
        ? this.$_.get(this.getUser, 'company.rhConfig.contractWithCompany.grossHourlyRate')
        : this.$_.get(this.getUser, 'company.rhConfig.contractWithCustomer.grossHourlyRate');
      this.newVersion.contractId = contract._id;
      this.selectedContract = contract;
      this.newVersionModal = true;
    },
    resetVersionCreationModal () {
      this.newVersionModal = false;
      this.newVersion = {
        weeklyHours: '',
        startDate: '',
        grossHourlyRate: '',
        shouldBeSigned: true,
      };
      this.$v.newVersion.$reset();
    },
    async getVersionCreationPayload () {
      const payload = this.$_.pick(this.newVersion, ['startDate', 'grossHourlyRate', 'weeklyHours']);
      if (this.newVersion.shouldBeSigned) {
        const versionMix = { ...this.selectedContract, ...this.newVersion };
        const template = this.getVersionTemplate(versionMix);
        payload.signature = await this.getSignaturePayload(versionMix, 'Avenant au ', template);
      }

      return this.$_.pickBy(payload);
    },
    async createVersion () {
      try {
        const template = this.getVersionTemplate(this.selectedContract);
        if (!template || !template.driveId) return NotifyNegative('Template manquant');

        this.$v.newVersion.$touch();
        if (this.$v.newVersion.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = await this.getVersionCreationPayload();
        await this.$contracts.createVersion(this.newVersion.contractId, payload);
        await this.refreshContracts();

        this.resetVersionCreationModal();
        NotifyPositive('Version créée');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création de l\'avenant');
      } finally {
        this.loading = false;
      }
    },
    // Contract edition
    openVersionEditionModal ({ contract, version }) {
      this.editedVersion = {
        contractId: contract._id,
        versionId: version._id,
        grossHourlyRate: version.grossHourlyRate,
        startDate: version.startDate,
        shouldBeSigned: !!version.signature && !!version.signature.eversignId,
      };
      this.selectedContract = contract;
      this.selectedVersion = version;
      this.versionEditionModal = true;
    },
    // Delete version
    async deleteVersion ({ contractId, versionId }) {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Etes-vous sûr de vouloir supprimer cet avenant ?',
          ok: 'OK',
          cancel: 'Annuler',
        });

        await this.$contracts.deleteVersion(contractId, versionId);

        await this.refreshContracts();
        NotifyPositive('Version supprimée');
      } catch (e) {
        if (e.message === '') return NotifyPositive('Suppression annulée');
        console.error(e);
        if (e.status === 403) return NotifyNegative('Impossible de supprimer cet avenant');
        NotifyNegative('Erreur lors de la suppression de l\'avenant');
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
        const payload = { ...this.$_.omit(this.endContract, ['contract']) };
        payload.endDate = this.$moment(payload.endDate).endOf('day').toISOString();
        await this.$contracts.update(this.endContract.contract._id, payload);
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
  },
  beforeDestroy () {
    clearTimeout(this.timeout);
  },
};
</script>

<style lang="stylus" scoped>
  @import '~variables';

  .missingBasicInfo
    color: red
    background: white
    padding: 10px
    margin-left: auto
    margin-right: auto

</style>
