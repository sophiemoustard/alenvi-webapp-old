<template>
  <q-page padding class="neutral-background q-pb-xl">
    <h4>Historique</h4>
    <div class="row gutter-sm">
      <ni-select caption="Type d'export" :options="exportTypeOptions" v-model="type" />
      <ni-date-range class="col-12 col-md-auto" caption="Période" v-model="dateRange" />
    </div>
    <q-btn label="Exporter" no-caps flat color="white" icon="import_export" @click="exportCsv" />
  </q-page>
</template>

<script>
import { NotifyNegative, NotifyPositive } from '../../../components/popup/notify';
import { downloadFile } from '../../../helpers/downloadFile';
import Select from '../../../components/form/Select';
import DateRange from '../../../components/form/DateRange';
import { EXPORT_HISTORY_TYPES, WORKING_EVENT } from '../../../data/constants';

export default {
  name: 'History',
  metaInfo: { title: 'Historique' },
  components: {
    'ni-select': Select,
    'ni-date-range': DateRange
  },
  data () {
    return {
      exportTypeOptions: EXPORT_HISTORY_TYPES,
      type: WORKING_EVENT,
      dateRange: { startDate: this.$moment().subtract(1, 'year').toISOString(), endDate: this.$moment().toISOString() }
    }
  },
  methods: {
    async exportCsv () {
      try {
        const type = EXPORT_HISTORY_TYPES.find(type => type.value === this.type);
        if (!type) return NotifyNegative('Impossible de téléchager le document');

        const csv = await this.$exports.getHistoryCsv({ ...this.dateRange, type: type.value });
        await downloadFile(csv, `${type.label}.csv`);

        NotifyPositive('Document téléchargé');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du téléchagement du document');
      }
    },
  }
}
</script>

<style lang="stylus" scoped>
@import '~variables';

  .q-btn
    background-color: $primary;

</style>
