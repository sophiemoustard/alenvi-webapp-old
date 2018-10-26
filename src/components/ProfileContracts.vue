<template>
  <div>
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
              <q-icon v-if="$v.newContract.statut.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.newContract.statut.$error" error-label="Champ requis">
              <q-select :options="statutOptions" v-model="newContract.statut" color="white" inverted-light separator
               @blur="$v.newContract.statut.$touch" />
            </q-field>
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Volume horaire hebdomadaire</p>
              <q-icon v-if="$v.newContract.volume.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.newContract.volume.$error" error-label="Champ requis">
              <q-input v-model="newContract.volume" color="white" inverted-light @blur="$v.newContract.volume.$touch" />
            </q-field>
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Taux horaire</p>
              <q-icon v-if="$v.newContract.hourlyRate.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.newContract.hourlyRate.$error" error-label="Champ requis">
              <q-input v-model="newContract.hourlyRate" color="white" inverted-light @blur="$v.newContract.hourlyRate.$touch" />
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
import * as JSZip from 'jszip';
import * as JSZipUtils from 'jszip-utils';
import * as Docxtemplater from 'docxtemplater';
// import saveAs from 'file-saver';
import { required } from 'vuelidate/lib/validators';

export default {
  data () {
    return {
      loading: false,
      opened: false,
      newContract: {
        statut: '',
        volume: '',
        startDate: '',
        hourlyRate: '',
        isActive: false
      },
      statutOptions: [
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
      statut: { required },
      volume: { required },
      startDate: { required },
      hourlyRate: { required }
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
  },
  methods: {
    async getDocxBlob () {
      try {
        JSZipUtils.getBinaryContent('https://docxtemplater.com/tag-example.docx', function (error, content) {
          if (error) { throw error }
          console.log('test');
          const zip = new JSZip(content);
          const doc = new Docxtemplater().loadZip(zip);
          doc.setData({
            first_name: 'John',
            last_name: 'Doe',
            phone: '0650769406',
            description: 'New Website'
          });
          try {
            doc.render();
          } catch (e) {
            console.error(e);
          }
          const out = doc.getZip().generate({
            type: 'blob',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          });
          console.log(out);
          // saveAs(out, 'output.docx');
        });
      } catch (e) {
        console.error(e);
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
