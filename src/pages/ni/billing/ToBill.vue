<template>
  <q-page class="neutral-background">
    <h4>À facturer</h4>
    <div class="q-mb-xl">
      <q-card style="background: white">
        <q-table :data="draftBills" :columns="columns" row-key="_id" hide-bottom binary-state-sort :pagination.sync="pagination" separator="none"
          selection="multiple" :selected.sync="selected">

          <q-tr slot="header" slot-scope="props">
            <q-th auto-width>
              <q-checkbox v-model="props.selected" indeterminate-value="some" />
            </q-th>
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
          </q-tr>

          <template slot="body" slot-scope="props">
            <q-tr v-for="(bill, index) in props.row.bills" :key="bill._id" :props="props" :class="{'datatable-row-border-top': index === 0 }">
              <q-td auto-width>
                <q-checkbox v-if="props.row.bills.length === 1" v-model="props.selected" />
              </q-td>
              <q-td v-for="col in props.cols" :key="col.name" :props="props">
                <template v-if="index === 0 && (col.name === 'startDate' || col.name === 'endDate')">{{ formatDate(bill[col.name]) }}</template>
                <template v-else-if="col.name === 'service'">{{ bill.subscription.service.versions[bill.subscription.service.versions.length - 1].name }}</template>
                <template v-else-if="col.name === 'hours'">{{ formatHours(bill.hours) }}</template>
                <template v-else-if="col.name === 'unitPreTaxPrice'">{{ formatPrice(bill.unitPreTaxPrice) }}</template>
                <template v-else-if="col.name === 'discount'">
                  <ni-modal-input v-model="bill.discount" suffix="%" :margin-input="false" no-q-field />
                </template>
                <template v-else-if="col.name === 'preTaxPrice'">{{ formatPrice(bill.preTaxPrice) }}</template>
                <template v-else-if="col.name === 'withTaxPrice'">{{ formatPrice(bill.withTaxPrice) }}</template>
                <template v-else-if="index === 0">{{ col.value }}</template>
              </q-td>
            </q-tr>

            <q-tr v-if="props.row.bills.length > 1" :props="props">
              <q-td auto-width>
                <q-checkbox v-model="props.selected" />
              </q-td>
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
                <template v-if="col.name === 'preTaxPrice'">Total :</template>
                <template v-if="col.name === 'withTaxPrice'">{{ formatPrice(props.row.total) }}</template>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { MONTH } from '../../../data/constants';
import ModalInput from '../../../components/form/ModalInput';

export default {
  name: 'ToBill',
  components: {
    'ni-modal-input': ModalInput
  },
  data () {
    return {
      editDiscount: false,
      pagination: { rowsPerPage: 0 },
      draftBills: [],
      selected: [],
      columns: [
        {
          name: 'status',
          label: 'Status',
          align: 'left',
          field: '_id',
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
          field: row => row.bills && row.bills[0] && row.bills[0].thirdPartyPayer
            ? row.bills[0].thirdPartyPayer.name
            : row.customer.identity.lastname,
        },
        {
          name: 'startDate',
          label: 'Début F.',
          align: 'left',
          field: row => row.bills,
        },
        {
          name: 'endDate',
          label: 'Fin F.',
          align: 'left',
          field: row => row.bills,
        },
        {
          name: 'service',
          label: 'Service',
          align: 'left',
          field: row => row.bills,
        },
        {
          name: 'hours',
          label: 'Décompte',
          align: 'center',
          field: row => row.bills,
        },
        {
          name: 'unitPreTaxPrice',
          label: 'PU HT',
          align: 'center',
          field: row => row.bills,
        },
        {
          name: 'discount',
          label: 'Remise',
          align: 'center',
          field: row => row.bills,
        },
        {
          name: 'preTaxPrice',
          label: 'HT',
          align: 'center',
          field: row => row.bills,
        },
        {
          name: 'withTaxPrice',
          label: 'TTC',
          align: 'center',
          field: row => row.bills,
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
      this.draftBills = this.draftBills.map(bill => ({ ...bill, editDiscount: false }));
    } catch (e) {
      this.draftBills = [];
      console.error(e);
    }
  },
  methods: {
    formatPrice (value) {
      return value ? `${parseFloat(value).toFixed(2)}€` : '';
    },
    formatHours (value) {
      return value ? `${parseFloat(value).toFixed(2)}h` : '';
    },
    formatDate (value) {
      return value ? `${this.$moment(value).format('DD/MM/YY')}` : '';
    }
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

</style>
