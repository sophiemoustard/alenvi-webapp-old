<template>
  <q-page class="neutral-background">
    <div class="title layout-padding">
      <h4>À facturer</h4>
      <ni-date-range v-model="billingDates" @input="getDraftBills" />
    </div>
    <div class="q-pa-sm">
      <q-card class="q-mb-xl neutral-background" flat>
        <q-table :data="draftBills" :columns="columns" row-key="customerId" binary-state-sort :loading="tableLoading"
          :pagination.sync="pagination" separator="none" selection="multiple" :selected.sync="selected">
          <q-tr slot="header" slot-scope="props">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">{{ col.label }}</q-th>
            <q-th auto-width>
              <q-checkbox v-model="props.selected" indeterminate-value="some" />
            </q-th>
          </q-tr>
          <template slot="body" slot-scope="props">
            <ni-to-bill-row v-for="(bill, index) in props.row.customerBills.bills" :key="bill._id" :props="props"
              @discount:click="discountEdit($event, bill)" @datetime:input="refreshBill(props.row, bill)"
              @discount:input="computeTotalAmount(props.row.customerBills)" :index="index" :bill.sync="bill"
              display-checkbox />
            <q-tr v-if="props.row.customerBills.bills.length > 1" :props="props">
              <q-td colspan="10"><div class="text-right">Total :</div></q-td>
              <q-td colspan="1" align="center">{{ formatPrice(props.row.customerBills.total) }}</q-td>
              <q-td colspan="1" />
            </q-tr>
            <template v-if="props.row.thirdPartyPayerBills">
              <template v-for="tpp in props.row.thirdPartyPayerBills">
                <ni-to-bill-row v-for="bill in tpp.bills" :key="bill._id" :props="props" :bill="bill" display-checkbox
                  @discount:click="discountEdit($event, bill)" @datetime:input="refreshBill(props.row, bill)"
                  @discount:input="computeTotalAmount(tpp)" />
              </template>
            </template>
          </template>
          <ni-billing-pagination slot="bottom" slot-scope="props" :props="props" :pagination.sync="pagination" :data="draftBills"/>
        </q-table>
      </q-card>
    </div>
    <q-btn class="fixed fab-custom" :disable="!hasSelectedRows" no-caps rounded color="primary" icon="done"
      :label="totalToBillLabel" @click="createBills" />
  </q-page>
</template>

<script>
import ModalInput from '../../../components/form/ModalInput';
import DateRange from '../../../components/form/DateRange';
import ToBillRow from '../../../components/table/ToBillRow';
import BillingPagination from '../../../components/table/BillingPagination';
import { NotifyPositive, NotifyNegative } from '../../../components/popup/notify';
import { billingMixin } from '../../../mixins/billingMixin.js';

export default {
  name: 'ToBill',
  mixins: [billingMixin],
  components: {
    'ni-modal-input': ModalInput,
    'ni-to-bill-row': ToBillRow,
    'ni-date-range': DateRange,
    'ni-billing-pagination': BillingPagination,
  },
  data () {
    return {
      tableLoading: false,
      editDiscount: false,
      pagination: { rowsPerPage: 0 },
      billingDates: {
        startDate: null,
        endDate: null,
      },
      draftBills: [],
      selected: [],
      columns: [
        {
          name: 'externalBilling',
          label: 'Factu. externe',
          align: 'left',
        },
        {
          name: 'customer',
          label: 'Bénéficiaire',
          align: 'left',
          field: row => row.customer.identity.lastname,
        },
        {
          name: 'client',
          label: 'Client',
          align: 'left',
        },
        {
          name: 'startDate',
          label: 'Début F.',
          align: 'left',
        },
        {
          name: 'endDate',
          label: 'Fin F.',
          align: 'left',
        },
        {
          name: 'service',
          label: 'Service',
          align: 'left',
        },
        {
          name: 'hours',
          label: 'Décompte',
          align: 'center',
        },
        {
          name: 'unitExclTaxes',
          label: 'PU HT',
          align: 'center',
        },
        {
          name: 'discount',
          label: 'Remise',
          align: 'center',
        },
        {
          name: 'exclTaxes',
          label: 'HT',
          align: 'center',
        },
        {
          name: 'inclTaxes',
          label: 'TTC',
          align: 'center',
        },
      ],
    }
  },
  computed: {
    user () {
      return this.$store.getters['main/user'];
    },
    hasSelectedRows () {
      return this.selected.length > 0;
    },
    totalToBillLabel () {
      if (this.hasSelectedRows) {
        let total = 0;
        for (const row of this.selected) {
          if (row.customerBills) total += row.customerBills.total;
          if (row.thirdPartyPayerBills) {
            for (const bill of row.thirdPartyPayerBills) {
              total += bill.total;
            }
          }
        }
        return `Facturer ${total.toFixed(2)} €`;
      }
      return 'Facturer';
    },
  },
  async mounted () {
    this.setBillingDates();
    await this.getDraftBills();
  },
  methods: {
    formatPrice (value) {
      return value ? `${parseFloat(value).toFixed(2)}€` : '';
    },
    computeTotalAmount (data) {
      const total = data.bills.reduce((prev, next) => prev + (next.inclTaxes - next.discount), 0);
      data.total = total;
      return total;
    },
    discountEdit (event, bill) {
      bill.editDiscount = true;
      this.$nextTick(() => {
        event[0].focus();
      });
    },
    addEditDiscountToBills (bills) {
      return bills.map(bill => ({ ...bill, editDiscount: false }));
    },
    async getDraftBills (params) {
      try {
        if (!params) {
          params = {
            endDate: this.billingDates.endDate,
            billingStartDate: this.billingDates.startDate,
            billingPeriod: this.user.company.customersConfig.billingPeriod,
          }
        }
        if (!params.billingStartDate) params.billingStartDate = this.billingDates.startDate;
        if (!params.endDate) params.endDate = this.billingDates.endDate;
        if (!params.billingPeriod) params.billingPeriod = this.user.company.customersConfig.billingPeriod;

        this.tableLoading = true;
        const draftBills = await this.$bills.getDraftBills(params);
        this.draftBills = draftBills.map((draft) => {
          return {
            ...draft,
            customerBills: { total: draft.customerBills.total, bills: this.addEditDiscountToBills(draft.customerBills.bills) },
            ...(!!draft.thirdPartyPayerBills && {
              thirdPartyPayerBills: draft.thirdPartyPayerBills.map(tpp => ({ total: tpp.total, bills: this.addEditDiscountToBills(tpp.bills) }))
            }),
          }
        });
      } catch (e) {
        this.draftBills = [];
        console.error(e);
        NotifyNegative('Erreur lors du chargement des données à facturer');
      } finally {
        this.tableLoading = false;
      }
    },
    async createBills () {
      try {
        if (!this.hasSelectedRows) return;
        const bills = this.selected.map(row => this.$_.omit(row, ['__index']));
        await this.$bills.create({ bills });
        NotifyPositive('Clients facturés');
        await this.getDraftBills();
        this.selected = [];
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la facturation des clients');
      }
    },
    async refreshBill (row, bill) {
      try {
        const { customer, __index } = row;
        const { startDate, endDate } = bill;
        const draftBills = await this.$bills.getDraftBills({
          billingStartDate: startDate,
          startDate,
          endDate,
          billingPeriod: this.user.company.customersConfig.billingPeriod,
          customer: customer._id
        });
        this.draftBills.splice(__index, 1, ...draftBills);
        NotifyPositive('Date de début de facturation modifiée');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification de la date de début de facturation');
      }
    },
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .title
    display: flex;
    flex-direction: row;
    justify-content: space-between;

  .editable
    color: $primary
    cursor: pointer

  /deep/ .q-table
    border-collapse: separate
    & tbody tr.selected
      background: $white
    &-bottom > .q-icon
      display: none
</style>
