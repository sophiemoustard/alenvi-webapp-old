<template>
  <q-page class="neutral-background" padding>
    <h4>Balances Clients</h4>
    <div>
      <q-card class="q-mb-xl neutral-background" flat>
        <q-table :data="balances" :columns="columns" row-key="tableId" binary-state-sort :loading="tableLoading"
          :pagination.sync="pagination" selection="multiple" :selected.sync="selected">
          <q-tr slot="header" slot-scope="props">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">{{ col.label }}</q-th>
            <q-th auto-width>
              <q-checkbox v-model="props.selected" indeterminate-value="some" />
            </q-th>
          </q-tr>
          <template slot="body" slot-scope="props">
            <q-tr :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :props="props">
                <template v-if="col.name === 'client' || col.name === 'customer'">
                  <span class="uppercase text-weight-bold">{{ col.value }}</span>
                </template>
                <template v-else-if="col.name === 'actions'">
                  <div class="row no-wrap table-actions table-actions-margin">
                    <q-btn flat round small color="grey" icon="remove_red_eye" />
                    <q-btn flat round small color="grey" icon="add" />
                  </div>
                </template>
                <template v-else-if="col.name === 'balance'">
                  <div v-if="!isNegative(col.value)" class="row no-wrap items-center">
                    <q-icon name="mdi-plus-circle-outline" color="grey" class="balance-icon" />
                    <div>{{ col.value }}</div>
                  </div>
                  <div v-else-if="isNegative(col.value)" class="row no-wrap items-center">
                    <q-icon name="mdi-minus-circle-outline" color="secondary" class="balance-icon" />
                    <div>{{ col.value.slice(1) }}</div>
                  </div>
                  <div v-else>{{ col.value }}</div>
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
              <q-td auto-width>
                <q-checkbox v-model="props.selected" />
              </q-td>
            </q-tr>
          </template>
          <ni-billing-pagination slot="bottom" slot-scope="props" :props="props" :pagination.sync="pagination" :data="balances" />
        </q-table>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import BillingPagination from '../../../components/table/BillingPagination';

export default {
  name: 'ClientsBalances',
  components: {
    'ni-billing-pagination': BillingPagination
  },
  data () {
    return {
      tableLoading: false,
      selected: [],
      balances: [],
      pagination: { rowsPerPage: 0 },
      columns: [
        {
          name: 'client',
          label: 'Client',
          align: 'left',
          field: row => row.thirdPartyPayer ? row.thirdPartyPayer.name : row.customer.identity.lastname,
          format: val => val.length > 30 ? `${val.slice(0, 30)}...` : val,
        },
        {
          name: 'customer',
          label: 'Bénéficiaire',
          align: 'left',
          field: row => row.customer.identity.lastname,
        },
        {
          name: 'billed',
          label: 'Facturé TTC',
          align: 'left',
          field: row => row.billed,
          format: val => this.formatPrices(val),
        },
        {
          name: 'paid',
          label: 'Payé TTC',
          align: 'left',
          field: row => row.paid,
          format: val => this.formatPrices(val),
        },
        {
          name: 'balance',
          label: 'Solde',
          align: 'left',
          field: row => row.balance,
          format: val => this.formatPrices(val),
        },
        {
          name: 'toPay',
          label: 'A Prélever',
          align: 'left',
          field: row => this.formatPrices(row.toPay),
        },
        {
          name: 'actions',
          label: '',
          align: 'left',
        },
      ],
    }
  },
  computed: {
  },
  async mounted () {
    await this.getBalances();
  },
  methods: {
    formatPrices (val) {
      return val ? `${val.toFixed(2)} €` : '0 €';
    },
    isNegative (val) {
      return val[0] === '-';
    },
    canWithDraw (row) {
      return !row.thirdPartyPayer && row.customer.payment && row.customer.payment.iban;
    },
    async getBalances () {
      try {
        this.tableLoading = true;
        this.balances = await this.$balances.showAll();
      } catch (e) {
        console.error(e);
      } finally {
        this.tableLoading = false;
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  /deep/ .q-table
    & tbody tr.selected
      background: $white
    &-bottom > .q-icon
      display: none

  .balance-icon
    margin-right: 4px

</style>
