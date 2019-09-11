<template>
  <div>
    <div class="row">
      <ni-contracts v-if="contracts" :contracts="contracts" :user="getUser" @openEndContract="openEndContractModal"
        @openVersionEdition="openVersionEditionModal" @openVersionCreation="openVersionCreationModal" :personKey="COACH"
        @refresh="refreshContracts" :columns="contractVisibleColumns" display-actions display-uploader
        @refreshWithTimeout="refreshContractsWithTimeout" />
      <q-btn :disable="!hasBasicInfo" class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Créer un nouveau contrat"
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
            <span>
              <q-icon name="clear" @click.native="newContractModal = false" /></span>
          </div>
        </div>
        <ni-select in-modal caption="Statut" :error="$v.newContract.status.$error" :options="statusOptions" v-model="newContract.status"
          @blur="$v.newContract.status.$touch" separator required-field @input="resetContract" />
        <ni-select in-modal v-if="newContract.status === CUSTOMER_CONTRACT" caption="Bénéficiaire" :error="$v.newContract.customer.$error"
          :options="customerOptions" v-model="newContract.customer" @blur="$v.newContract.customer.$touch" separator
          required-field />
        <ni-input in-modal v-if="newContract.status === COMPANY_CONTRACT" caption="Volume horaire hebdomadaire" :error="$v.newContract.weeklyHours.$error"
          type="number" v-model="newContract.weeklyHours" @blur="$v.newContract.weeklyHours.$touch" suffix="hr"
          required-field />
        <ni-input in-modal caption="Taux horaire" :error="$v.newContract.grossHourlyRate.$error" type="number" v-model="newContract.grossHourlyRate"
          @blur="$v.newContract.grossHourlyRate.$touch" suffix="€" required-field />
        <ni-datetime-picker caption="Date d'effet" :error="$v.newContract.startDate.$error" v-model="newContract.startDate"
          in-modal required-field />
        <div class="row margin-input last">
          <div class="col-12">
            <q-checkbox v-model="shouldBeSigned" label="Signature en ligne" />
          </div>
        </div>
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Créer le contrat" icon-right="add" color="primary" :loading="loading"
        @click="createContract" />
    </q-modal>

    <!-- New version modal -->
    <q-modal v-model="newVersionModal" content-classes="modal-container-sm" @hide="resetVersionCreationModal">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Créer une <span class="text-weight-bold">version</span></h5>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span>
              <q-icon name="clear" @click.native="newVersionModal = false" /></span>
          </div>
        </div>
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
            <q-checkbox v-model="shouldBeSigned" label="Signature en ligne" />
          </div>
        </div>
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Créer l'avenant" icon-right="add" color="primary" :loading="loading"
        @click="createVersion" />
    </q-modal>

    <!-- Edition modal -->
    <q-modal v-model="versionEditionModal" content-classes="modal-container-sm" @hide="resetVersionEditionModal">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Modifier le <span class="text-weight-bold">contrat</span></h5>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span><q-icon name="clear" @click.native="versionEditionModal = false" /></span>
          </div>
        </div>
        <ni-input in-modal caption="Volume horaire hebdomadaire"  type="number" suffix="€" required-field
          v-model="editedVersion.weeklyHours" :error="$v.editedVersion.weeklyHours.$error"
          @blur="$v.editedVersion.weeklyHours.$touch" />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Modifier le contrat" icon-right="add" color="primary"
        :loading="loading" @click="editVersion" />
    </q-modal>

    <!-- End contract modal -->
    <q-modal v-model="endContractModal" content-classes="modal-container-sm" @hide="resetEndContractModal">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Terminer un <span class="text-weight-bold">contrat</span></h5>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close" style="text-align: right">
            <span>
              <q-icon name="clear" @click.native="endContractModal = false" /></span>
          </div>
        </div>
        <ni-datetime-picker caption="Date de notification" v-model="endContract.endNotificationDate" in-modal
          required-field @blur="$v.endContract.endNotificationDate.$touch" :error="$v.endContract.endNotificationDate.$error" />
        <ni-datetime-picker caption="Date de fin de contrat" v-model="endContract.endDate" :min="contractMinEndDate"
          in-modal required-field @blur="$v.endContract.endDate.$touch" :error="$v.endContract.endDate.$error" />
        <ni-select in-modal caption="Motif" :options="endContractReasons" v-model="endContract.endReason" required-field
          @blur="$v.endContract.endReason.$touch" :error="$v.endContract.endReason.$error" @input="resetOtherMisc" />
        <ni-input in-modal caption="Autres" v-if="endContract.endReason === OTHER" v-model="endContract.otherMisc"
          required-field @blur="$v.endContract.otherMisc.$touch" :error="$v.endContract.otherMisc.$error" />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Mettre fin au contrat" icon-right="clear" color="primary"
        :loading="loading" @click="endExistingContract" />
    </q-modal>
  </div>
</template>

<script>
import { required, requiredIf } from 'vuelidate/lib/validators';
import NiSelect from '../form/Select';
import NiInput from '../form/Input';
import NiDatetimePicker from '../form/DatetimePicker';
import NiContracts from '../contracts/Contracts';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '../popup/notify';
import { END_CONTRACT_REASONS, OTHER, CONTRACT_STATUS_OPTIONS, CUSTOMER_CONTRACT, COMPANY_CONTRACT, COACH } from '../../data/constants';
import { translate } from '../../data/translate';
import { contractMixin } from '../../mixins/contractMixin.js';
import { generateContractFields } from '../../helpers/generateContractFields.js';
import { formatIdentity } from '../../helpers/utils';

export default {
  name: 'ProfileContracts',
  mixins: [contractMixin],
  components: {
    NiSelect,
    NiInput,
    NiDatetimePicker,
    NiContracts,
  },
  data () {
    return {
      OTHER,
      COACH,
      contracts: [],
      loading: false,
      CUSTOMER_CONTRACT,
      COMPANY_CONTRACT,
      customers: [],
      contractVisibleColumns: ['weeklyHours', 'startDate', 'endDate', 'grossHourlyRate', 'contractEmpty', 'contractSigned', 'actions'],
      // New contract
      shouldBeSigned: true,
      newContractModal: false,
      newContract: {
        status: '',
        customer: '',
        weeklyHours: '',
        startDate: '',
        grossHourlyRate: '',
      },
      // New version
      newVersionModal: false,
      newVersion: {
        weeklyHours: '',
        startDate: '',
        grossHourlyRate: '',
      },
      // Edited version
      versionEditionModal: false,
      editedVersion: {
        contactId: '',
        versionId: '',
        weeklyHours: '',
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
      selectedContract: { versions: [] },
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
        weeklyHours: this.selectedContract.status === CUSTOMER_CONTRACT ? {} : { required },
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
    userFullName () {
      return `${this.getUser.identity.firstname} ${this.getUser.identity.lastname}`;
    },
    esignRedirection () {
      return {
        redirect: `${process.env.COMPANI_HOSTNAME}/docsigned?signed=true`,
        redirectDecline: `${process.env.COMPANI_HOSTNAME}/docsigned?signed=false`,
      }
    },
    newVersionMinStartDate () {
      const lastVersion = this.selectedContract.versions[this.selectedContract.versions.length - 1];
      return lastVersion ? this.$moment(lastVersion.startDate).toISOString() : '';
    },
  },
  async mounted () {
    await this.refreshContracts();
    await this.getCustomersWithCustomerContractSubscriptions();
  },
  methods: {
    async getCustomersWithCustomerContractSubscriptions () {
      try {
        this.customers = await this.$customers.listWithCustomerContractSubscriptions();
      } catch (e) {
        this.customerOptions = [];
        console.error(e);
      }
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
    generateContractSigners (signer) {
      const signers = [{
        id: '1',
        name: this.userFullName,
        email: this.getUser.local.email,
      }];
      signers.push({ id: `${signers.length + 1}`, name: signer.name, email: signer.email });
      return signers;
    },
    // Contract creation
    resetContract (val) {
      this.newContract.customer = '';
      this.newContract.grossHourlyRate = this.getUser.company.rhConfig[this.$_.camelCase(val)].grossHourlyRate;
      this.$v.newContract.customer.$reset();
    },
    openCreationModal () {
      this.newContract.user = this.getUser._id;
      this.newContractModal = true;
    },
    resetContractCreationModal () {
      this.newContractModal = false;
      this.newContract = {};
      this.newContract.grossHourlyRate = '';
      this.$v.newContract.$reset();
    },
    async createContract () {
      try {
        const templates = this.userCompany.rhConfig.templates;
        const contractStatus = this.$_.camelCase(this.newContract.status);
        if (!templates || !templates[contractStatus] || !templates[contractStatus].driveId) return NotifyNegative('Template manquant');

        this.$v.newContract.$touch();
        if (this.$v.newContract.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        let payload = {
          startDate: this.newContract.startDate,
          status: this.newContract.status,
          user: this.newContract.user,
          ...(this.newContract.status === CUSTOMER_CONTRACT && { customer: this.newContract.customer }),
          versions: [{
            startDate: this.newContract.startDate,
            grossHourlyRate: this.newContract.grossHourlyRate,
            ...(this.newContract.status === COMPANY_CONTRACT && { weeklyHours: this.newContract.weeklyHours }),
          }],
        };

        if (this.shouldBeSigned) {
          payload.signature = {
            ...this.esignRedirection,
            templateId: this.userCompany.rhConfig.templates[this.$_.camelCase(this.newContract.status)].driveId,
            meta: { type: this.newContract.status, auxiliaryDriveId: this.getUser.administrative.driveFolder.driveId },
            fields: generateContractFields(this.newContract.status, { user: this.getUser, contract: this.newContract, initialContractStartDate: this.newContract.startDate }),
          };
          if (this.newContract.status === CUSTOMER_CONTRACT) {
            const helpers = await this.$users.showAll({ customers: this.newContract.customer });
            const currentCustomer = helpers[0].customers.find(cus => cus._id === this.newContract.customer);
            payload.signature.signers = this.generateContractSigners({ name: helpers[0].identity.lastname, email: helpers[0].local.email });
            payload.signature.title = `${translate[this.newContract.status]} - ${currentCustomer.identity.lastname}`;
            payload.signature.meta.customerDriveId = currentCustomer.driveFolder.driveId;
          } else {
            payload.signature.signers = this.generateContractSigners({ name: `${this.mainUser.identity.firstname} ${this.mainUser.identity.lastname}`, email: this.mainUser.local.email });
            payload.signature.title = `${translate[this.newContract.status]} - ${this.userFullName}`;
          }
        }

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
    // Version creation
    openVersionCreationModal (contract) {
      this.newVersion.grossHourlyRate = this.getUser.company.rhConfig[this.$_.camelCase(contract.status)].grossHourlyRate;
      this.newVersion.contractId = contract._id;
      this.selectedContract = contract;
      this.shouldBeSigned = this.selectedContract.status === CUSTOMER_CONTRACT;
      this.newVersionModal = true;
    },
    resetVersionCreationModal () {
      this.newVersionModal = false;
      this.newVersion = {};
      this.newVersion.grossHourlyRate = '';
      this.$v.newVersion.$reset();
      this.shouldBeSigned = true;
    },
    async createVersion () {
      try {
        const templates = this.userCompany.rhConfig.templates;
        const versionStatus = `${this.$_.camelCase(this.selectedContract.status)}Version`;
        if (!templates || !templates[versionStatus] || !templates[versionStatus].driveId) return NotifyNegative('Template manquant');

        this.$v.newVersion.$touch();
        if (this.$v.newVersion.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const contractId = this.newVersion.contractId;
        delete this.newVersion.contractId;
        const payload = this.newVersion;
        if (this.shouldBeSigned) {
          const VersionMix = { ...this.selectedContract, ...this.newVersion };
          payload.signature = {
            ...this.esignRedirection,
            templateId: this.userCompany.rhConfig.templates[`${this.$_.camelCase(VersionMix.status)}Version`].driveId,
            meta: { type: VersionMix.status, auxiliaryDriveId: this.getUser.administrative.driveFolder.driveId },
            fields: generateContractFields(VersionMix.status, { user: this.getUser, contract: VersionMix, initialContractStartDate: this.selectedContract.startDate }),
          };
          if (VersionMix.status === CUSTOMER_CONTRACT) {
            const helpers = await this.$users.showAll({ customers: VersionMix.customer._id });
            payload.signature.signers = this.generateContractSigners({ name: helpers[0].identity.lastname, email: helpers[0].local.email });
            payload.signature.title = `Avenant au ${translate[VersionMix.status]} - ${VersionMix.customer.identity.lastname}`;
            payload.signature.meta.customerDriveId = VersionMix.customer.driveFolder.driveId;
          } else {
            payload.signature.signers = this.generateContractSigners({ name: `${this.mainUser.identity.firstname} ${this.mainUser.identity.lastname}`, email: this.mainUser.local.email });
            payload.signature.title = `Avenant au ${translate[VersionMix.status]} - ${this.userFullName}`;
          }
        }

        await this.$contracts.createVersion(contractId, this.$_.pickBy(payload));
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
    // Contract edition
    openVersionEditionModal ({ contract, versionId }) {
      this.editedVersion.contractId = contract._id;
      this.editedVersion.versionId = versionId;
      this.selectedContract = contract;
      this.versionEditionModal = true;
    },
    resetVersionEditionModal () {
      this.versionEditionModal = false;
      this.editedVersion = {};
      this.$v.editedVersion.$reset();
    },
    editVersion () {},
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
