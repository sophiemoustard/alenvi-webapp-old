<template>
  <div>
    <q-table :data="absences"
            :columns="columns"
            row-key="name"
            binary-state-sort>
    </q-table>
    <q-btn class="fixed fab-add-person" no-caps rounded color="primary" icon="ion-document" label="Créer une nouvelle absence" @click="newAbsenceModal = true" />
    <!-- <p></p> -->
    <q-modal v-model="newAbsenceModal" :content-css="modalCssContainer">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-8">
            <h5>Créer une <span class="text-weight-bold">absence</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span><q-icon name="clear" size="1rem" @click.native="newAbsenceModal = false" /></span>
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
              <q-datetime type="date" format="DD/MM/YYYY" v-model="newAbsence.startDate" color="white" inverted-light popover
              ok-label="OK"
              cancel-label="Fermer" />
            </q-field>
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Durée</p>
              <!-- <q-icon v-if="$v.newAbsenceOptionsSelected.startDateOption.$error" name="error_outline" color="secondary" /> -->
            </div>
            <!-- <q-field :error="$v.newAbsenceOptionsSelected.startDateOption.$error" error-label="Champ requis"> -->
              <q-select :options="dateOptions" v-model="newAbsence.startDuration" color="white" inverted-light separator /> <!-- @blur="$v.newAbsenceOptionsSelected.startDateOption.$touch"  -->
            <!-- </q-field> -->
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Date de fin</p>
              <q-icon v-if="$v.newAbsence.endDate.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.newAbsence.endDate.$error" error-label="Champ requis">
              <q-datetime type="date" format="DD/MM/YYYY" v-model="newAbsence.endDate" color="white" inverted-light popover
              ok-label="OK"
              cancel-label="Fermer" />
            </q-field>
          </div>
        </div>
        <div v-if="newAbsence.endDate > newAbsence.startDate" class="row margin-input">
          <div class="col-xs-12">
            <div class="row justify-between">
              <p class="input-caption">Durée</p>
              <!-- <q-icon v-if="$v.newAbsenceOptionsSelected.startDateOption.$error" name="error_outline" color="secondary" /> -->
            </div>
            <!-- <q-field :error="$v.newAbsenceOptionsSelected.startDateOption.$error" error-label="Champ requis"> -->
              <q-select :options="dateOptions" v-model="newAbsence.endDuration" color="white" inverted-light separator /> <!-- @blur="$v.newAbsenceOptionsSelected.startDateOption.$touch"  -->
            <!-- </q-field> -->
          </div>
        </div>
      </div>
      <q-btn class="full-width modal-btn" no-caps label="Confirmer" color="primary" :loading="loading" @click="addAbsence" />
    </q-modal>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { alenviAxios } from '../api/ressources/alenviAxios'

export default {
  data () {
    return {
      loading: false,
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
          label: 'Période',
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
          label: 'Période',
          align: 'left',
          field: 'endDuration',
          sortable: true,
        },
        {
          name: 'reason',
          label: 'Motif',
          align: 'left',
          field: 'reason',
          sortable: false
        }
      ],
      // absences: [
      //   {
      //     startDate: '2018-03-23T14:18:18.852Z',
      //     endDate: '2018-03-23T14:18:18.852Z',
      //     reason: 'Congé',
      //     _id: '5bd053b59c7afde706eacde5',
      //     driveId: '1dnGt41N6i79TE7_vhDvWN7BSWdoddZ0c',
      //     link: 'https://drive.google.com/file/d/1dnGt41N6i79TE7_vhDvWN7BSWdoddZ0c/view?usp=drivesdk'
      //   }
      // ],
      newAbsence: {
        startDate: '',
        endDate: '',
        reason: '',
        startDuration: '',
        endDuration: ''
      },
      // newAbsenceOptionsSelected: {
      //   startDateOption: '',
      //   endDateOption: ''
      // },
    }
  },
  validations: {
    newAbsence: {
      startDate: { required },
      endDate: { required },
      reason: { required }
    }
  },
  computed: {
    getUser () {
      return this.$store.getters['rh/getUserProfile'];
    }
  },
  async mounted () {
    try {
      const user = await this.$users.getById(this.getUser._id);
      this.absences = user.administrative.absences;
      // for (let i = 0, l = this.absences.length; i < l; i++) {
      //   console.log(this.$moment(this.absences[i].startDate).format('HH'));
      //   if (this.$moment(this.absences[i].startDate).format('HH') < 10) {
      //     this.absences[i].startDateOption = 'morning';
      //   } else if (this.$moment(this.absences[i].startDate).format('HH')) {
      //     // this.absences[i].startDateOption = this.absences[i].
      //   }
      // }
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
    async addAbsence () {
      try {
        this.newAbsence.startDate = this.$moment(this.newAbsence.startDate).set('hours', this.durations[this.newAbsence.startDuration].start);
        if (this.newAbsence.endDuration) {
          this.newAbsence.endDate = this.$moment(this.newAbsence.endDate).set('hours', this.durations[this.newAbsence.endDuration].end);
        }
        const test = await alenviAxios({
          url: `${process.env.API_HOSTNAME}/users/${this.getUser._id}/absences`,
          method: 'POST',
          data: this.newAbsence
        });
        console.log(test);
        // const test = this.$moment(this.newAbsence.startDate).set('hours', this.durations[this.newAbsence.startDuration].start);
        // const test2 = this.$moment(this.newAbsence.endDate).set('hours', this.durations[this.newAbsence.endDuration].end);
        // console.log(test);
        // console.log(test2);
        // console.log('test');
      } catch (e) {
        console.error(e);
      } finally {
        this.newAbsenceModal = false;
        // this.newAbsence = {};
      }
    },
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

</style>
