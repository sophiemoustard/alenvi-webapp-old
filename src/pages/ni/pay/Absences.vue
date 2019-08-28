<template>
  <q-page class="neutral-background q-pb-xl">
    <div class="title-padding">
      <h4>Absences</h4>
      <ni-date-range v-model="dates" @input="refresh" borderless :error.sync="datesHasError" />
    </div>
    <q-table :data="absences" :columns="columns" binary-state-sort :pagination.sync="pagination" class="q-pa-sm">
      <q-tr slot="body" slot-scope="props" :props="props">
        <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name">
          <template v-if="col.name === 'actions'">
            <div class="row no-wrap table-actions">
              <q-btn flat round small color="grey" icon="edit" @click="openEditionModal(props.row)" />
            </div>
          </template>
          <template v-if="col.name === 'attachment'">
            <div v-if="props.row.attachment && props.row.attachment.link" class="row no-wrap table-actions">
              <q-btn flat round small color="primary">
                <a :href="props.row.attachment.link" target="_blank">
                  <q-icon name="file download" />
                </a>
              </q-btn>
            </div>
          </template>
          <template v-else>{{ col.value }}</template>
        </q-td>
      </q-tr>
      <ni-billing-pagination slot="bottom" slot-scope="props" :props="props" :pagination.sync="pagination"
        :data="absences"/>
    </q-table>

    <!-- Absence edition modal -->
    <ni-auxiliary-event-edition-modal :validations="$v.editedEvent" :loading="loading" :editedEvent="editedEvent"
      :editionModal="editionModal" :selectedAuxiliary="selectedAuxiliary" :auxiliaries="[selectedAuxiliary]"
      @resetForm="resetEditionForm" @deleteDocument="deleteDocument" @documentUploaded="documentUploaded"
      @updateEvent="updateEvent" @close="closeEditionModal" @deleteEvent="deleteEvent" />
  </q-page>
</template>

<script>
import DateRange from '../../../components/form/DateRange';
import { required, requiredIf } from 'vuelidate/lib/validators';
import { frAddress } from '../../../helpers/vuelidateCustomVal.js';
import { ABSENCE, ABSENCE_NATURES, ABSENCE_TYPES, HOURLY, DAILY } from '../../../data/constants';
import BillingPagination from '../../../components/table/BillingPagination';
import AuxiliaryEventEditionModal from '../../../components/planning/AuxiliaryEventEditionModal';
import { planningActionMixin } from '../../../mixins/planningActionMixin';
import { formatIdentity, formatHours } from '../../../helpers/utils';
import { NotifyWarning } from '../../../components/popup/notify';

export default {
  name: 'Absences',
  metaInfo: { title: 'Absences' },
  components: {
    'ni-date-range': DateRange,
    'ni-billing-pagination': BillingPagination,
    'ni-auxiliary-event-edition-modal': AuxiliaryEventEditionModal,
  },
  mixins: [planningActionMixin],
  data () {
    return {
      events: [],
      loading: false,
      absences: [],
      editedEvent: {},
      editionModal: false,
      selectedAuxiliary: { picture: {}, identity: { lastname: '' } },
      pagination: {
        rowsPerPage: 0,
        sortBy: 'startDate',
        descending: true,
      },
      columns: [
        {
          name: 'auxiliary',
          label: 'Auxiliaire',
          field: 'auxiliary',
          format: value => formatIdentity(value.identity, 'FL'),
          align: 'left',
        },
        {
          name: 'nature',
          label: 'Nature',
          field: 'absenceNature',
          format: value => {
            const nature = ABSENCE_NATURES.find(abs => abs.value === value);
            return nature ? nature.label : '';
          },
          align: 'left',
        },
        {
          name: 'startDate',
          label: 'Date de début',
          field: 'startDate',
          format: value => this.$moment(value).format('DD/MM/YYYY'),
          align: 'center',
        },
        {
          name: 'startHour',
          label: 'Heure de début',
          field: 'startDate',
          format: value => this.$moment(value).format('HH:mm'),
          align: 'center',
        },
        {
          name: 'endDate',
          label: 'Date de fin',
          field: 'endDate',
          format: value => this.$moment(value).format('DD/MM/YYYY'),
          align: 'center',
        },
        {
          name: 'endHour',
          label: 'Heure de fin',
          field: 'endDate',
          format: value => this.$moment(value).format('HH:mm'),
          align: 'center',
        },
        {
          name: 'duration',
          label: 'Durée',
          field: row => this.getAbsenceDuration(row),
          align: 'center',
        },
        {
          name: 'type',
          label: 'Type',
          field: 'absence',
          format: value => {
            const type = ABSENCE_TYPES.find(abs => abs.value === value);
            return type ? type.label : '';
          },
          align: 'left',
        },
        {
          name: 'attachment',
          label: 'Justificatif',
        },
        {
          name: 'misc',
          label: 'Notes',
          field: 'misc',
          align: 'left',
        },
        {
          name: 'actions',
          label: '',
        },
      ],
      dates: {
        startDate: this.$moment().startOf('M').toISOString(),
        endDate: this.$moment().endOf('M').toISOString(),
      },
      datesHasError: false,
    };
  },
  validations () {
    return {
      editedEvent: {
        dates: {
          startDate: { required },
          endDate: { required },
          startHour: { required: requiredIf((item, parent) => parent && parent.absenceNature === HOURLY) },
          endHour: { required: requiredIf((item, parent) => parent && parent.absenceNature === HOURLY) },
        },
        auxiliary: { required },
        sector: { required },
        absence: { required },
        absenceNature: { required },
        address: { fullAddress: { frAddress } },
      },
    };
  },
  async mounted () {
    await this.refresh();
  },
  methods: {
    getAbsenceDuration (absence) {
      if (absence.absenceNature === DAILY) {
        const range = Array.from(this.$moment().range(absence.startDate, absence.endDate).by('days'));
        let count = 0;
        for (const day of range) {
          if (day.startOf('d').isBusinessDay()) count += 1; // startOf('day') is necessery to check fr holidays in business day
        }

        return `${count}j`;
      };

      const duration = this.$moment(absence.endDate).diff(absence.startDate, 'm') / 60;
      return formatHours(duration);
    },
    async refresh () {
      try {
        if (this.datesHasError) return;
        this.absences = await this.$events.list({ type: ABSENCE, startDate: this.dates.startDate, endDate: this.dates.endDate });
      } catch (e) {
        this.absences = [];
        console.error(e);
      }
    },
    // Event edition
    openEditionModal (event) {
      const can = this.canEditEvent(event);
      if (!can) return NotifyWarning('Vous n\'avez pas les droits pour réaliser cette action');
      this.selectedAuxiliary = event.auxiliary ? event.auxiliary : { picture: {}, identity: { lastname: '' } };
      this.formatEditedEvent(event);

      this.editionModal = true
    },
  },
}
</script>

<style lang="stylus" scoped>
</style>
