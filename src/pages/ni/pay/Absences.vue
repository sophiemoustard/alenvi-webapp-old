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
              <q-btn flat round small color="grey" icon="edit" />
            </div>
          </template>
          <template v-if="col.name === 'attachment'">
            <div v-if="props.row.attachment && props.row.attachment.link" class="row no-wrap table-actions">
              <q-btn flat round small color="primary">
                <a :href="props.row.attachment.link">
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
  </q-page>
</template>

<script>
import { ABSENCE, ABSENCE_NATURES, ABSENCE_TYPES } from '../../../data/constants';
import BillingPagination from '../../../components/table/BillingPagination';

export default {
  name: 'Absences',
  metaInfo: { title: 'Absences' },
  components: {
    'ni-billing-pagination': BillingPagination,
  },
  data () {
    return {
      absences: [],
      pagination: { rowsPerPage: 0 },
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
          format: value => ABSENCE_NATURES.find(abs => abs.value === value).label,
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
          format: value => ABSENCE_TYPES.find(abs => abs.value === value).label,
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
  async mounted () {
    await this.refreshAbsences();
  },
  methods: {
    async refreshAbsences () {
      try {
        this.absences = await this.$events.list({ type: ABSENCE });
      } catch (e) {
        this.absences = [];
        console.error(e);
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
</style>
