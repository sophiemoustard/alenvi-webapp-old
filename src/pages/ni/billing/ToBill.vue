<template>
  <q-page class="neutral-background" padding>
    <h4>À facturer</h4>
    <div class="q-mb-xl">
      <q-card style="background: white">
        <q-table :data="draftBills" :columns="columns" row-key="name" hide-bottom binary-state-sort :pagination.sync="pagination" />
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { MONTH } from '../../../data/constants';

export default {
  name: 'ToBill',
  components: {},
  data () {
    return {
      pagination: { rowsPerPage: 0 },
      draftBills: [],
      columns: [
        {
          name: 'toBill',
          label: 'Status',
          align: 'left',
          field: '_id',
        },
        {
          name: 'customer',
          label: 'Bénéficiaire',
          align: 'left',
          field: row => `${row.identity.lastname}`,
        },
        {
          name: 'client',
          label: 'Client',
          align: 'left',
          field: row => `${row.identity.lastname}`,
        },
        {
          name: 'startDate',
          label: 'Début F.',
          align: 'left',
          field: row => row.startDate ? this.$moment(row.startDate).format('DD/MM/YYYY') : '',
        },
        {
          name: 'endDate',
          label: 'Fin F.',
          align: 'left',
          field: row => row.endDate ? this.$moment(row.endDate).format('DD/MM/YYYY') : '',
        },
        {
          name: 'service',
          label: 'Service',
          align: 'left',
          field: row => row.subscription.service.versions[row.subscription.service.versions.length - 1].name,
        },
        {
          name: 'hours',
          label: 'Décompte',
          align: 'center',
          field: 'hours',
          format: value => value ? `${value}h` : '',
        },
        {
          name: 'unitPreTaxPrice',
          label: 'PU HT',
          align: 'center',
          field: 'unitPreTaxPrice',
          format: value => value ? `${parseFloat(value).toFixed(2)}€` : '',
        },
        {
          name: 'discount',
          label: 'Remise',
          align: 'center',
          field: 'discount',
        },
        {
          name: 'preTaxPrice',
          label: 'HT',
          align: 'center',
          field: 'preTaxPrice',
          format: value => value ? `${parseFloat(value).toFixed(2)}€` : '',
        },
        {
          name: 'withTaxPrice',
          label: 'TTC',
          align: 'center',
          field: 'withTaxPrice',
          format: value => value ? `${parseFloat(value).toFixed(2)}€` : '',
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
      });
    } catch (e) {
      this.draftBills = [];
      console.error(e);
    }
  },
  methods: {},
}
</script>

<style lang="stylus" scoped>

  .layout-padding
    padding: 2rem 3rem;

</style>
