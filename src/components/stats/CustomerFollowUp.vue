<template>
  <q-table :data="followUp" :columns="columns" row-key="name" :pagination.sync="pagination"
    :rows-per-page-options="[]" class="table-fixed">
    <q-td slot="body-cell-identity" slot-scope="props" :props="props">
      <q-item>
        <q-item-side :avatar="props.value.picture.link | getAvatar" />
        <q-item-main>
          <span class="identity-block q-mr-sm">{{ props.value.identity | formatIdentity('Fl') }}</span>
          <span class="identity-block">({{ props.value.sector.name }})</span>
        </q-item-main>
      </q-item>
    </q-td>
  </q-table>
</template>

<script>
import moment from 'moment';
import { formatIdentity } from '../../helpers/utils';
import { DEFAULT_AVATAR } from '../../data/constants';

export default {
  name: 'CustomerFollowUp',
  props: {
    followUp: { type: Array, default: () => [] },
  },
  data () {
    return {
      columns: [
        {
          name: 'identity',
          align: 'left',
          field: row => row,
        },
        {
          name: 'hours',
          align: 'center',
          label: 'Heures réalisées',
          field: row => `${Math.trunc(row.totalHours)}h`,
        },
        {
          name: 'lastEvent',
          align: 'center',
          label: 'Dernière inter.',
          field: row => moment(row.lastEvent.startDate).format('DD/MM/YYYY'),
        },
      ],
      pagination: { rowsPerPage: 5 },
    };
  },
  filters: {
    formatIdentity,
    getAvatar (link) {
      return link || DEFAULT_AVATAR;
    },
  },
}
</script>

<style lang="stylus" scoped>
  .identity-block
    display: inline-block;
    font-size: 12px;
  .q-item
    padding: 0;
  .table-fixed >>> table
    table-layout: fixed;
</style>
