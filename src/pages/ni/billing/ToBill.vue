<template>
  <q-page class="neutral-background">
    <h4 class="layout-padding">À facturer</h4>
    <div class="q-mb-xl q-pa-sm">
      <q-card class="neutral-background" flat>
        <q-table :data="draftBills" :columns="columns" row-key="customerId" binary-state-sort :pagination.sync="pagination" separator="none"
          selection="multiple" :selected.sync="selected">

          <q-tr slot="header" slot-scope="props">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
            <q-th auto-width>
              <q-checkbox v-model="props.selected" indeterminate-value="some" />
            </q-th>
          </q-tr>

          <template slot="body" slot-scope="props">
            <ni-to-bill-row  v-for="(bill, index) in props.row.customerBills.bills" :key="bill._id" :props="props" :index="index" :bill.sync="bill" display-checkbox
              @click="discountEdit($event, bill)" />

            <q-tr v-if="props.row.customerBills.bills.length > 1" :props="props">
              <q-td colspan="10">
                <div class="text-right">Total :</div>
              </q-td>
              <q-td colspan="2">
                {{ formatPrice(props.row.customerBills.total) }}
              </q-td>
            </q-tr>

            <template v-if="props.row.thirdPartyPayerBills">
              <ni-to-bill-row  v-for="bill in props.row.thirdPartyPayerBills.bills" :key="bill._id" :props="props" :bill="bill" @click="discountEdit($event, bill)"/>
            </template>
          </template>

          <div slot="bottom" slot-scope="props" class="row justify-between full-width">
            <div class="row items-center">
              <q-btn-toggle class="on-left no-shadow" v-model="pagination.rowsPerPage" :options="rowsPerPageOptions"
                toggle-text-color="primary" toggle-color="white" no-caps dense size="md" />
              <div>Eléments par page</div>
            </div>
            <div class="row items-center">
              <div class="on-left">{{ paginationLabel }}</div>
              <div>
                <q-btn icon="chevron_left" class="no-shadow" :disable="props.isFirstPage" @click="props.prevPage" size="md" dense />
                <q-btn icon="chevron_right" class="no-shadow" :disable="props.isLastPage" @click="props.nextPage" size="md" dense />
              </div>
            </div>
          </div>
        </q-table>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { MONTH } from '../../../data/constants';
import ModalInput from '../../../components/form/ModalInput';
import ToBillRow from '../../../components/table/ToBillRow';

export default {
  name: 'ToBill',
  components: {
    'ni-modal-input': ModalInput,
    'ni-to-bill-row': ToBillRow
  },
  data () {
    return {
      editDiscount: false,
      pagination: { rowsPerPage: 0 },
      rowsPerPageOptions: [
        { label: '25', value: 25 },
        { label: '50', value: 50 },
        { label: '100', value: 100 },
        { label: 'Tous', value: 0 },
      ],
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
    billingPeriod () {
      const billingPeriod = this.user.company.customersConfig.billingPeriod;
      if (billingPeriod === MONTH) {
        return {
          endDate: this.$moment().subtract(1, 'M').endOf('month'),
          startDate: this.$moment().subtract(1, 'M').startOf('month'),
        };
      }

      return {
        endDate: this.$moment().date() > 15 ? this.$moment().date(15).hour(23).minute(59)
          : this.$moment().endOf('month').hour(23).minute(59),
        startDate: this.$moment().date() > 15 ? this.$moment().date(1).hour(0).minute(0)
          : this.$moment().date(16).hour(0).minute(0),
      }
    },
    firstRowIndex () {
      const { page, rowsPerPage } = this.pagination;
      return (page - 1) * rowsPerPage;
    },
    lastRowIndex () {
      const { page, rowsPerPage } = this.pagination;
      return page * rowsPerPage;
    },
    computedRowNumber () {
      if (this.pagination.rowsPerPage) {
        return this.draftBills.slice(this.firstRowIndex, this.lastRowIndex).length + this.firstRowIndex;
      }
      return this.draftBills.length;
    },
    paginationLabel () {
      const { rowsPerPage } = this.pagination;
      return rowsPerPage
        ? `${this.firstRowIndex + 1}-${Math.min(this.lastRowIndex, this.computedRowNumber)} de ${this.draftBills.length}`
        : `1-${this.draftBills.length} de ${this.draftBills.length}`;
    },
  },
  async mounted () {
    try {
      this.draftBills = await this.$bills.getDraftBills({
        endDate: this.billingPeriod.endDate.toDate(),
        startDate: this.billingPeriod.startDate.toDate(),
        billingPeriod: this.user.company.customersConfig.billingPeriod,
      });
      this.draftBills = this.draftBills.map((draft) => {
        return {
          ...draft,
          customerBills: { total: draft.customerBills.total, bills: this.addEditDiscountToBills(draft.customerBills.bills) },
          ...(!!draft.thirdPartyPayerBills && {
            thirdPartyPayerBills:
            { total: draft.thirdPartyPayerBills.total, bills: this.addEditDiscountToBills(draft.thirdPartyPayerBills.bills) }
          }),
        }
      });
    } catch (e) {
      this.draftBills = [];
      console.error(e);
    }
  },
  methods: {
    formatPrice (value) {
      return value ? `${parseFloat(value).toFixed(2)}€` : '';
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
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .layout-padding
    padding: 2rem 3rem;

  .editable
    color: $primary
    cursor: pointer

  /deep/ .q-table
    & tbody tr.selected
      background: $white

  /deep/ .datatable-inner-input
    width: auto
    min-width: 60px

  /deep/ .q-btn-group
    & button .q-btn-inner
      font-size: 12px
    & > .q-btn-item:first-child
      border: 1px solid rgba(0,0,0,0.12)
    & > .q-btn-item:not(:last-child)
      border-top: 1px solid rgba(0,0,0,0.12)
      border-right: 1px solid rgba(0,0,0,0.12)
      border-bottom: 1px solid rgba(0,0,0,0.12)
    & > .q-btn-item:last-child
      border-top: 1px solid rgba(0,0,0,0.12)
      border-right: 1px solid rgba(0,0,0,0.12)
      border-bottom: 1px solid rgba(0,0,0,0.12)
      font-weight: bold

</style>
