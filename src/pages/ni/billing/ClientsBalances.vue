<template>
  <q-page class="neutral-background" padding>
    <h4>Balances Clients</h4>
    <div>
      <q-card class="q-mb-xl neutral-background" flat>
        <q-table :data="balances" :columns="columns" row-key="rowId" binary-state-sort :loading="tableLoading"
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
                    <q-btn flat round small color="grey" icon="remove_red_eye" @click="goToCustomerBillingPage(col.value)" />
                    <q-btn flat round small color="grey" icon="add" @click="openPaymentCreationModal(props.row)" />
                  </div>
                </template>
                <template v-else-if="col.name === 'balance'">
                  <ni-prefixed-cell-content :cell-value="col.value" />
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

    <!-- Payment creation modal -->
    <ni-payment-creation-modal :newPayment="newPayment" :validations="$v.newPayment" :selectedClient="selectedClient"
      @createPayment="createPayment" :creationModal="paymentCreationModal" :selectedCustomer="selectedCustomer"
      :loading="creationLoading" @resetForm="resetPaymentCreationModal"  />
  </q-page>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import BillingPagination from '../../../components/table/BillingPagination';
import PrefixedCellContent from '../../../components/table/PrefixedCellContent';
import PaymentCreationModal from '../../../components/customers/PaymentCreationModal';
import { PAYMENT } from '../../../data/constants';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '../../../components/popup/notify';

export default {
  name: 'ClientsBalances',
  components: {
    'ni-billing-pagination': BillingPagination,
    'ni-prefixed-cell-content': PrefixedCellContent,
    'ni-payment-creation-modal': PaymentCreationModal,
  },
  data () {
    return {
      creationLoading: false,
      tableLoading: false,
      selected: [],
      balances: [],
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
          field: row => row.customer._id,
        },
      ],
      pagination: {
        sortBy: 'customer',
        ascending: true,
        rowsPerPage: 0,
      },
      paymentCreationModal: false,
      selectedCustomer: '',
      selectedClient: '',
      newPayment: {
        nature: PAYMENT,
        customer: null,
        client: null,
        netInclTaxes: 0,
        type: '',
        date: '',
      }
    }
  },
  validations: {
    newPayment: {
      netInclTaxes: { required },
      type: { required },
      date: { required },
    }
  },
  async mounted () {
    await this.getBalances();
  },
  methods: {
    formatPrices (val) {
      return val ? `${val.toFixed(2)} €` : '0 €';
    },
    goToCustomerBillingPage (customerId) {
      this.$router.replace({ name: 'customers profile', params: { id: customerId, defaultTab: 'billing' } });
    },
    async getBalances () {
      try {
        this.tableLoading = true;
        this.balances = await this.$balances.showAll();
        this.balances = this.balances.map(balance => ({ ...balance, rowId: this.$_.uniqueId() }))
      } catch (e) {
        this.balances = [];
        console.error(e);
      } finally {
        this.tableLoading = false;
      }
    },
    openPaymentCreationModal (row) {
      this.selectedCustomer = row.customer.identity.lastname;
      this.selectedClient = row._id.tpp ? row.thirdPartyPayer.name : row.customer.identity.lastname;
      this.newPayment.customer = row._id.customer;
      this.newPayment.nature = PAYMENT;
      this.newPayment.client = row._id.tpp ? row._id.tpp : row._id.customer;
      this.paymentCreationModal = true;
    },
    resetPaymentCreationModal () {
      this.paymentCreationModal = false;
      this.selectedCustomer = '';
      this.selectedClient = '';
      this.newPayment = {
        nature: PAYMENT,
        customer: null,
        client: null,
        netInclTaxes: 0,
        type: '',
        date: '',
      };
    },
    async createPayment () {
      try {
        this.creationLoading = true;
        this.$v.newPayment.$touch();
        if (this.$v.newPayment.$error) return NotifyWarning('Champ(s) invalide(s)');
        if (this.newPayment.customer === this.newPayment.client) delete this.newPayment.client;
        await this.$payments.create(this.newPayment);
        NotifyPositive('Règlement créé');
        await this.getBalances();
        this.paymentCreationModal = false;
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création du règlement');
      } finally {
        this.creationLoading = false;
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

</style>
