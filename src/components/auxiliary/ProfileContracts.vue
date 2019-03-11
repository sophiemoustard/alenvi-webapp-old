<template>
  <div>
    <div class="row">
      <ni-contracts v-if="contracts" :contracts="contracts" :user="getUser" @openVersionCreation="openVersionCreationModal"
        @openEndContract="openEndContractModal" @refresh="refreshContracts" :columns="contractVisibleColumns" display-actions display-uploader />
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
            <span>
              <q-icon name="clear" @click.native="newContractModal = false" /></span>
          </div>
        </div>
        <ni-modal-select caption="Statut" :error="$v.newContract.status.$error" :options="statusOptions" v-model="newContract.status"
          @blur="$v.newContract.status.$touch" separator required-field @input="resetContract" />
        <ni-modal-select v-if="newContract.status === CUSTOMER_CONTRACT" caption="Bénéficiaire" :error="$v.newContract.customer.$error"
          :options="customerOptions" v-model="newContract.customer" @blur="$v.newContract.customer.$touch" separator
          required-field />
        <ni-modal-input v-if="newContract.status === COMPANY_CONTRACT" caption="Volume horaire hebdomadaire" :error="$v.newContract.weeklyHours.$error"
          type="number" v-model="newContract.weeklyHours" @blur="$v.newContract.weeklyHours.$touch" suffix="hr"
          required-field />
        <ni-modal-input caption="Taux horaire" :error="$v.newContract.grossHourlyRate.$error" type="number" v-model="newContract.grossHourlyRate"
          @blur="$v.newContract.grossHourlyRate.$touch" suffix="€" required-field />
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
            <span>
              <q-icon name="clear" @click.native="newContractVersionModal = false" /></span>
          </div>
        </div>
        <ni-modal-input v-if="contractSelected.status === COMPANY_CONTRACT" caption="Volume horaire hebdomadaire"
          :error="$v.newContractVersion.weeklyHours.$error" v-model="newContractVersion.weeklyHours" type="number"
          @blur="$v.newContractVersion.weeklyHours.$touch" suffix="hr" required-field />
        <ni-modal-input caption="Taux horaire" :error="$v.newContractVersion.grossHourlyRate.$error" v-model="newContractVersion.grossHourlyRate"
          type="number" @blur="$v.newContractVersion.grossHourlyRate.$touch" suffix="€" required-field />
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
            <span>
              <q-icon name="clear" @click.native="endContractModal = false" /></span>
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
import { required, requiredIf } from 'vuelidate/lib/validators';
import NiModalSelect from '../form/ModalSelect';
import NiModalInput from '../form/ModalInput';
import NiDatetimePicker from '../form/DatetimePicker';
import NiContracts from '../contracts/Contracts';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '../popup/notify';
import { END_CONTRACT_REASONS, OTHER, CONTRACT_STATUS_OPTIONS, CUSTOMER_CONTRACT, COMPANY_CONTRACT } from '../../data/constants';
import { contractMixin } from '../../mixins/contractMixin.js';

export default {
  name: 'ProfileContracts',
  mixins: [contractMixin],
  components: {
    NiModalSelect,
    NiModalInput,
    NiDatetimePicker,
    NiContracts
  },
  data () {
    return {
      loading: false,
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
      customers: [],
      contractVisibleColumns: ['weeklyHours', 'startDate', 'endDate', 'grossHourlyRate', 'contractEmpty', 'contractSigned', 'isActive'],
    }
  },
  validations () {
    return {
      newContract: {
        status: { required },
        customer: { required: requiredIf((item) => {
          return item.status === CUSTOMER_CONTRACT;
        }) },
        weeklyHours: { required: requiredIf((item) => {
          return item.status === COMPANY_CONTRACT;
        }) },
        startDate: { required },
        grossHourlyRate: { required },
      },
      newContractVersion: {
        weeklyHours: this.contractSelected.status === CUSTOMER_CONTRACT ? {} : { required },
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
    }
  },
  computed: {
    getUser () {
      return this.$store.getters['rh/getUserProfile'];
    },
    hasBasicInfo () {
      if (this.getUser.identity && this.getUser.identity.lastname && this.getUser.identity.birthDate && this.getUser.identity.nationality &&
        this.getUser.contact && this.getUser.contact.address && this.getUser.contact.address.street && this.getUser.contact.address.city) {
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
    },
    customerOptions () {
      return this.customers.map(cus => ({
        label: `${cus.identity.title} ${cus.identity.lastname}`,
        value: cus._id
      }));
    },
  },
  async mounted () {
    await this.refreshContracts();
    await this.getCustomersWithCustomerContractSubscriptions();
  },
  methods: {
    getMinimalStartDate (contract) {
      const activeVersion = this.getActiveVersion(contract);
      return activeVersion ? this.$moment(activeVersion.startDate).toISOString() : '';
    },
    async getCustomersWithCustomerContractSubscriptions () {
      try {
        this.customers = await this.$customers.showAllWithCustomerContractSubscriptions();
      } catch (e) {
        this.customerOptions = [];
        console.error(e);
      }
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
        this.$v.newContract.$touch();
        if (this.$v.newContract.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = {
          startDate: this.newContract.startDate,
          status: this.newContract.status,
          user: this.newContract.user,
          versions: [{
            startDate: this.newContract.startDate,
            grossHourlyRate: this.newContract.grossHourlyRate,
          }],
        };
        if (payload.status === CUSTOMER_CONTRACT) payload.customer = this.newContract.customer;
        else payload.versions[0].weeklyHours = this.newContract.weeklyHours;

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
      this.newContractVersion.grossHourlyRate = this.getUser.company.rhConfig[this.$_.camelCase(contract.status)].grossHourlyRate;
      this.newContractVersion.contractId = contract._id;
      this.contractSelected = contract;
      this.newContractVersionModal = true;
    },
    resetVersionCreationModal () {
      this.newContractVersionModal = false;
      this.newContractVersion = {};
      this.newContractVersion.grossHourlyRate = '';
      this.$v.newContractVersion.$reset();
    },
    async createVersion () {
      try {
        this.$v.newContractVersion.$touch();
        if (this.$v.newContractVersion.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const contractId = this.newContractVersion.contractId;
        delete this.newContractVersion.contractId;
        await this.$contracts.createVersion(contractId, this.$_.pickBy(this.newContractVersion));
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
  }
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
