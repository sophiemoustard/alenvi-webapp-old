<template>
  <q-card v-if="Object.keys(documents).length > 0" class="q-mb-lg neutral-background" flat>
    <q-table :data="documents" :columns="columns" binary-state-sort :pagination.sync="pagination">
      <q-tr slot="body" slot-scope="props" :props="props">
        <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
          <template v-if="col.name === 'document'">
            <div v-if="props.row.type === BILL">Facture {{ props.row.billNumber }}</div>
            <div v-if="props.row.type === CREDIT_NOTE">Avoir {{ props.row.number }}</div>
          </template>
          <template v-else>{{ col.value }}</template>
        </q-td>
      </q-tr>
    </q-table>
  </q-card>
</template>

<script>
import { CREDIT_NOTE, BILL } from '../../data/constants';

export default {
  name: 'CustomerBillingTable',
  props: {
    documents: { type: Array, default: () => [] },
  },
  data () {
    return {
      CREDIT_NOTE,
      BILL,
      columns: [
        {
          name: 'date',
          label: 'Date',
          align: 'left',
          field: 'date',
          format: value => value ? this.$moment(value).format('DD/MM/YYYY') : '',
        },
        {
          name: 'document',
          label: 'Évènements',
          align: 'left',
        },
        {
          name: 'inclTaxes',
          label: 'Montant TTC',
          align: 'center',
          field: row => row.type === BILL ? row.netInclTaxes : row.inclTaxesCustomer,
        },
      ],
      pagination: {
        rowsPerPage: 0,
        sortBy: 'date',
        ascending: true,
      },
    }
  },
}
</script>
