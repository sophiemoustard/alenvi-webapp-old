<template>
  <div>
    <div class="row">
      <q-card v-if="contracts" v-for="(contract, index) in sortedContracts" :key="index" class="contract-card">
        <q-card-title :style="{ color: cardTitle(contract.endDate).color }">
          {{ cardTitle(contract.endDate).msg }}
        </q-card-title>
        <q-card-main>
          <p>Statut: {{ contract.status }}</p>
          <q-table class="test"
            :data="contract.versions"
            :columns="columns"
            row-key="name"
            :pagination.sync="pagination"
            hide-bottom
            :visible-columns="visibleColumns"
            binary-state-sort>
            <q-td slot="body-cell-contractEmpty" slot-scope="props" :props="props">
              <!-- <q-btn small color="secondary">{{ props.value }}</q-btn> -->
              <q-btn flat round small color="primary" @click="dlTemplate(props.row)">
                <q-icon name="file download" />
              </q-btn>
            </q-td>
            <q-td slot="body-cell-contractSigned" slot-scope="props" :props="props">
              <q-uploader v-if="!props.row.link" :ref="`signedContract_${props.row._id}`" name="signedContract" :url="docsUploadUrl" :headers="headers"
                :additional-fields="[
                  { name: 'fileName', value: `contrat_signe_${getUser.firstname}_${getUser.lastname}` },
                  { name: 'contractId', value: contract._id },
                  { name: 'versionId', value: props.row._id }
                ]"
                hide-underline extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf" color="white" inverted-light
                hide-upload-button @add="uploadDocument($event, `signedContract_${props.row._id}`)" @uploaded="refreshUser" @fail="failMsg" />
              <!-- <q-btn small color="secondary">{{ props.value }}</q-btn> -->
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
              </q-checkbox> <!-- @input="updateContractActivity({ contractId: props.row._id, isActive: props.value })" -->
            </q-td>
          </q-table>
        </q-card-main>
        <q-card-actions align="end">
          <!-- <q-btn flat round small color="primary">
            <a :href="contract.grossHourlyRate" download>
              <q-icon name="file download" />
            </a>
          </q-btn> -->
          <q-btn v-if="!contract.endDate" flat no-caps color="primary" icon="add" label="Ajouter un avenant" @click="fillVersion(contract)"/>
          <q-btn v-if="!contract.endDate" flat no-caps color="grey-6" icon="clear" label="Mettre fin au contrat" @click="fillEndContract(contract)" />
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
          <div class="col-8">
            <h5>Créer un <span class="text-weight-bold">nouveau contrat</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span><q-icon name="clear" size="1rem" @click.native="newContractModal = false" /></span>
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Statut</p>
              <q-icon v-if="$v.newContract.status.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.newContract.status.$error" error-label="Champ requis">
              <q-select :options="statusOptions" v-model="newContract.status" color="white" inverted-light separator
               @blur="$v.newContract.status.$touch" />
            </q-field>
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Volume horaire hebdomadaire</p>
              <q-icon v-if="$v.newContract.weeklyHours.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.newContract.weeklyHours.$error" error-label="Champ requis">
              <q-input type="number" v-model="newContract.weeklyHours" color="white" suffix="hr" inverted-light @blur="$v.newContract.weeklyHours.$touch" />
            </q-field>
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Taux horaire</p>
              <q-icon v-if="$v.newContract.grossHourlyRate.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.newContract.grossHourlyRate.$error" error-label="Champ requis">
              <q-input type="number" v-model="newContract.grossHourlyRate" color="white" suffix="€" inverted-light @blur="$v.newContract.grossHourlyRate.$touch" />
            </q-field>
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Date d'effet</p>
              <q-icon v-if="$v.newContract.startDate.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.newContract.startDate.$error" error-label="Champ requis">
              <q-datetime type="date" format="DD/MM/YYYY" v-model="newContract.startDate" color="white" inverted-light popover
              ok-label="OK"
              cancel-label="Fermer" />
            </q-field>
          </div>
        </div>
        <!-- <div class="row margin-input last">
          <div class="col-12">
            <q-checkbox v-model="newContract.isActive" label="Contract actif" />
          </div>
        </div> -->
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Créer le contrat" icon-right="add" color="primary" :loading="loading" @click="createNewContract" />
    </q-modal>

    <!-- New version modal -->
    <q-modal v-model="newContractVersionModal" :content-css="modalCssContainer">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-8">
            <h5>Créer une <span class="text-weight-bold">version</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span><q-icon name="clear" size="1rem" @click.native="newContractVersionModal = false" /></span>
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Volume horaire hebdomadaire</p>
              <q-icon v-if="$v.newContractVersion.weeklyHours.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.newContractVersion.weeklyHours.$error" error-label="Champ requis">
              <q-input type="number" v-model="newContractVersion.weeklyHours" color="white" suffix="hr" inverted-light @blur="$v.newContractVersion.weeklyHours.$touch" />
            </q-field>
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Taux horaire</p>
              <q-icon v-if="$v.newContractVersion.grossHourlyRate.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.newContractVersion.grossHourlyRate.$error" error-label="Champ requis">
              <q-input type="number" v-model="newContractVersion.grossHourlyRate" color="white" suffix="€" inverted-light @blur="$v.newContractVersion.grossHourlyRate.$touch" />
            </q-field>
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Date d'effet</p>
              <q-icon v-if="$v.newContractVersion.startDate.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.newContractVersion.startDate.$error" error-label="Champ requis">
              <q-datetime type="date" format="DD/MM/YYYY" v-model="newContractVersion.startDate" color="white" inverted-light popover
              ok-label="OK"
              cancel-label="Fermer" />
            </q-field>
          </div>
        </div>
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Créer l'avenant" icon-right="add" color="primary" :loading="loading" @click="createNewContractVersion" />
    </q-modal>

    <!-- End contract modal -->
    <q-modal v-model="endContractModal" :content-css="modalCssContainer">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-8">
            <h5>Terminer un <span class="text-weight-bold">contrat</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span><q-icon name="clear" size="1rem" @click.native="endContractModal = false" /></span>
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Date de fin de contrat</p>
            </div>
            <q-field>
              <q-datetime type="date" format="DD/MM/YYYY" v-model="endContractData.date" color="white" inverted-light popover
              ok-label="OK"
              cancel-label="Fermer" />
            </q-field>
          </div>
        </div>
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Mettre fin au contrat" icon-right="clear" color="primary" :loading="loading" @click="endContract" />
    </q-modal>

  </div>
</template>

<script>
import { Cookies } from 'quasar';
// import * as JSZip from 'jszip';
// import * as JSZipUtils from 'jszip-utils';
// import * as Docxtemplater from 'docxtemplater';
// import saveAs from 'file-saver';
import { required } from 'vuelidate/lib/validators';
import { alenviAxios } from '../api/ressources/alenviAxios'

export default {
  data () {
    return {
      loading: false,
      pagination: { rowsPerPage: 0 },
      newContractModal: false,
      newContractVersionModal: false,
      endContractModal: false,
      endContractData: {
        date: '',
        contractId: '',
      },
      contracts: [],
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
        // {
        //   label: 'Mandataire',
        //   value: 'mandataire'
        // }
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
          label: 'Contrat vierge',
          align: 'center',
          field: 'contractEmpty',
          sortable: false
        },
        {
          name: 'contractSigned',
          label: 'Contract signé',
          align: 'left',
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
    const user = await this.$users.getById(this.getUser._id);
    this.contracts = user.administrative.contracts;
    this.newContract.grossHourlyRate = this.getUser.company.rhConfig.providerContracts.grossHourlyRate;
    // console.log('contracts', this.contracts);
  },
  methods: {
    // async getBlob (url) {
    //   return new Promise((resolve, reject) => {
    //     JSZipUtils.getBinaryContent(url, (err, data) => {
    //       if (err) {
    //         reject(err);
    //       } else {
    //         resolve(data);
    //       }
    //     });
    //   });
    // },
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
      this.$q.notify({
        color: 'negative',
        icon: 'warning',
        detail: 'Echec de l\'envoi du document',
        position: 'bottom-left',
        timeout: 2500
      });
    },
    async refreshUser () {
      try {
        const user = await this.$users.getById(this.getUser._id);
        this.contracts = user.administrative.contracts;
      } catch (e) {
        console.error(e);
      }
    },
    async dlTemplate (contract) {
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
          'startDate': this.$moment(contract.startDate).format('DD/MM/YYYY')
        };
        console.log(data);
        const file = await alenviAxios({
          url: `${process.env.API_HOSTNAME}/gdrive/${this.getUser.company.rhConfig.templates.contract.driveId}/generatedocx`,
          method: 'POST',
          responseType: 'blob',
          data
        });
        const url = window.URL.createObjectURL(new Blob([file.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'contrat.docx');
        document.body.appendChild(link);
        link.click();
      } catch (e) {
        console.error(e);
      }
    },
    uploadDocument (files, refName) {
      console.log(refName)
      console.log(this.$refs[refName]);
      if (files[0].size > 5000000) {
        this.$refs[refName][0].reset();
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Fichier trop volumineux (> 5 Mo)',
          position: 'bottom-left',
          timeout: 2500
        });
        return '';
      } else {
        this.$refs[refName][0].upload();
      }
    },
    // async uploadDocument () {
    //   try {
    //     let blob = await this.getBlob('https://drive.google.com/file/d/1PR0UJyEV9CJkIQ9zCXD7amhZJIMT0ZtH/view?usp=drivesdk');
    //     let data = new FormData();
    //     data.append('contractId', props.row._id);
    //     data.append('fileName', `contrat_signe_${getUser.firstname}_${getUser.lastname}`);
    //     data.append('Content-Type', blob.type || 'application/octet-stream');
    //     data.append(`signedContract`, blob);
    //     await this.$alenviAxios.post(this.pictureUploadUrl, data, { headers: { 'content-type': 'multipart/form-data', 'x-access-token': Cookies.get('alenvi_token') || '' } });
    //     await this.$store.dispatch('rh/getUserProfile', this.userProfile._id);
    //     this.closePictureEdition();
    //     this.loadingImage = false;
    //     this.$q.notify({
    //       color: 'positive',
    //       icon: 'done',
    //       detail: 'Modification enregistrée',
    //       position: 'bottom-left',
    //       timeout: 2500
    //     });
    //   } catch (e) {
    //     console.error(e);
    //     this.loadingImage = false;
    //     this.$q.notify({
    //       color: 'negative',
    //       icon: 'warning',
    //       detail: 'Erreur lors de la modification',
    //       position: 'bottom-left',
    //       timeout: 2500
    //     });
    //   }
    // },
    fillVersion (data) {
      this.newContractVersion.grossHourlyRate = this.getUser.company.rhConfig.providerContracts.grossHourlyRate;
      this.newContractVersion.mainContractId = data._id;
      this.newContractVersion.versions = data.versions;
      this.newContractVersionModal = true;
    },
    async updateContractActivity (data) {
      try {
        console.log(data);
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Es-tu sûr(e) de vouloir activer ce contrat ?',
          ok: true,
          cancel: 'Annuler'
        });
        await alenviAxios.put(`${process.env.API_HOSTNAME}/ogust/contracts/${data.ogustContractId}`, { status: 'V' });
        await alenviAxios.put(`${process.env.API_HOSTNAME}/users/${this.getUser._id}/contracts/${data.contractId}/versions/${data.versionId}`, { 'isActive': data.isActive });
        // Update manually checkbox because it's not dynamic
        this.sortedContracts[data.contractIndex].versions[data.cell].isActive = data.isActive;
        for (let i = 0, l = this.contracts[data.contractIndex].versions.length; i < l; i++) {
          if (this.contracts[data.contractIndex].versions[i].isActive && this.contracts[data.contractIndex].versions[i]._id !== data.versionId) {
            await alenviAxios.put(`${process.env.API_HOSTNAME}/ogust/contracts/${this.contracts[data.contractIndex].versions[i].ogustContractId}`, { status: 'T' }); // , end_date: this.$moment(data.versionStartDate).subtract(1, 'day').format('YYYYMMDD')
            await alenviAxios.put(`${process.env.API_HOSTNAME}/users/${this.getUser._id}/contracts/${this.contracts[data.contractIndex]._id}/versions/${this.contracts[data.contractIndex].versions[i]._id}`, { 'isActive': false });
            this.contracts[data.contractIndex].versions[i].isActive = false;
          }
        }
        this.$q.notify({
          color: 'positive',
          icon: 'done',
          detail: 'Activité du contrat changée',
          position: 'bottom-left',
          timeout: 2500
        });
      } catch (e) {
        console.error(e);
        if (e.message === '') {
          return this.$q.notify({
            color: 'positive',
            icon: 'done',
            detail: 'Mise à jour annulée',
            position: 'bottom-left',
            timeout: 2500
          });
        }
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors du changement de l\'activité du contrat',
          position: 'bottom-left',
          timeout: 2500
        });
      }
    },
    // async getDocxBlob () {
    //   try {
    //     const test = await this.testDocxBlob('https://drive.google.com/file/d/1qcxsH3D2sek4sA8EQWdCwiTQJq2r9Vwn/view?usp=sharing');
    //     console.log(test);
    //     https:// docxtemplater.com/tag-example.docx
    //     JSZipUtils.getBinaryContent('https://drive.google.com/file/d/1qcxsH3D2sek4sA8EQWdCwiTQJq2r9Vwn/view?usp=sharing', function (error, content) {
    //       if (error) { throw error }
    //       console.log('test');
    //       const zip = new JSZip(content);
    //       const doc = new Docxtemplater().loadZip(zip);
    //       doc.setData({
    //         firstName: 'John',
    //         lastName: 'Doe',
    //         // phone: '0650769406',
    //         description: 'New Website'
    //       });
    //       try {
    //         doc.render();
    //       } catch (e) {
    //         console.error(e);
    //       }
    //       const out = doc.getZip().generate({
    //         type: 'blob',
    //         mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    //       });
    //       console.log(out);
    //       saveAs(out, 'output.docx');
    //     });
    //   } catch (e) {
    //     console.error(e);
    //   }
    // },
    async createNewContract () {
      try {
        this.loading = true;
        const newOgustContract = await alenviAxios({
          url: `${process.env.API_HOSTNAME}/ogust/contracts`,
          method: 'POST',
          data: {
            id_employee: this.getUser.employee_id.toString(),
            start_date: this.$moment(this.newContract.startDate).format('YYYYMMDD'),
            creation_date: this.$moment().format('YYYYMMDD'),
            contractual_salary: Number.parseFloat(this.newContract.grossHourlyRate * this.newContract.weeklyHours * 4.33).toFixed(2),
            contract_hours: Number.parseFloat(this.newContract.weeklyHours * 4.33).toFixed(1)
          }
        });
        this.newContract.ogustContractId = newOgustContract.data.data.employment.id_contract;
        await alenviAxios({
          url: `${process.env.API_HOSTNAME}/users/${this.getUser._id}/contracts`,
          method: 'POST',
          data: this.newContract
        });
        await this.refreshUser();
        this.$q.notify({
          color: 'positive',
          icon: 'done',
          detail: 'Contrat créé',
          position: 'bottom-left',
          timeout: 2500
        });
      } catch (e) {
        console.error(e);
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de la création du contrat',
          position: 'bottom-left',
          timeout: 2500
        });
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
        const lastActiveVersion = this.newContractVersion.versions.find(version => version.isActive);
        delete this.newContractVersion.mainContractId;
        delete this.newContractVersion.versions;
        await alenviAxios({
          url: `${process.env.API_HOSTNAME}/users/${this.getUser._id}/contracts/${mainContractId}/versions/${lastActiveVersion._id}`,
          method: 'PUT',
          data: { endDate: this.$moment(this.newContractVersion.startDate).subtract(1, 'day').toDate() }
        });
        const newOgustContract = await alenviAxios({
          url: `${process.env.API_HOSTNAME}/ogust/contracts`,
          method: 'POST',
          data: {
            id_employee: this.getUser.employee_id.toString(),
            start_date: this.$moment(this.newContractVersion.startDate).format('YYYYMMDD'),
            creation_date: this.$moment().format('YYYYMMDD'),
            contractual_salary: Number.parseFloat(this.newContractVersion.grossHourlyRate * this.newContractVersion.weeklyHours * 4.33).toFixed(2),
            contract_hours: Number.parseFloat(this.newContractVersion.weeklyHours * 4.33).toFixed(1),
            // origine_contract: lastActiveVersion.ogustContractId,
            source_contract: lastActiveVersion.ogustContractId
          }
        });
        this.newContractVersion.ogustContractId = newOgustContract.data.data.employment.id_contract;
        await alenviAxios({
          url: `${process.env.API_HOSTNAME}/users/${this.getUser._id}/contracts/${mainContractId}/versions`,
          method: 'POST',
          data: this.newContractVersion
        });
        await this.refreshUser();
        this.$q.notify({
          color: 'positive',
          icon: 'done',
          detail: 'Version créée',
          position: 'bottom-left',
          timeout: 2500
        });
      } catch (e) {
        console.error(e);
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de la création de la version du contrat',
          position: 'bottom-left',
          timeout: 2500
        });
      } finally {
        this.loading = false;
        this.newContractVersionModal = false;
        this.newContractVersion = {};
        this.newContractVersion.grossHourlyRate = this.getUser.company.rhConfig.providerContracts.grossHourlyRate;
        this.$v.newContractVersion.$reset();
      }
    },
    async fillEndContract (contract) {
      this.endContractData.contractId = contract._id;
      this.endContractModal = true
    },
    async endContract () {
      try {
        this.loading = true;
        await alenviAxios({
          url: `${process.env.API_HOSTNAME}/users/${this.getUser._id}/contracts/${this.endContractData.contractId}`,
          method: 'PUT',
          data: {
            endDate: this.endContractData.date
          }
        });
        await this.refreshUser();
        this.$q.notify({
          color: 'positive',
          icon: 'done',
          detail: 'Contrat terminé',
          position: 'bottom-left',
          timeout: 2500
        });
      } catch (e) {
        console.error(e);
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de la mise à jour du contrat',
          position: 'bottom-left',
          timeout: 2500
        });
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
    cursor: pointer
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

  /deep/ .q-uploader .q-if-control
    margin-left: 0
    color: $primary
    font-size: 1.5rem

  // /deep/ .q-uploader i
  //   cursor: crosshair !important

  // /deep/ .q-table-container ~ /deep/ .bg-white
  //   background: blue !important

  // /deep/ .q-table-container .tr:hover .q-uploader:hover > .q-if.q-if-inverted.q-if-inverted-light.bg-white
  //   background: #F7F7F7 !important

  .missingBasicInfo
    color: red
    background: white
    padding: 10px
    margin-left: auto
    margin-right: auto

</style>
