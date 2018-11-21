<template>
  <div>
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
    <div class="row margin-input gutter-profile">
      <div class="col-xs-12 col-md-6">
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
      <div class="col-xs-12 col-md-6">
        <div class="row justify-between">
          <p class="input-caption">Durée</p>
          <!-- <q-icon v-if="$v.newAbsenceOptionsSelected.startDateOption.$error" name="error_outline" color="secondary" /> -->
        </div>
        <!-- <q-field :error="$v.newAbsenceOptionsSelected.startDateOption.$error" error-label="Champ requis"> -->
          <q-select :options="dateOptions" v-model="newAbsenceOptionsSelected.startDateOption" color="white" inverted-light separator /> <!-- @blur="$v.newAbsenceOptionsSelected.startDateOption.$touch"  -->
        <!-- </q-field> -->
      </div>
    </div>
    <div class="row margin-input gutter-profile">
      <div class="col-xs-12 col-md-6">
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
      <div class="col-xs-12 col-md-6">
        <div class="row justify-between">
          <p class="input-caption">Durée</p>
          <!-- <q-icon v-if="$v.newAbsenceOptionsSelected.startDateOption.$error" name="error_outline" color="secondary" /> -->
        </div>
        <!-- <q-field :error="$v.newAbsenceOptionsSelected.startDateOption.$error" error-label="Champ requis"> -->
          <q-select :options="dateOptions" v-model="newAbsenceOptionsSelected.endDateOption" color="white" inverted-light separator /> <!-- @blur="$v.newAbsenceOptionsSelected.startDateOption.$touch"  -->
        <!-- </q-field> -->
      </div>
     </div>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';

export default {
  data () {
    return {
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
      absences: [
        {
          startDate: '2018-03-23T14:18:18.852Z',
          endDate: '2018-03-23T14:18:18.852Z',
          reason: 'Congé',
          _id: '5bd053b59c7afde706eacde5',
          driveId: '1dnGt41N6i79TE7_vhDvWN7BSWdoddZ0c',
          link: 'https://drive.google.com/file/d/1dnGt41N6i79TE7_vhDvWN7BSWdoddZ0c/view?usp=drivesdk'
        }
      ],
      newAbsence: {
        startDate: '',
        endDate: '',
        reason: ''
      },
      newAbsenceOptionsSelected: {
        startDateOption: '',
        endDateOption: ''
      },
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
      console.log(user);
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
  }
};
</script>

<style lang="stylus" scoped>
@import '~variables';
</style>
