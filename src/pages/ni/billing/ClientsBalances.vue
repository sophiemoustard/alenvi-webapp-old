<template>
  <q-page class="neutral-background" padding>
    <h4>Balances Clients</h4>
    <div>
      <q-card class="q-mb-xl neutral-background" flat>
        <q-table :data="balances" :columns="columns" row-key="rowId" binary-state-sort :loading="tableLoading"
          :pagination.sync="pagination" selection="multiple" :selected.sync="selected" >
          <q-tr slot="header" slot-scope="props">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">{{ col.label }}</q-th>
            <q-th auto-width>
              <q-checkbox @input="selectRows(props.selected)" v-model="props.selected" indeterminate-value="some" />
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
                    <q-btn flat round small color="grey" icon="add" @click="openPaymentCreationModal(props.row.customer, props.row.thirdPartyPayer)" />
                  </div>
                </template>
                <template v-else-if="col.name === 'balance'">
                  <ni-prefixed-cell-content :cell-value="col.value" />
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
              <q-td v-if="props.row.toPay > 0" auto-width>
                <q-checkbox v-model="props.selected" />
              </q-td>
              <q-td v-else />
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

    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Créer les prélèvements" :disable="selected.length === 0" @click="createPayments" />
  </q-page>
</template>

<script>
import BillingPagination from '../../../components/table/BillingPagination';
import PrefixedCellContent from '../../../components/table/PrefixedCellContent';
import PaymentCreationModal from '../../../components/customers/PaymentCreationModal';
import { paymentMixin } from '../../../mixins/paymentMixin.js';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '../../../components/popup/notify';
import { formatPrice, getLastVersion } from '../../../helpers/utils.js';

export default {
  name: 'ClientsBalances',
  components: {
    'ni-billing-pagination': BillingPagination,
    'ni-prefixed-cell-content': PrefixedCellContent,
    'ni-payment-creation-modal': PaymentCreationModal,
  },
  mixins: [paymentMixin],
  data () {
    return {
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
          field: row => this.getCustomerName(row.customer),
        },
        {
          name: 'billed',
          label: 'Facturé TTC',
          align: 'left',
          field: row => row.billed,
          format: val => formatPrice(val),
        },
        {
          name: 'paid',
          label: 'Payé TTC',
          align: 'left',
          field: row => row.paid,
          format: val => formatPrice(val),
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
          field: row => formatPrice(row.toPay),
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
    }
  },
  async mounted () {
    await this.getBalances();
  },
  methods: {
    getCustomerName (customer) {
      return `${customer.identity.firstname ? `${customer.identity.firstname.charAt(0, 1)}. ` : ''}${customer.identity.lastname}`;
    },
    goToCustomerBillingPage (customerId) {
      this.$router.replace({ name: 'customers profile', params: { id: customerId, defaultTab: 'billing' } });
    },
    selectRows (oldValue) {
      if (oldValue) this.selected = [];
      else this.selected = this.balances.filter(bl => bl.toPay > 0);
    },
    // Refresh
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
    async createPayment () {
      try {
        this.creationLoading = true;
        this.$v.newPayment.$touch();
        if (this.$v.newPayment.$error) return NotifyWarning('Champ(s) invalide(s)');
        if (this.newPayment.customer === this.newPayment.client) {
          delete this.newPayment.client
          if (this.newPayment.type === this.WITHDRAWAL) {
            this.newPayment.rum = getLastVersion(this.selectedCustomer.payment.mandates, 'createdAt').rum;
          }
        }
        const payload = this.newPayment;
        await this.$payments.create(payload);
        NotifyPositive('Règlement créé');
        await this.getBalances();
        this.paymentCreationModal = false;
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création du règlement');
      } finally {
        this.creationLoading = false;
      }
    },
    async createPayments () {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Cette opération est définitive. Confirmez-vous ?',
          ok: 'Oui',
          cancel: 'Non'
        });
        const payload = this.selected.map((row) => {
          return {
            nature: this.PAYMENT,
            customer: row._id.customer,
            customerInfo: row.customer,
            netInclTaxes: row.toPay,
            type: this.PAYMENT_OPTIONS[0].value,
            date: this.$moment().toDate(),
            rum: getLastVersion(row.customer.payment.mandates, 'createdAt').rum,
          }
        });
        await this.$payments.createList(payload);
        NotifyPositive('Règlement(s) créé(s)');
        await this.getBalances();
      } catch (e) {
        console.error(e);
        if (e.message === '') return;
        NotifyNegative('Erreur lors de la création du(des) règlement(s)');
      } finally {
        this.selected = [];
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
