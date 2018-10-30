<template>
  <div>
    <div class="row">
      <q-card v-if="contracts" v-for="(contract, index) in contracts" :key="index" class="col-md-6 col-xs-12" style="cursor: pointer; background: white">
        <q-card-title class="text-center">
          {{contract.startDate}}
        </q-card-title>
        <q-card-main>
          <p class="q-mb-lg">Statut: {{ contract.status }}</p>
          <p class="q-mb-lg">Date de mise à jour: {{ contract.startDate }}</p>
          <p class="q-mb-lg">Volume horaire hebdomadaire : {{ contract.weeklyHours }}</p>
          <p class="q-mb-lg">Taux horaire: {{ contract.grossHourlyRate }}</p>
        </q-card-main>
        <q-card-actions align="around">
          <q-btn flat round small color="primary">
            <a :href="contract.grossHourlyRate" download>
              <q-icon name="file download" />
            </a>
          </q-btn>
        </q-card-actions>
      </q-card>
    </div>
    <q-btn class="fixed fab-add-person" no-caps rounded color="primary" icon="add" label="Créer un nouveau contrat" @click="opened = true" />
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
// import * as JSZip from 'jszip';
import * as JSZipUtils from 'jszip-utils';
// import * as Docxtemplater from 'docxtemplater';
// import saveAs from 'file-saver';
import { required } from 'vuelidate/lib/validators';

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
    }
  },
  async mounted () {
    const user = await this.$users.getById(this.getUser._id);
    console.log(user);
    this.contracts = [
      {
        status: 'Prestataire',
        weeklyHours: 35,
        startDate: '01/11/2018',
        grossHourlyRate: 9,
        isActive: false
      },
      {
        status: 'Prestataire',
        weeklyHours: 35,
        startDate: '01/12/2018',
        grossHourlyRate: 9,
        isActive: false
      },
      {
        status: 'Prestataire',
        weeklyHours: 35,
        startDate: '01/01/2019',
        grossHourlyRate: 9,
        isActive: false
      }
    ]
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
    async getDocxBlob () {
      try {
        const test = await this.testDocxBlob('https://drive.google.com/file/d/1qcxsH3D2sek4sA8EQWdCwiTQJq2r9Vwn/view?usp=sharing');
        console.log(test);
        // https://docxtemplater.com/tag-example.docx
        // JSZipUtils.getBinaryContent('https://drive.google.com/file/d/1qcxsH3D2sek4sA8EQWdCwiTQJq2r9Vwn/view?usp=sharing', function (error, content) {
        //   if (error) { throw error }
        //   console.log('test');
        //   const zip = new JSZip(content);
        //   const doc = new Docxtemplater().loadZip(zip);
        //   doc.setData({
        //     firstName: 'John',
        //     lastName: 'Doe',
        //     // phone: '0650769406',
        //     description: 'New Website'
        //   });
        //   try {
        //     doc.render();
        //   } catch (e) {
        //     console.error(e);
        //   }
        //   const out = doc.getZip().generate({
        //     type: 'blob',
        //     mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        //   });
        //   console.log(out);
        //   saveAs(out, 'output.docx');
        // });
      } catch (e) {
        console.error(e);
      }
    },
    async submit () {
      try {
        this.loading = true;
        this.getDocxBlob();
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
</style>
