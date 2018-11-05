<template>
  <div>
    <div class="row">
      <q-card v-if="contracts" v-for="(contract, index) in contracts" :key="index" style="cursor: pointer; background: white">
        <!-- <q-card-title class="text-center">
          {{contract.startDate}}
        </q-card-title> -->
        <q-card-main>
          <p>Statut: {{ contract.status }}</p>
          <q-table
            :data="contracts"
            :columns="columns"
            row-key="name"
            hide-bottom>
            <q-td slot="body-cell-contractEmpty" slot-scope="props" :props="props">
              <q-btn small color="secondary">{{ props.value }}</q-btn>
            </q-td>
            <q-td slot="body-cell-contractSigned" slot-scope="props" :props="props">
              <q-uploader :ref="`signedContract_${props.row._id}`" name="signedContract" :url="docsUploadUrl" :headers="headers" :additional-fields="[{ name: 'fileName', value: `contrat_signe_${getUser.firstname}_${getUser.lastname}` }]"
                hide-underline extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf" color="white" inverted-light
                hide-upload-button @add="uploadDocument($event, `signedContract_${props.row._id}`)" @uploaded="refreshUser" @fail="failMsg" />
              <q-btn small color="secondary">{{ props.value }}</q-btn>
            </q-td>
          </q-table>
        </q-card-main>
        <!-- <q-card-actions align="around">
          <q-btn flat round small color="primary">
            <a :href="contract.grossHourlyRate" download>
              <q-icon name="file download" />
            </a>
          </q-btn>
        </q-card-actions> -->
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
      // contracts: [
      //   {
      //     status: 'Prestataire',
      //     weeklyHours: 35,
      //     startDate: '01/11/2018',
      //     grossHourlyRate: 9,
      //     isActive: false
      //   },
      //   {
      //     status: 'Prestataire',
      //     weeklyHours: 35,
      //     startDate: '01/12/2018',
      //     grossHourlyRate: 9,
      //     isActive: false
      //   },
      //   {
      //     status: 'Prestataire',
      //     weeklyHours: 35,
      //     startDate: '01/01/2019',
      //     grossHourlyRate: 9,
      //     isActive: false,
      //     link: '',
      //     contractEmpty: 'testtt',
      //     contractSigned: 'test'
      //   }
      // ],
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
          required: true,
          label: 'Volume horaire hebdomadaire',
          align: 'left',
          field: 'weeklyHours',
          sortable: true
        },
        {
          name: 'startDate',
          required: true,
          label: 'Date d\'effet',
          align: 'left',
          field: 'startDate',
          format: (value) => this.$moment(value).format('DD/MM/YYYY'),
          sortable: true,
        },
        {
          name: 'grossHourlyRate',
          required: true,
          label: 'Taux horaire',
          align: 'left',
          field: 'grossHourlyRate',
          sortable: true,
        },
        {
          name: 'contractEmpty',
          required: true,
          label: 'Contrat vierge',
          align: 'left',
          field: 'contractEmpty',
          sortable: false
        },
        {
          name: 'contractSigned',
          required: true,
          label: 'Contract signé',
          align: 'left',
          field: 'contractSigned',
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
  },
  async mounted () {
    // const user = await this.$users.getById(this.getUser._id);
    // console.log(user);
    this.contracts = this.getUser.administrative.contracts;
  },
  methods: {
    async testDocxBlob (url) {
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
        this.$refs[refName].reset();
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Fichier trop volumineux (> 5 Mo)',
          position: 'bottom-left',
          timeout: 2500
        });
        return '';
      } else {
        this.$refs[refName].upload();
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
    refreshUser () {
      this.$q.notify({
        color: 'positive',
        icon: 'done',
        detail: 'Document envoyé',
        position: 'bottom-left',
        timeout: 2500
      });
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

</style>
