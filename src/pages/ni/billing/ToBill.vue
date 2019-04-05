<template>
  <q-page class="neutral-background">
    <h4>À facturer</h4>
    <div class="q-mb-xl">
      <q-card style="background: white">
        <q-table :data="draftBills" :columns="columns" row-key="customerId" hide-bottom binary-state-sort :pagination.sync="pagination" separator="none"
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
  },
  async mounted () {
    try {
      this.draftBills = await this.$bills.getDraftBills({
        endDate: this.billingPeriod.endDate.toDate(),
        startDate: this.billingPeriod.startDate.toDate(),
        billingPeriod: this.user.company.customersConfig.billingPeriod,
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

  /deep/ .datatable-inner-input
    width: auto
    min-width: 60px

</style>
