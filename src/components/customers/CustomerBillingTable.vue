<template>
  <q-card v-if="Object.keys(documents).length > 0" class="q-mb-lg neutral-background" flat>
    <q-table :data="documents" :columns="columns" binary-state-sort hide-bottom>
      <q-tr slot="top-row" slot-scope="props">
        <q-td class="bold">{{ formatDate(billingDates.startDate) }}</q-td>
        <q-td class="bold">Début de période</q-td>
        <q-td />
        <td class="bold" align="center">{{ formatPrice(startBalance) }}</td>
        <q-td />
      </q-tr>
      <q-tr slot="body" slot-scope="props" :props="props">
        <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
          <template v-if="col.name === 'document'">
            <div v-if="props.row.type === BILL">Facture {{ props.row.billNumber }}</div>
            <div v-else-if="props.row.type === CREDIT_NOTE">Avoir {{ props.row.number }}</div>
            <div v-else>Paiement {{ props.row.number }}</div>
          </template>
          <template v-else-if="col.name === 'balance'">
            <div v-if="!isNegative(col.value)" class="row no-wrap items-center justify-center">
              <q-icon name="mdi-plus-circle-outline" color="grey" class="balance-icon" />
              <div>{{ col.value }}</div>
            </div>
            <div v-else-if="isNegative(col.value)" class="row no-wrap items-center justify-center">
              <q-icon name="mdi-minus-circle-outline" color="secondary" class="balance-icon" />
              <div>{{ col.value.substring(1) }}</div>
            </div>
            <div v-else>{{ col.value }}</div>
          </template>
          <template v-else-if="col.name === 'actions'">
            <q-btn v-if="displayActions && paymentTypes.includes(props.row.type)" flat small color="grey" icon="edit"
              @click="openEditionModal(props.row)" />
          </template>
          <template v-else>{{ col.value }}</template>
        </q-td>
      </q-tr>
      <q-tr slot="bottom-row" slot-scope="props">
        <q-td class="bold">{{ formatDate(billingDates.endDate) }}</q-td>
        <q-td class="bold">Fin de période</q-td>
        <q-td />
        <td class="bold" align="center">{{ formatPrice(periodBalance) }}</td>
        <q-td />
      </q-tr>
    </q-table>
  </q-card>
</template>

<script>
import { CREDIT_NOTE, BILL, BANK_TRANSFER, WITHDRAWAL, CHECK, CESU, REFUND, PAYMENT_OPTIONS } from '../../data/constants';

export default {
  name: 'CustomerBillingTable',
  props: {
    documents: { type: Array, default: () => [] },
    billingDates: { type: Object, default: () => ({}) },
    displayActions: { type: Boolean, default: false },
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
          label: '',
          align: 'left',
        },
        {
          name: 'inclTaxes',
          label: 'Montant TTC',
          align: 'center',
          field: row => this.getInclTaxes(row),
          format: value => this.formatPrice(value),
        },
        {
          name: 'balance',
          label: 'Solde',
          align: 'center',
          field: 'balance',
          format: value => this.formatPrice(value),
        },
        {
          name: 'actions',
          label: '',
          align: 'center',
        },
      ],
      paymentTypes: PAYMENT_OPTIONS.map(op => op.value),
    }
  },
  computed: {
    periodBalance () {
      if (!this.documents || this.documents.length === 0) return 0;
      return this.documents[this.documents.length - 1].balance;
    },
    startBalance () {
      if (this.documents.length === 0) return 0;
      switch (this.documents[0].type) {
        case BILL:
          return this.documents[0].balance + this.documents[0].netInclTaxes;
        case CREDIT_NOTE:
          return this.documents[0].balance - this.documents[0].inclTaxesCustomer;
        case BANK_TRANSFER:
        case WITHDRAWAL:
        case CHECK:
        case CESU:
          if (this.documents[0].nature === REFUND) return this.documents[0].balance + this.documents[0].netInclTaxes;
          return this.documents[0].balance - this.documents[0].netInclTaxes;
      }
    },
  },
  methods: {
    formatPrice (value) {
      return value || value === 0 ? `${parseFloat(value).toFixed(2)}€` : '';
    },
    formatDate (value) {
      return value ? `${this.$moment(value).format('DD/MM/YY')}` : '';
    },
    isNegative (val) {
      return val[0] === '-';
    },
    getInclTaxes (doc) {
      switch (doc.type) {
        case BILL:
          return -doc.netInclTaxes;
        case CREDIT_NOTE:
          return doc.inclTaxesCustomer;
        case BANK_TRANSFER:
        case WITHDRAWAL:
        case CHECK:
        case CESU:
          if (doc.nature === REFUND) return -doc.netInclTaxes;
          return doc.netInclTaxes;
      }
    },
    openEditionModal (payment) {
      this.$emit('openEditionModal', payment);
    }
  }
}
</script>

<style lang="stylus" scoped>

  .bold
    font-weight bold;

  .q-table tbody tr:hover
    background: none;

  .q-btn
    height: 100%
</style>
