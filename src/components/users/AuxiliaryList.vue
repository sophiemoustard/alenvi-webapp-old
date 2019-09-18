<template>
  <q-table :data="auxiliaries" :columns="columns" row-key="name" :pagination.sync="pagination" hide-header
    :rows-per-page-options="[]">
    <q-td slot="body-cell-picture" slot-scope="props" :props="props">
      <img class="avatar" :src="props.value.link">
    </q-td>
  </q-table>
</template>

<script>
import moment from 'moment';
import { formatIdentity } from '../../helpers/utils';
import ChipAuxiliaryIndicator from '../../components/planning/ChipAuxiliaryIndicator';

export default {
  name: 'AuxiliaryList',
  components: {
    'chip-auxiliary-indicator': ChipAuxiliaryIndicator,
  },
  props: {
    auxiliaries: { type: Array, default: () => [] },
  },
  data () {
    return {
      columns: [
        {
          name: 'picture',
          align: 'left',
          field: 'picture',
        },
        {
          name: 'identity',
          align: 'left',
          field: row => `${formatIdentity(row.identity, 'Fl')} (${row.sector.name})`,
        },
        {
          name: 'hours',
          align: 'left',
          field: row => `${Math.trunc(row.totalHours)}h réalisées`,
        },
        {
          name: 'lastEvent',
          align: 'left',
          field: row => `Dernière intervention le ${moment(row.lastEvent.startDate).format('DD/MM/YYYY')}`,
        },
      ],
      pagination: { rowsPerPage: 5 },
    };
  },
}
</script>
