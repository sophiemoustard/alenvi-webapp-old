<template>
  <q-page class="neutral-background q-pb-xl">
    <div class="title-padding">
      <h4>Absences</h4>
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
      @updateEvent="updateEvent" @close="closeEditionModal" @deleteEvent="deleteEvent"
      @selectedAddress="selectedAddress" />
  </q-page>
</template>

<script>
import { required, requiredIf } from 'vuelidate/lib/validators';
import { frAddress } from '../../../helpers/vuelidateCustomVal.js';
import { ABSENCE, ABSENCE_NATURES, ABSENCE_TYPES, HOURLY } from '../../../data/constants';
import BillingPagination from '../../../components/table/BillingPagination';
import AuxiliaryEventEditionModal from '../../../components/planning/AuxiliaryEventEditionModal';
import { planningActionMixin } from '../../../mixins/planningActionMixin';

export default {
  name: 'Absences',
  metaInfo: { title: 'Absences' },
  components: {
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
      selectedAuxiliary: { picture: {}, identity: {} },
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
          format: value => `${value.identity.firstname.slice(0, 1)}. ${value.identity.lastname}`,
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
        location: { fullAddress: { frAddress } },
      },
    };
  },
  async mounted () {
    await this.refresh();
  },
  methods: {
    async refresh () {
      try {
        this.absences = await this.$events.list({ type: ABSENCE });
      } catch (e) {
        this.absences = [];
        console.error(e);
      }
    },
    // Event edition
    openEditionModal (event) {
      const can = this.canEditEvent(event);
      if (!can) return;
      this.selectedAuxiliary = event.auxiliary ? event.auxiliary : { picture: {}, identity: {} };
      this.formatEditedEvent(event);

      this.editionModal = true
    },
  },
}
</script>

<style lang="stylus" scoped>
</style>
