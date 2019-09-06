<template>
  <q-table :data="documents" :columns="columns" binary-state-sort hide-bottom :pagination.sync="pagination"
    class="q-mb-lg">
    <q-tr slot="top-row" slot-scope="props">
      <q-td class="bold">{{ formatDate(billingDates.startDate) }}</q-td>
      <q-td class="bold">Début de période</q-td>
      <q-td />
      <td class="bold" align="center">{{ formatPrice(startBalance) }}</td>
      <q-td />
    </q-tr>
    <q-tr v-if="Object.keys(documents).length > 0" slot="body" slot-scope="props" :props="props">
      <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
        <template v-if="col.name === 'document'">
          <template v-if="props.row.type === BILL">
            <div :class="{'download': canDownloadBill(props.row)}">
              <a v-if="props.row.driveFile && props.row.driveFile.link" :href="props.row.driveFile.link" target="_blank">
                Facture {{ props.row.number || 'tiers' }}
              </a>
              <div v-else @click="downloadBillPdf(props.row)">
                Facture {{ props.row.number || 'tiers' }}
              </div>
            </div>
          </template>
          <template  v-else-if="props.row.type === CREDIT_NOTE">
            <div :class="{'download': canDownloadCreditNote(props.row)}">
              <a v-if="props.row.driveFile && props.row.driveFile.link" :href="props.row.driveFile.link" target="_blank">
                Avoir {{ props.row.number }}
              </a>
              <div v-else @click="downloadCreditNotePdf(props.row)">
                Avoir {{ props.row.number }}
              </div>
            </div>
          </template>
          <div v-else>{{ getPaymentTitle(props.row) }}</div>
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
          <q-btn v-if="displayActions && paymentTypes.includes(props.row.type)" flat dense color="grey" icon="edit"
            @click="openEditionModal(props.row)" />
        </template>
        <template v-else>{{ col.value }}</template>
      </q-td>
    </q-tr>
    <q-tr slot="bottom-row" slot-scope="props">
      <q-td class="bold">{{ formatDate(billingDates.endDate) }}</q-td>
      <q-td class="bold">Fin de période</q-td>
      <q-td />
      <td class="bold" align="center">{{ formatPrice(endBalance) }}</td>
      <q-td />
    </q-tr>
  </q-table>
</template>

<script>
import {
  CREDIT_NOTE,
  BILL,
  BANK_TRANSFER,
  DIRECT_DEBIT,
  CHECK,
  CESU,
  REFUND,
  PAYMENT_OPTIONS,
  CUSTOMER,
  PAYMENT,
  COMPANI,
} from '../../data/constants';
import { NotifyNegative, NotifyPositive } from '../popup/notify.js';
import { downloadPdf } from '../../helpers/downloadFile.js';
import { formatPrice } from '../../helpers/utils';

export default {
  name: 'CustomerBillingTable',
  props: {
    documents: { type: Array, default: () => [] },
    billingDates: { type: Object, default: () => ({}) },
    displayActions: { type: Boolean, default: false },
    type: { type: String, default: CUSTOMER },
    startBalance: { type: Number, default: 0 },
    endBalance: { type: Number, default: 0 },
  },
  data () {
    return {
      CREDIT_NOTE,
      BILL,
      COMPANI,
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
          format: value => formatPrice(value),
        },
        {
          name: 'balance',
          label: 'Solde',
          align: 'center',
          field: 'balance',
          format: value => formatPrice(value),
        },
        {
          name: 'actions',
          label: '',
          align: 'center',
        },
      ],
      pagination: { rowsPerPage: 0 },
      paymentTypes: PAYMENT_OPTIONS.map(op => op.value),
    }
  },
  methods: {
    getPaymentTitle (payment) {
      const titlePrefix = payment.nature === PAYMENT ? `Paiement ${payment.number}` : `Remboursement ${payment.number}`;
      const paymentOption = PAYMENT_OPTIONS.find(opt => opt.value === payment.type);
      const typeLabel = paymentOption ? ` (${paymentOption.label})` : '';
      return `${titlePrefix}${typeLabel}`;
    },
    formatDate (value) {
      return value ? `${this.$moment(value).format('DD/MM/YY')}` : '';
    },
    formatPrice (value) {
      return formatPrice(value);
    },
    isNegative (val) {
      return val[0] === '-';
    },
    getInclTaxes (doc) {
      switch (doc.type) {
        case BILL:
          return -doc.netInclTaxes;
        case CREDIT_NOTE:
          return this.type === CUSTOMER ? doc.inclTaxesCustomer : doc.inclTaxesTpp;
        case BANK_TRANSFER:
        case DIRECT_DEBIT:
        case CHECK:
        case CESU:
          if (doc.nature === REFUND) return -doc.netInclTaxes;
          return doc.netInclTaxes;
      }
    },
    openEditionModal (payment) {
      this.$emit('openEditionModal', payment);
    },
    async downloadBillPdf (bill) {
      try {
        if (!this.canDownloadBill(bill)) return;

        const pdf = await this.$bills.getPDF(bill._id);
        await downloadPdf(pdf, `${bill.number}.pdf`);

        NotifyPositive('Facture téléchargée');
      } catch (e) {
        console.error(e);
        NotifyNegative('Impossible de télécharger la facture');
      }
    },
    canDownloadBill (bill) {
      return (bill.number && bill.origin === COMPANI) || (bill.driveFile && bill.driveFile.link);
    },
    canDownloadCreditNote (creditNote) {
      return (creditNote.number && creditNote.origin === COMPANI) || (creditNote.driveFile && creditNote.driveFile.link);
    },
    async downloadCreditNotePdf (creditNote) {
      try {
        if (!this.canDownloadCreditNote(creditNote)) return;

        const pdf = await this.$creditNotes.getPDF(creditNote._id);
        await downloadPdf(pdf, `${creditNote.number}.pdf`);

        NotifyPositive('Avoir téléchargé');
      } catch (e) {
        console.error(e);
        NotifyNegative('Impossible de télécharger l\'avoir');
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
@import '~variables'

  .bold
    font-weight bold;

  .q-table tbody tr:hover
    background: none;

  .q-btn
    height: 100%;

  .download
    cursor: pointer;
    color: $primary;
    text-decoration underline;

</style>
