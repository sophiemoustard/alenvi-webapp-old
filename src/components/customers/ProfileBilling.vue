<template>
  <div class="q-pa-sm">
    <q-card v-if="Object.keys(billingDocuments).length > 0" class="q-mb-xl neutral-background" flat>
      <q-table :data="billingDocuments" :columns="columns" binary-state-sort :pagination.sync="pagination">
        <q-tr slot="body" slot-scope="props" :props="props">
          <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
            <template v-if="col.name === 'document'">
              <div v-if="props.row.type === BILL">Facture {{ props.row.billNumber }}</div>
              <div v-if="props.row.type === CREDIT_NOTE">Avoir {{ props.row.number }}</div>
            </template>
            <template v-if="col.name === 'actions'">
              <div class="row no-wrap table-actions table-actions-margin">
              </div>
            </template>
            <template v-else>{{ col.value }}</template>
          </q-td>
        </q-tr>
      </q-table>
    </q-card>
  </div>
</template>

<script>
import { CREDIT_NOTE, BILL } from '../../data/constants';
export default {
  name: 'ProfileBilling',
  data () {
    return {
      CREDIT_NOTE,
      BILL,
      billingDocuments: [],
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
          label: 'Évènemnts',
          align: 'left',
        },
        {
          name: 'inclTaxes',
          label: 'Montant TTC',
          align: 'center',
          field: row => row.type === BILL ? row.netInclTaxes : row.inclTaxesCustomer,
        },
        {
          name: 'actions',
          label: '',
          align: 'left',
        },
      ],
      pagination: {
        rowsPerPage: 0,
        sortBy: 'date',
        ascending: true,
      },
    }
  },
  computed: {
    userProfile () {
      return this.$store.getters['rh/getUserProfile'];
    },
  },
  async mounted () {
    await Promise.all([this.getBills(), this.getCreditNotes()]);
  },
  methods: {
    async getBills () {
      try {
        const bills = await this.$bills.showAll({ customer: this.userProfile._id });
        this.billingDocuments.push(...bills.map(bill => ({ ...bill, type: BILL })));
      } catch (e) {
        console.error(e)
      }
    },
    async getCreditNotes () {
      try {
        const creditNotes = await this.$creditNotes.showAll({ customer: this.userProfile._id });
        this.billingDocuments.push(...creditNotes.map(cn => ({ ...cn, type: CREDIT_NOTE })));
      } catch (e) {
        console.error(e)
      }
    },
  },
}
</script>

<style lang="stylus" scoped>

</style>
