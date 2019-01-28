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
                hide-upload-button @add="uploadDocument($event, `absenceReason_${props.row._id}`)" @uploaded="refreshAbsences"
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
          </q-td>
        </q-table>
      </q-card-main>
    </q-card>
    <q-btn class="fixed fab-add-person" no-caps rounded color="primary" icon="ion-document" label="Enregistrer une absence"
      @click="newAbsenceModal = true" />
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
        <ni-modal-select caption="Type d'absence" :error="$v.newAbsence.reason.$error" :options="reasonOptions" v-model="newAbsence.reason"
          separator @blur="$v.newAbsence.reason.$touch"
        />
        <ni-datetime-picker caption="Date de départ" :error="$v.newAbsence.startDate.$error" v-model="newAbsence.startDate"
          :min="$moment().startOf('month').toISOString()" inModal
        />
        <ni-modal-select caption="Durée" :error="$v.newAbsence.startDuration.$error" :options="dateOptions" v-model="newAbsence.startDuration"
          separator
        />
        <ni-datetime-picker caption="Date de fin" :error="$v.newAbsence.endDate.$error" v-model="newAbsence.endDate"
          :disable="!newAbsence.startDate" inModal
        />
        <ni-modal-select caption="Durée" :error="$v.newAbsence.endDuration.$error" :options="dateOptions" v-model="newAbsence.endDuration"
          separator :disable="!newAbsence.endDate || newAbsence.endDate <= newAbsence.startDate"
        />
      </div>
      <q-btn class="full-width modal-btn" no-caps label="Confirmer" color="primary" :loading="loading" @click="addAbsence" />
    </q-modal>
  </div>
</template>

<script>
import { Cookies } from 'quasar';
import { required } from 'vuelidate/lib/validators';
import { NotifyNegative, NotifyPositive } from '../popup/notify';
import ModalSelect from '../form/ModalSelect.vue';
import DatetimePicker from '../form/DatetimePicker.vue';

export default {
  components: {
    'ni-modal-select': ModalSelect,
    'ni-datetime-picker': DatetimePicker,
  },
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
    this.refreshAbsences();
  },
  methods: {
    async addAbsence () {
      try {
        const payload = {
          ...this.newAbsence,
          startDate: this.$moment(this.newAbsence.startDate).set({ hour: this.durations[this.newAbsence.startDuration].start }).toDate(),
        };
        if (this.newAbsence.endDuration !== '') {
          payload.endDate = this.$moment(this.newAbsence.endDate).set({ hour: this.durations[this.newAbsence.endDuration].end }).toDate();
        } else {
          payload.endDate = this.$moment(this.newAbsence.endDate).set({ hour: this.durations[this.newAbsence.startDuration].end }).toDate();
        }
        await this.$users.createAbsence(this.getUser._id, payload);
      } catch (e) {
        console.error(e);
      } finally {
        this.newAbsenceModal = false;
        this.$v.newAbsence.$reset();
        this.newAbsence = {
          startDate: '',
          endDate: ''
        };
        const absencesRaw = await this.$users.getAbsences(this.getUser._id);
        this.absences = absencesRaw;
      }
    },
    failMsg () {
      NotifyNegative('Echec de l\'envoi du document');
    },
    async refreshAbsences () {
      try {
        const absences = await this.$users.getAbsences(this.getUser._id);
        this.absences = absences;
      } catch (e) {
        console.error(e);
      }
    },
    uploadDocument (files, refName) {
      if (files[0].size > 5000000) {
        this.$refs[refName].reset();
        NotifyNegative('Fichier trop volumineux (> 5 Mo)');
        return '';
      } else {
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
        });
        const payload = { userId: this.getUser._id, absenceId: id };
        await this.$users.deleteAbsence(payload);
        this.absences.splice(cell, 1);
        NotifyPositive('Absence supprimée.');
      } catch (e) {
        NotifyNegative('Erreur lors de la suppression de l\'absence.');
        console.error(e);
      }
    }
  }
};
</script>

<style lang="stylus" scoped>
</style>
