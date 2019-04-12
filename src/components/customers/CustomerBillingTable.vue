<template>
  <q-card v-if="Object.keys(documents).length > 0" class="q-mb-lg neutral-background" flat>
    <q-table :data="documents" :columns="columns" binary-state-sort>
      <q-tr slot="top-row" slot-scope="props">
        <q-td>{{ formatDate(billingDates.startDate) }}</q-td>
        <q-td>Début de période</q-td>
        <q-td />
      </q-tr>
      <q-tr slot="body" slot-scope="props" :props="props">
        <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
          <template v-if="col.name === 'document'">
            <div v-if="props.row.type === BILL">Facture {{ props.row.billNumber }}</div>
            <div v-if="props.row.type === CREDIT_NOTE">Avoir {{ props.row.number }}</div>
          </template>
          <template v-else>{{ col.value }}</template>
        </q-td>
      </q-tr>
      <q-tr slot="bottom-row" slot-scope="props">
        <q-td>{{ formatDate(billingDates.endDate) }}</q-td>
        <q-td>Fin de période</q-td>
        <q-td />
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
    billingDates: { type: Object, default: () => ({}) },
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
          format: value => this.formatPrice(value),
        },
      ],
    }
  },
  methods: {
    formatPrice (value) {
      return value ? `${parseFloat(value).toFixed(2)}€` : '';
    },
    formatDate (value) {
      return value ? `${this.$moment(value).format('DD/MM/YY')}` : '';
    },
  }
}
</script>
