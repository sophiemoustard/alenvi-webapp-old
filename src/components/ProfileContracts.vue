<template>
  <div>
    <div class="row">
      <q-card v-if="contracts" v-for="(contract, index) in getRawContracts" :key="index" class="contract-card">
        <!-- <q-card-title class="text-center">
          {{contract.startDate}}
        </q-card-title> -->
        <q-card-main>
          <p>Statut: {{ contract.status }}</p>
          <q-table
            :data="getContractsTable(contract._id)"
            :columns="columns"
            row-key="name"
            hide-bottom>
            <q-td slot="body-cell-contractEmpty" slot-scope="props" :props="props">
              <!-- <q-btn small color="secondary">{{ props.value }}</q-btn> -->
              <q-btn flat round small color="primary" @click="dlTemplate()">
                <q-icon name="file download" />
              </q-btn>
            </q-td>
            <q-td slot="body-cell-contractSigned" slot-scope="props" :props="props">
              <q-uploader v-if="!props.row.link" :ref="`signedContract_${props.row._id}`" name="signedContract" :url="docsUploadUrl" :headers="headers"
                :additional-fields="[
                  { name: 'fileName', value: `contrat_signe_${getUser.firstname}_${getUser.lastname}` },
                  { name: 'contractId', value: props.row._id }
                ]"
                hide-underline extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf" color="white" inverted-light
                hide-upload-button @add="uploadDocument($event, `signedContract_${props.row._id}`)" @uploaded="refreshUser" @fail="failMsg" />
              <!-- <q-btn small color="secondary">{{ props.value }}</q-btn> -->
              <q-btn v-else flat round small color="primary">
                <a :href="contract.link" download>
                  <q-icon name="file download" />
                </a>
              </q-btn>
            </q-td>
            <q-td slot="body-cell-isActive" slot-scope="props" :props="props">
              <q-checkbox :readonly="props.value" :value="props.value" @input="updateContract({ contractId: props.row._id, isActive: props.value, cell: props.row.__index })"></q-checkbox> <!-- @input="updateContract({ contractId: props.row._id, isActive: props.value })" -->
            </q-td>
          </q-table>
        </q-card-main>
        <q-card-actions align="around">
          <!-- <q-btn flat round small color="primary">
            <a :href="contract.grossHourlyRate" download>
              <q-icon name="file download" />
            </a>
          </q-btn> -->
          <q-btn no-caps rounded color="primary" icon="add" label="Mettre fin au contrat" @click="opened = true" />
        </q-card-actions>
      </q-card>
      <q-btn class="fixed fab-add-person" no-caps rounded color="primary" icon="add" label="Créer un nouveau contrat" @click="opened = true" />
    </div>
    <q-modal v-model="opened" :content-css="modalCssContainer">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-8">
            <h5>Créer un <span class="text-weight-bold">nouveau contrat</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span><q-icon name="clear" size="1rem" @click.native="opened = false" /></span>
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
              <q-input v-model="newContract.weeklyHours" color="white" inverted-light @blur="$v.newContract.weeklyHours.$touch" />
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
              <q-input v-model="newContract.grossHourlyRate" color="white" inverted-light @blur="$v.newContract.grossHourlyRate.$touch" />
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

        <!-- <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Nom</p>
              <q-icon v-if="$v.newUser.lastname.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.newUser.lastname.$error" error-label="Champ requis">
              <q-input v-model="newUser.lastname" color="white" inverted-light @blur="$v.newUser.lastname.$touch" />
            </q-field>
          </div>
        </div> -->
        <div class="row margin-input last">
          <div class="col-12">
            <q-checkbox v-model="newContract.isActive" label="Contract actif" />
          </div>
        </div>
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Créer le contrat" icon-right="add" color="primary" :loading="loading" @click="submit" />
    </q-modal>
  </div>
</template>

<script>
import { Cookies } from 'quasar';
// import * as JSZip from 'jszip';
import * as JSZipUtils from 'jszip-utils';
// import * as Docxtemplater from 'docxtemplater';
// import saveAs from 'file-saver';
import { required } from 'vuelidate/lib/validators';
import { alenviAxios } from '../api/ressources/alenviAxios'

export default {
  data () {
    return {
      loading: false,
      opened: false,
      contracts: [],
      newContract: {
        status: '',
        weeklyHours: '',
        startDate: '',
        grossHourlyRate: '',
        isActive: false
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
    getRawContracts () {
      return this.contracts.filter((contract) => contract.contractType === 'contract');
    }
  },
  async mounted () {
    const user = await this.$users.getById(this.getUser._id);
    this.contracts = user.administrative.contracts;
    console.log('contracts =', this.contracts);
    // console.log(user);
    // this.contracts = this.getUser.administrative.contracts;
  },
  methods: {
    async getBlob (url) {
      return new Promise((resolve, reject) => {
        JSZipUtils.getBinaryContent(url, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    },
    getContractsTable (idContract) {
      return this.contracts.filter((contract) => contract.parentContractId === idContract || contract._id === idContract);
    },
    async dlTemplate () {
      try {
        const file = await alenviAxios({
          url: `${process.env.API_HOSTNAME}/gdrive/1odgQLlx6VVW8BLi3w01_aidhG4d8y2Cv/generatedocx`,
          method: 'POST',
          responseType: 'blob',
          data: {
            firstname: 'JC',
            lastname: 'LeBorgne',
            age: '30'
          }
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
        this.$q.notify({
          color: 'positive',
          icon: 'done',
          detail: 'Document envoyé',
          position: 'bottom-left',
          timeout: 2500
        });
      } catch (e) {
        console.error(e);
      }
    },
    async updateContract (data) {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Es-tu sûr(e) de vouloir activer ce document ?',
          ok: true,
          cancel: 'Annuler'
        });
        await alenviAxios.put(`${process.env.API_HOSTNAME}/users/${this.getUser._id}/contracts/${data.contractId}`, { 'isActive': !data.isActive });
        // Update manually checkbox because it's not dynamic
        this.contracts[data.cell].isActive = !data.isActive;
        const length = this.contracts.length;
        for (let i = 0; i < length; i++) {
          if (this.contracts[i].isActive && this.contracts[i]._id !== data.contractId) {
            await alenviAxios.put(`${process.env.API_HOSTNAME}/users/${this.getUser._id}/contracts/${this.contracts[i]._id}`, { 'isActive': false });
            this.contracts[i].isActive = false;
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
            detail: 'Suppression annulée',
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
    async submit () {
      try {
        this.loading = true;
        await this.dlTemplate();
        this.$q.notify({
          color: 'positive',
          icon: 'done',
          detail: 'Contrat créée',
          position: 'bottom-left',
          timeout: 2500
        });
        this.loading = false;
        this.opened = false;
      } catch (e) {
        console.error(e);
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de la création du contrat',
          position: 'bottom-left',
          timeout: 2500
        });
        this.loading = false;
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

</style>
