<template>
  <q-table :data="sortedHelpers" :columns="columns" row-key="name" :pagination="pagination" hide-bottom>
  </q-table>
</template>

<script>
import { formatIdentity } from '../../helpers/utils';

export default {
  name: 'HelperList',
  props: {
    helpers: { type: Array, default: () => [] },
  },
  data () {
    return {
      columns: [
        {
          name: 'identity',
          label: 'Identité',
          align: 'left',
          field: row => formatIdentity(row.identity, 'FL'),
        },
        {
          name: 'email',
          label: 'Email',
          align: 'left',
          field: row => row.local.email,
        },
      ],
      pagination: { rowsPerPage: 0 },
    };
  },
  computed: {
    sortedHelpers () {
      return [...this.helpers].sort((u1, u2) => {
        return (u1.identity.lastname || '').localeCompare((u2.identity.lastname || ''));
      });
    },
  },
}
</script>

<style lang="stylus" scoped>
  /deep/ .q-table
    & th
      padding: 0
    & td
      padding: 0
</style>
