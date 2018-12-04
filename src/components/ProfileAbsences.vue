<template>
  <div>
    <q-card style="background: white">
      <q-card-main>
        <q-table :data="absences" :columns="columns" row-key="name" binary-state-sort>
          <q-td slot="body-cell-link" slot-scope="props" :props="props">
            <div v-if="!props.row.link" class="row justify-center">
              <q-uploader :ref="`absenceReason_${props.row._id}`" name="absenceReason" :url="docsUploadUrl" :headers="headers"
                :additional-fields="[
                  { name: 'fileName', value: `justificatif_absence_${getUser.firstname}_${getUser.lastname}_${$moment().format('DD-MM-YYYY')}` },
                  { name: 'absenceId', value: props.row._id }
                ]"
                hide-underline extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf"
                hide-upload-button @add="uploadDocument($event, `absenceReason_${props.row._id}`)" @uploaded="refreshUser"
                @fail="failMsg" />
            </div>
            <q-btn v-else flat round small color="primary">
              <a :href="props.row.link" download>
                <q-icon name="file download" />
              </a>
            </q-btn>
          </q-td>
          <q-td slot="body-cell-delete" slot-scope="props" :props="props">
            <q-btn flat round small color="grey" icon="delete" @click.native="removeAbsence(props.value, props.row.__index)" />
            <!-- <q-icon class="cursor-pointer" color="grey" name="delete" @click.native="remove(props.value.id, props.row.__index, props.value.userId)" size="1.5rem" /> -->
          </q-td>
        </q-table>
      </q-card-main>
    </q-card>

    <!-- <div class="row margin-input">
      <div class="col-xs-12">
        <div class="row justify-between">
          <p class="input-caption">Justificatif</p>
          <q-icon v-if="$v.newAbsence.document.$error" error-label="Champ requis" />
        </div>
        <div class="row justify-center">
            <q-uploader ref="absenceReason" name="absenceReason" :url="docsUploadUrl" :headers="headers"
              :additional-fields="[
                { name: 'fileName', value: `justificatif_absence_${getUser.firstname}_${getUser.lastname}_${this.$moment().format('DD-MM-YYYY')}` },
                { name: 'absenceId', value: contract._id },
                { name: 'versionId', value: props.row._id }
              ]"
              hide-underline extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf"
              hide-upload-button @add="uploadDocument($event, `signedContract_${props.row._id}`)" @uploaded="refreshUser" @fail="failMsg" />
          </div>
      </div>
    </div> -->
    <q-btn class="fixed fab-add-person" no-caps rounded color="primary" icon="ion-document" label="Enregistrer une absence"
      @click="newAbsenceModal = true" />
    <!-- <p></p> -->
    <q-modal v-model="newAbsenceModal" :content-css="modalCssContainer">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Créer une <span class="text-weight-bold">absence</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span>
              <q-icon name="clear" size="1rem" @click.native="newAbsenceModal = false" /></span>
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Type d'absence</p>
              <q-icon v-if="$v.newAbsence.reason.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.newAbsence.reason.$error" error-label="Champ requis">
              <q-select :options="reasonOptions" v-model="newAbsence.reason" color="white" inverted-light separator
                @blur="$v.newAbsence.reason.$touch" />
            </q-field>
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Date de départ</p>
              <q-icon v-if="$v.newAbsence.startDate.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.newAbsence.startDate.$error" error-label="Champ requis">
              <q-datetime type="date" format="DD/MM/YYYY" v-model="newAbsence.startDate" :min="$moment().startOf('month').toISOString()"
                color="white" inverted-light popover ok-label="OK" cancel-label="Fermer" />
            </q-field>
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Durée</p>
              <q-icon v-if="$v.newAbsence.startDuration.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.newAbsence.startDuration.$error" error-label="Champ requis">
              <q-select :options="dateOptions" v-model="newAbsence.startDuration" color="white" inverted-light
                separator /> <!-- @blur="$v.newAbsenceOptionsSelected.startDateOption.$touch"  -->
            </q-field>
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Date de fin</p>
              <q-icon v-if="$v.newAbsence.endDate.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.newAbsence.endDate.$error" error-label="Champ requis">
              <q-datetime :disable="!newAbsence.startDate" type="date" format="DD/MM/YYYY" v-model="newAbsence.endDate"
                color="white" inverted-light popover ok-label="OK" cancel-label="Fermer" />
              <!-- :min="newAbsence.startDate" -->
            </q-field>
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Durée</p>
              <q-icon v-if="$v.newAbsence.endDuration.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.newAbsence.endDuration.$error" error-label="Champ requis">
              <q-select :disable="!newAbsence.endDate || newAbsence.endDate <= newAbsence.startDate" :options="dateOptions"
                v-model="newAbsence.endDuration" color="white" inverted-light separator />
              <!-- @blur="$v.newAbsenceOptionsSelected.startDateOption.$touch"  -->
            </q-field>
          </div>
        </div>
      </div>
      <q-btn class="full-width modal-btn" no-caps label="Confirmer" color="primary" :loading="loading" @click="addAbsence" />
    </q-modal>
  </div>
</template>

<script>
import { Cookies } from 'quasar';
import { required } from 'vuelidate/lib/validators';
import { alenviAxios } from '../api/ressources/alenviAxios'

export default {
  data () {
    return {
      loading: false,
      newAbsence: {
        startDate: '',
        endDate: '',
        startDuration: '',
        endDuration: '',
        reason: ''
      },
      newAbsenceModal: false,
      modalCssContainer: {
        minWidth: '30vw'
      },
      absences: [],
      reasonOptions: [
        {
          label: 'Congé',
          value: 'Congé'
        },
        {
          label: 'Congé sans solde',
          value: 'Congé sans solde'
        },
        {
          label: 'Congé maternité',
          value: 'Congé maternité'
        },
        {
          label: 'Maladie',
          value: 'Maladie'
        },
        {
          label: 'Absence injustifiée',
          value: 'Absence injustifiée'
        },
        {
          label: 'Mariage',
          value: 'Mariage'
        },
        {
          label: 'Naissance',
          value: 'Naissance'
        },
        {
          label: 'Décès',
          value: 'Décès'
        },
      ],
      dateOptions: [
        {
          label: 'Matinée',
          value: 'Matinée'
        },
        {
          label: 'Après-midi',
          value: 'Après-midi'
        },
        {
          label: 'Journée entière',
          value: 'Journée entière'
        }
      ],
      durations: {
        'Matinée': {
          start: 8,
          end: 14
        },
        'Après-midi': {
          start: 14,
          end: 20
        },
        'Journée entière': {
          start: 8,
          end: 20
        }
      },
      columns: [
        {
          name: 'startDate',
          label: 'Date de départ',
          align: 'left',
          field: 'startDate',
          format: (value) => this.$moment(value).format('DD/MM/YYYY'),
          sortable: true,
        },
        {
          name: 'startDuration',
          label: '',
          align: 'left',
          field: 'startDuration',
          sortable: true
        },
        {
          name: 'endDate',
          label: 'Date de fin',
          align: 'left',
          field: 'endDate',
          format: (value) => this.$moment(value).format('DD/MM/YYYY'),
          sortable: true
        },
        {
          name: 'endDuration',
          label: '',
          align: 'left',
          field: 'endDuration',
          format: (value) => value || '/',
          sortable: true,
        },
        {
          name: 'reason',
          label: 'Motif',
          align: 'left',
          field: 'reason',
          sortable: false
        },
        {
          name: 'link',
          label: 'Justificatif',
          align: 'center',
          field: 'link',
          sortable: false
        },
        {
          name: 'delete',
          label: '',
          align: 'left',
          field: '_id',
          sortable: false
        }
      ]
    }
  },
  validations: {
    newAbsence: {
      startDate: { required },
      endDate: { required },
      reason: { required },
      startDuration: { required },
      endDuration: { required }
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
    try {
      const user = await this.$users.getById(this.getUser._id);
      this.absences = user.administrative.absences;
      console.log(this.absences);
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
    async addAbsence () {
      try {
        this.newAbsence.startDate = this.$moment(this.newAbsence.startDate).set({ hour: this.durations[this.newAbsence.startDuration].start }).toDate();
        if (this.newAbsence.endDuration !== '') {
          this.newAbsence.endDate = this.$moment(this.newAbsence.endDate).set({ hour: this.durations[this.newAbsence.endDuration].end }).toDate();
        } else {
          this.newAbsence.endDate = this.$moment(this.newAbsence.endDate).set({ hour: this.durations[this.newAbsence.startDuration].end }).toDate();
        }
        const test = await alenviAxios({
          url: `${process.env.API_HOSTNAME}/users/${this.getUser._id}/absences`,
          method: 'POST',
          data: this.newAbsence
        });
        console.log(test);
      } catch (e) {
        console.error(e);
      } finally {
        this.newAbsenceModal = false;
        this.$v.newAbsence.$reset();
        this.newAbsence = {
          startDate: '',
          endDate: ''
        };
        const absencesRaw = await alenviAxios({
          url: `${process.env.API_HOSTNAME}/users/${this.getUser._id}/absences`,
          method: 'GET'
        })
        this.absences = absencesRaw.data.data.absences;
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
        this.absences = user.administrative.absences;
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
        console.log(this.$refs);
        this.$refs[refName].upload();
      }
    },
    async removeAbsence (id, cell) {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Etes-vous sûr de vouloir supprimer cette absence ?',
          ok: 'OK',
          cancel: 'Annuler'
        })
        await alenviAxios({
          url: `${process.env.API_HOSTNAME}/users/${this.getUser._id}/absences/${id}`,
          method: 'DELETE'
        })
        this.absences.splice(cell, 1);
        this.$q.notify({
          color: 'positive',
          icon: 'thumb up',
          detail: 'Absence supprimée.',
          position: 'bottom-right',
          timeout: 2500
        });
      } catch (e) {
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de la suppression de l\'absence.',
          position: 'bottom-right',
          timeout: 2500
        });
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

  .bg-negative
    background: none !important
    color: inherit !important

  .q-field-bottom
    padding-top: 2px

  .q-if-inverted
    border: 1px solid $light-grey

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
    // position: relative !important
    cursor: pointer !important
    // background: blue

</style>
