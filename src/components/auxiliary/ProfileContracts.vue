<template>
  <div>
    <div class="row">
      <q-card v-if="contracts" v-for="(contract, index) in sortedContracts" :key="index" class="contract-card">
        <q-card-title :style="{ color: cardTitle(contract.endDate).color }">
          {{ cardTitle(contract.endDate).msg }}
        </q-card-title>
        <q-card-main>
          <p>Statut: {{ contract.status }}</p>
          <q-table
            :data="contract.versions"
            :columns="columns"
            row-key="name"
            :pagination.sync="pagination"
            hide-bottom
            :visible-columns="visibleColumns"
            binary-state-sort>
            <q-td slot="body-cell-contractEmpty" slot-scope="props" :props="props">
              <q-btn flat round small color="primary" @click="dlTemplate(props.row, props.row.__index, contract.startDate)">
                <q-icon name="file download" />
              </q-btn>
            </q-td>
            <q-td slot="body-cell-contractSigned" slot-scope="props" :props="props">
              <div v-if="!props.row.link" class="row justify-center">
                <q-uploader :ref="`signedContract_${props.row._id}`" name="signedContract" :url="docsUploadUrl" :headers="headers"
                  :additional-fields="[
                    { name: 'fileName', value: `contrat_signe_${getUser.firstname}_${getUser.lastname}` },
                    { name: 'contractId', value: contract._id },
                    { name: 'versionId', value: props.row._id }
                  ]"
                  hide-underline extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf"
                  hide-upload-button @add="uploadDocument($event, `signedContract_${props.row._id}`)" @uploaded="refreshContracts" @fail="failMsg" />
              </div>
              <q-btn v-else flat round small color="primary">
                <a :href="props.row.link" download>
                  <q-icon name="file download" />
                </a>
              </q-btn>
            </q-td>
            <q-td slot="body-cell-isActive" slot-scope="props" :props="props">
              <q-checkbox :disable="props.value || $moment().isAfter(props.row.endDate)" :value="props.value"
                @input="updateContractActivity({
                  contractId: contract._id,
                  versionId: props.row._id,
                  ogustContractId: props.row.ogustContractId,
                  versionStartDate: props.row.startDate,
                  isActive: !props.value,
                  cell: props.row.__index,
                  contractIndex: index })">
              </q-checkbox>
            </q-td>
          </q-table>
        </q-card-main>
        <q-card-actions align="end">
          <q-btn v-if="getActiveVersion(contract)" flat no-caps color="primary" icon="add" label="Ajouter un avenant" @click="fillVersion(contract)"/>
          <q-btn v-if="getActiveVersion(contract)" flat no-caps color="grey-6" icon="clear" label="Mettre fin au contrat" @click="fillEndContract(contract)" />
        </q-card-actions>
      </q-card>
      <q-btn :disable="!hasBasicInfo" class="fixed fab-add-person" no-caps rounded color="primary" icon="add" label="Créer un nouveau contrat" @click="newContractModal = true" />
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
    <q-modal v-model="newContractModal" :content-css="modalCssContainer">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Créer un <span class="text-weight-bold">nouveau contrat</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span><q-icon name="clear" size="1rem" @click.native="newContractModal = false" /></span>
          </div>
        </div>
        <ni-modal-select caption="Statut" :error="$v.newContract.status.$error" :options="statusOptions" v-model="newContract.status"
          @blur="$v.newContract.status.$touch" separator
        />
        <ni-modal-input caption="Volume horaire hebdomadaire" :error="$v.newContract.weeklyHours.$error" type="number" v-model="newContract.weeklyHours"
          @blur="$v.newContract.weeklyHours.$touch" suffix="hr"
        />
        <ni-modal-input caption="Taux horaire" :error="$v.newContract.grossHourlyRate.$error" type="number" v-model="newContract.grossHourlyRate"
          @blur="$v.newContract.grossHourlyRate.$touch" suffix="€"
        />
        <ni-modal-datetime-picker caption="Date d'effet" :error="$v.newContract.startDate.$error" v-model="newContract.startDate" />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Créer le contrat" icon-right="add" color="primary" :loading="loading" @click="createNewContract" />
    </q-modal>

    <!-- New version modal -->
    <q-modal v-model="newContractVersionModal" :content-css="modalCssContainer">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Créer une <span class="text-weight-bold">version</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span><q-icon name="clear" size="1rem" @click.native="newContractVersionModal = false" /></span>
          </div>
        </div>
        <ni-modal-input caption="Volume horaire hebdomadaire"  :error="$v.newContractVersion.weeklyHours.$error" v-model="newContractVersion.weeklyHours"
          type="number" @blur="$v.newContractVersion.weeklyHours.$touch" suffix="hr"
        />
        <ni-modal-input caption="Taux horaire"  :error="$v.newContractVersion.grossHourlyRate.$error" v-model="newContractVersion.grossHourlyRate"
          type="number" @blur="$v.newContractVersion.grossHourlyRate.$touch" suffix="€"
        />
        <ni-modal-datetime-picker caption="Date d'effet" :error="$v.newContractVersion.startDate.$error" v-model="newContractVersion.startDate"
          :min="getMinimalStartDate(contractSelected)"
        />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Créer l'avenant" icon-right="add" color="primary" :loading="loading" @click="createNewContractVersion" />
    </q-modal>

    <!-- End contract modal -->
    <q-modal v-model="endContractModal" :content-css="modalCssContainer">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Terminer un <span class="text-weight-bold">contrat</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span><q-icon name="clear" size="1rem" @click.native="endContractModal = false" /></span>
          </div>
        </div>
        <ni-modal-datetime-picker caption="Date de fin de contrat" v-model="endContractData.date" />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Mettre fin au contrat" icon-right="clear" color="primary" :loading="loading" @click="endContract" />
    </q-modal>
  </div>
</template>

<script>
import { Cookies } from 'quasar';
import { required } from 'vuelidate/lib/validators';
import ModalSelect from '../form/ModalSelect.vue';
import ModalInput from '../form/ModalInput.vue';
import ModalDatetimePicker from '../form/ModalDatetimePicker.vue';
import { NotifyPositive, NotifyNegative } from '../popup/notify';
import { downloadDocxFile } from '../../helpers/downloadFile';

export default {
  components: {
    'ni-modal-select': ModalSelect,
    'ni-modal-input': ModalInput,
    'ni-modal-datetime-picker': ModalDatetimePicker,
  },
  data () {
    return {
      loading: false,
      pagination: { rowsPerPage: 0 },
      newContractModal: false,
      newContractVersionModal: false,
      endContractModal: false,
      endContractData: {
        date: '',
        contract: {},
      },
      contracts: [],
      contractSelected: {},
      newContract: {
        status: '',
        weeklyHours: '',
        startDate: '',
        grossHourlyRate: ''
      },
      newContractVersion: {
        weeklyHours: '',
        startDate: '',
        grossHourlyRate: ''
      },
      statusOptions: [
        {
          label: 'Prestataire',
          value: 'Prestataire'
        },
      ],
      visibleColumns: ['weeklyHours', 'startDate', 'endDate', 'grossHourlyRate', 'contractEmpty', 'contractSigned', 'isActive'],
      columns: [
        {
          name: 'weeklyHours',
          label: 'Volume horaire hebdomadaire',
          align: 'left',
          field: 'weeklyHours',
          sortable: true
        },
        {
          name: 'startDate',
          label: 'Date d\'effet',
          align: 'left',
          field: 'startDate',
          format: (value) => this.$moment(value).format('DD/MM/YYYY'),
          sortable: true,
        },
        {
          name: 'endDate',
          label: 'Date de fin',
          align: 'left',
          field: 'endDate',
          format: (value) => value ? this.$moment(value).format('DD/MM/YYYY') : '∞',
          sortable: true
        },
        {
          name: 'grossHourlyRate',
          label: 'Taux horaire',
          align: 'left',
          field: 'grossHourlyRate',
          sortable: true,
        },
        {
          name: 'contractEmpty',
          label: 'Contrat',
          align: 'center',
          field: 'contractEmpty',
          sortable: false
        },
        {
          name: 'contractSigned',
          label: 'Contrat signé',
          align: 'center',
          field: 'contractSigned',
          sortable: false
        },
        {
          name: 'isActive',
          label: 'Actif',
          align: 'left',
          field: 'isActive',
          sortable: false
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
      modalCssContainer: {
        minWidth: '30vw'
      },
    }
  },
  validations: {
    newContract: {
      status: { required },
      weeklyHours: { required },
      startDate: { required },
      grossHourlyRate: { required }
    },
    newContractVersion: {
      weeklyHours: { required },
      startDate: { required },
      grossHourlyRate: { required }
    }
  },
  computed: {
    getUser () {
      return this.$store.getters['rh/getUserProfile'];
    },
    docsUploadUrl () {
      return `${process.env.API_HOSTNAME}/users/${this.getUser._id}/gdrive/${this.getUser.administrative.driveFolder.id}/upload`;
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
      if (this.getUser.administrative && this.getUser.administrative.identity &&
      this.getUser.lastname &&
      this.getUser.administrative.identity.birthDate && this.getUser.administrative.identity.nationality &&
      this.getUser.administrative.contact.address && this.getUser.administrative.contact.zipCode &&
      this.getUser.administrative.contact.city) {
        return true;
      }
      return false;
    }
  },
  async mounted () {
    const contracts = await this.$users.getContracts(this.getUser._id);
    this.contracts = contracts;
    this.newContract.grossHourlyRate = this.getUser.company.rhConfig.providerContracts.grossHourlyRate;
  },
  methods: {
    getActiveVersion (contract) {
      return contract.versions ? contract.versions.find(version => version.isActive) : null;
    },
    getLastVersion (contract) {
      return this.$_.orderBy(contract.versions, ['startDate'], ['desc'])[0];
    },
    getMinimalStartDate (contract) {
      const activeVersion = this.getActiveVersion(contract);
      return activeVersion && this.$moment(activeVersion.startDate).add(1, 'd').format();
    },
    cardTitle (contractEndDate) {
      if (this.$moment().isBefore(contractEndDate)) {
        return {
          msg: `Le contrat se termine le ${this.$moment(contractEndDate).format('DD MMMM YYYY')}`,
          color: 'orange'
        }
      } else if (this.$moment().isAfter(contractEndDate)) {
        return {
          msg: `Contrat terminé le: ${this.$moment(contractEndDate).format('DD MMMM YYYY')}`,
          color: 'red'
        }
      } else {
        return {
          msg: 'Contrat actif',
          color: 'green'
        }
      }
    },
    failMsg () {
      NotifyNegative('Echec de l\'envoi du document');
    },
    async refreshContracts () {
      try {
        const contracts = await this.$users.getContracts(this.getUser._id);
        this.contracts = contracts;
      } catch (e) {
        console.error(e);
      }
    },
    async dlTemplate (contract, index, contractStartDate) {
      try {
        const monthlyHours = Number.parseFloat(contract.weeklyHours * 4.33).toFixed(1);
        const data = {
          'title': this.getUser.administrative.identity.title,
          'firstname': this.getUser.firstname,
          'lastname': this.getUser.lastname,
          'address': this.getUser.administrative.contact.address,
          'city': this.getUser.administrative.contact.city,
          'zipCode': this.getUser.administrative.contact.zipCode,
          'birthDate': this.$moment(this.getUser.administrative.identity.birthDate).format('DD/MM/YYYY'),
          'birthCountry': this.getUser.administrative.identity.birthCountry,
          'birthState': this.getUser.administrative.identity.birthState,
          'nationality': this.getUser.administrative.identity.nationality,
          'SSN': this.getUser.administrative.identity.socialSecurityNumber,
          'grossHourlyRate': contract.grossHourlyRate,
          'monthlyHours': monthlyHours,
          'salary': monthlyHours * contract.grossHourlyRate,
          'startDate': this.$moment(contract.startDate).format('DD/MM/YYYY'),
          'weeklyHours': contract.weeklyHours,
          'yearlyHours': monthlyHours * 52,
          'uploadDate': this.$moment(Date.now()).format('DD/MM/YYYY'),
          'initialContractStartDate': this.$moment(contractStartDate).format('DD/MM/YYYY'),
        };
        const params = {
          driveId: index === 0 ? this.getUser.company.rhConfig.templates.contract.driveId : this.getUser.company.rhConfig.templates.amendment.driveId,
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
    fillVersion (contract) {
      this.newContractVersion.grossHourlyRate = this.getUser.company.rhConfig.providerContracts.grossHourlyRate;
      this.newContractVersion.mainContractId = contract._id;
      this.newContractVersion.versions = contract.versions;
      this.contractSelected = contract;
      this.newContractVersionModal = true;
    },
    async updateEndDateOfPreviousVersion (data) {
      const lastActiveVersion = this.getActiveVersion(this.contracts[data.contractIndex]);
      const lastVersion = this.getLastVersion(this.contracts[data.contractIndex]);

      if (lastActiveVersion) {
        const queries = {
          userId: this.getUser._id,
          contractId: data.contractId,
          versionId: lastActiveVersion._id
        };
        const payload = {
          endDate: this.$moment(lastVersion.startDate).subtract(1, 'day').toDate()
        };
        await this.$users.updateContractVersion(queries, payload);
      }
    },
    async updatePreviousVersions (data) {
      for (let i = 0, l = this.contracts[data.contractIndex].versions.length; i < l; i++) {
        const contract = this.contracts[data.contractIndex];
        const currentVersion = contract.versions[i];
        if (currentVersion.isActive && currentVersion._id !== data.versionId) {
          let payload = { status: 'T', end_date: this.$moment(data.versionStartDate).subtract(1, 'day').format('YYYYMMDD') };
          await this.$ogust.updateContract(currentVersion.ogustContractId, payload);
          const queries = {
            userId: this.getUser._id,
            contractId: contract._id,
            versionId: currentVersion._id,
          };
          await this.$users.updateContractVersion(queries, { 'isActive': false });
          currentVersion.isActive = false;
        }
      }
    },
    async updateContractActivity (data) {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Es-tu sûr(e) de vouloir activer ce contrat ?',
          ok: true,
          cancel: 'Annuler'
        });
        await this.updateEndDateOfPreviousVersion(data);
        await this.$ogust.updateContract(data.ogustContractId, { status: 'V' });
        const queries = {
          userId: this.getUser._id,
          contractId: data.contractId,
          versionId: data.versionId,
        };
        await this.$users.updateContractVersion(queries, { 'isActive': data.isActive });
        // Update manually checkbox because it's not dynamic
        this.sortedContracts[data.contractIndex].versions[data.cell].isActive = data.isActive;
        this.updatePreviousVersions(data);
        await this.refreshContracts();
        NotifyPositive('Activité du contrat changée');
      } catch (e) {
        console.error(e);
        if (e.message !== '') {
          NotifyNegative('Erreur lors du changement de l\'activité du contrat');
        }
      }
    },
    async createNewContract () {
      try {
        this.loading = true;
        const payload = {
          id_employee: this.getUser.employee_id.toString(),
          start_date: this.$moment(this.newContract.startDate).format('YYYYMMDD'),
          creation_date: this.$moment().format('YYYYMMDD'),
          contractual_salary: Number.parseFloat(this.newContract.grossHourlyRate * this.newContract.weeklyHours * 4.33).toFixed(2),
          contract_hours: Number.parseFloat(this.newContract.weeklyHours * 4.33).toFixed(1),
          type_employer: 'S'
        };
        const newOgustContract = await this.$ogust.newContract(payload);
        this.newContract.ogustContractId = newOgustContract.id_contract;
        await this.$users.createContract({ userId: this.getUser._id }, this.newContract);
        await this.refreshContracts();
        NotifyPositive('Contrat créé');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création du contrat');
      } finally {
        this.loading = false;
        this.newContractModal = false;
        this.newContract = {};
        this.newContract.grossHourlyRate = this.getUser.company.rhConfig.providerContracts.grossHourlyRate;
        this.$v.newContract.$reset();
      }
    },
    async createNewContractVersion () {
      try {
        this.loading = true;
        const mainContractId = this.newContractVersion.mainContractId;
        const lastActiveVersion = this.getActiveVersion(this.newContractVersion);
        delete this.newContractVersion.mainContractId;
        delete this.newContractVersion.versions;
        let payload = {
          id_employee: this.getUser.employee_id.toString(),
          start_date: this.$moment(this.newContractVersion.startDate).format('YYYYMMDD'),
          creation_date: this.$moment().format('YYYYMMDD'),
          contractual_salary: Number.parseFloat(this.newContractVersion.grossHourlyRate * this.newContractVersion.weeklyHours * 4.33).toFixed(2),
          contract_hours: Number.parseFloat(this.newContractVersion.weeklyHours * 4.33).toFixed(1),
          source_contract: lastActiveVersion.ogustContractId
        };
        const newOgustContract = await this.$ogust.newContract(payload);
        this.newContractVersion.ogustContractId = newOgustContract.id_contract;
        const queries = {
          userId: this.getUser._id,
          mainContractId
        };
        await this.$users.createContractVersion(queries, this.newContractVersion);
        await this.refreshContracts();
        NotifyPositive('Version créée');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création de la version du contrat');
      } finally {
        this.loading = false;
        this.newContractVersionModal = false;
        this.newContractVersion = {};
        this.newContractVersion.grossHourlyRate = this.getUser.company.rhConfig.providerContracts.grossHourlyRate;
        this.$v.newContractVersion.$reset();
      }
    },
    async fillEndContract (contract) {
      this.endContractData.contract = contract;
      this.endContractModal = true
    },
    async endContract () {
      try {
        this.loading = true;
        const ogustVersionId = this.endContractData.contract.versions.find(version => version.isActive).ogustContractId;
        const payload = {
          status: 'T',
          end_date: this.$moment(this.endContractData.date).format('YYYYMMDD')
        };
        await this.$ogust.endContract(ogustVersionId, payload);
        const queries = {
          userId: this.getUser._id,
          contractId: this.endContractData.contract._id,
        };
        await this.$users.endContract(queries, { endDate: this.endContractData.date });
        await this.refreshContracts();
        NotifyPositive('Contrat terminé');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la mise à jour du contrat');
      } finally {
        this.loading = false;
        this.endContractModal = false;
        this.endContractData = {};
      }
    }
  }
};
</script>

<style lang="stylus" scoped>
  @import '~variables';
  .contract-card
    background: white
    width: 100%
    margin-bottom: 20px

  .modal
    &-padding
      padding: 24px 58px 0px 58px
    &-btn
      border-radius: 0

  .margin-input
    margin-bottom: 6px
    &.last
      margin-bottom: 24px

  .q-field-bottom
    padding-top: 2px

  .q-if-inverted
    border: 1px solid $light-grey

  .bg-negative
    background: none !important
    color: inherit !important

  .q-table-container
    box-shadow: none

  .fab-add-person
    right: 60px
    bottom: 18px
    font-size: 16px
    z-index: 2

  a
    color: $primary
    text-decoration: none

  /deep/ .q-uploader .q-if-inner
    display: none

  /deep/ .q-uploader input
    cursor: pointer !important

  /deep/ .q-uploader-pick-button
    color: $primary
    font-size: 1.5rem
    cursor: pointer !important

  .missingBasicInfo
    color: red
    background: white
    padding: 10px
    margin-left: auto
    margin-right: auto

</style>
