<template>
  <q-page padding>
    <p class="test" id="invoicesTitle">Mes factures</p>
    <div id="invoicesFilter" class="row margin-bottom">
      <!-- Période -->
      <!-- <q-field class="on-left" label="Période" icon="ion-calendar" style="max-width: 175px"> -->
      <q-select v-model="year" :options="years"></q-select>&nbsp;
      <!-- </q-field> -->
      <q-select v-model="month" :options="months"></q-select> <!-- :disable="invoices.length == 0" -->
      <div class="on-right column justify-center">
        <q-btn color="primary" @click="getInvoices(null)" :disabled="isDisabled">Afficher les factures</q-btn> <!-- icon="filter list" --> <!-- getInvoicesAndFiscalAttests -->
      </div>
    </div>
    <!-- <q-data-table v-if="fiscalAttests.length !== 0" class="cursor-pointer" :data="fiscalAttests" :config="configFiscalAttests" :columns="columnsFiscalAttests">
      <template slot="col-print_url" slot-scope="cell">
        <q-btn flat round small color="primary">
          <a :href="cell.data" download>
            <q-icon name="file download" />
          </a>
        </q-btn>
      </template>
    </q-data-table> -->
    <p v-if="invoices.length == 0">Aucune facture disponible.</p>
    <table v-if="invoices.length != 0" class="striped-odd highlight">
      <thead>
        <tr>
          <th>Date de facturation</th>
          <th>Montant TTC</th>
          <!-- <th>Téléchargement</th> -->
        </tr>
      </thead>
      <tbody>
        <tr v-for="(invoice, index) in invoices" :key="index">
          <td>{{ invoice.invoice_date }}</td>
          <td>{{ invoice.amount_incl_taxe }}</td>
          <td>
            <q-btn flat round small color="primary" @click="downloadFile(invoice.print_url, 'DL facture')">
              <a download>
                <q-icon name="file download" />
              </a>
            </q-btn>
          </td>
        </tr>
      </tbody>
    </table>
    <p id="fiscalAttestTitle">Mes attestations fiscales</p>
    <p v-if="fiscalAttests.length == 0">Aucune attestation fiscale disponible.</p>
    <table v-if="fiscalAttests.length != 0" class="striped-odd highlight">
      <thead>
        <tr>
          <th>Année</th>
          <!-- <th>Téléchargement</th> -->
        </tr>
      </thead>
      <tbody>
        <tr v-for="(fiscalAttest, index) in fiscalAttests" :key="index">
          <td>{{ fiscalAttest.reference }}</td>
          <td>
            <q-btn flat round small color="primary" @click="downloadFile(fiscalAttest.print_url, 'DL Attestation Fisc.')">
              <a download>
                <q-icon name="file download" />
              </a>
            </q-btn>
          </td>
        </tr>
      </tbody>
    </table>
    <!-- <q-data-table class="cursor-pointer" :data="invoices" :config="configInvoices" :columns="columnsInvoices">
      <template slot="col-amount_incl_taxe" slot-scope="cell">
        <span>{{ cell.data }} &euro;</span>
      </template>
      <template slot="col-print_url" slot-scope="cell">
        <q-btn flat round small color="primary">
          <a :href="cell.data" download>
            <q-icon name="file download" />
          </a>
        </q-btn>
      </template>
    </q-data-table> -->
  </q-page>
</template>

<script>
import _ from 'lodash'
import { openURL } from 'quasar'

export default {
  metaInfo: {
    title: 'Facturation',
  },
  data () {
    return {
      years: [],
      months: [],
      year: this.$moment().year().toString(),
      month: '',
      invoices: [],
      fiscalAttests: [],
      isDisabled: false,
      // configInvoices: {
      //   title: 'Mes factures',
      //   noHeader: false,
      //   bodyStyle: {
      //     maxHeight: '700px'
      //   },
      //   rowHeight: 'auto',
      //   pagination: {
      //     rowsPerPage: 10,
      //     options: [10, 20, 30]
      //   },
      //   messages: {
      //     noData: 'Pas de facture disponible'
      //   },
      //   labels: {
      //     allCols: 'Colonnes (toutes)',
      //     rows: 'Lignes',
      //     search: 'Rechercher'
      //   },
      //   responsive: true
      // },
      // columnsInvoices: [
      //   {
      //     label: 'Date de facturation',
      //     field: 'invoice_date',
      //     width: '75px',
      //     filter: false,
      //     sort (a, b) {
      //       return (new Date(a)) - (new Date(b));
      //     },
      //     type: 'date',
      //     format (value) {
      //       return new Date(value).toLocaleString([], {
      //         day: '2-digit',
      //         month: '2-digit',
      //         year: 'numeric'
      //         // hour: '2-digit',
      //         // minute: '2-digit'
      //       });
      //     }
      //   },
      //   {
      //     label: 'Montant TTC',
      //     field: 'amount_incl_taxe',
      //     filter: false,
      //     sort: true,
      //     type: 'number',
      //     width: '75px'
      //   },
      //   {
      //     label: 'Téléchargement',
      //     field: 'print_url',
      //     width: '75px'
      //   }
      // ],
      // configFiscalAttests: {
      //   title: 'Mes attestations fiscales',
      //   noHeader: false,
      //   bodyStyle: {
      //     maxHeight: '700px'
      //   },
      //   rowHeight: 'auto',
      //   pagination: {
      //     rowsPerPage: 5,
      //     options: [5, 10, 15]
      //   },
      //   messages: {
      //     noData: 'Pas de d\'attestation fiscale disponible'
      //   },
      //   labels: {
      //     allCols: 'Colonnes (toutes)',
      //     rows: 'Lignes',
      //     search: 'Rechercher'
      //   },
      //   responsive: true
      // },
      // columnsFiscalAttests: [
      //   {
      //     label: 'Année',
      //     field: 'reference',
      //     width: '75px',
      //     filter: false,
      //     sort (a, b) {
      //       return (new Date(a)) - (new Date(b));
      //     },
      //     type: 'date',
      //     format (value) {
      //       return new Date(value).toLocaleString([], {
      //         year: 'numeric'
      //       });
      //     }
      //   },
      //   {
      //     label: 'Téléchargement',
      //     field: 'print_url',
      //     width: '75px'
      //   }
      // ]
    }
  },
  computed: {
    getUser () {
      return this.$store.getters['main/user'];
    }
  },
  created () {
    this.$moment.locale('fr');
    this.month = this.$moment().month(this.$moment().month()).format('MMMM');
    for (let year = this.$moment().year(); year >= 2016; year--) {
      const currentYear = year.toString();
      this.years.push({
        label: currentYear,
        value: currentYear
      })
    }
    for (let i = 0; i < 12; i++) {
      const currentMonth = this.$moment().month(i).format('MMMM');
      this.months.push({
        label: currentMonth,
        value: currentMonth
      })
    }
    this.months.unshift({
      label: 'Tous',
      value: 'Tous'
    });
    this.getInvoices({ startPeriod: this.$moment().subtract(1, 'months').startOf('month').format('YYYYMMDD'), endPeriod: this.$moment().endOf('month').format('YYYYMMDD') });
    this.getFiscalAttests();
  },
  methods: {
    async getInvoices (params) {
      try {
        this.invoices = [];
        this.isDisabled = true;
        if (params) {
          this.invoices = await this.$ogust.getCustomerInvoices(this.getUser.customers[0].customerId, { startPeriod: params.startPeriod, endPeriod: params.endPeriod });
        } else {
          this.invoices = await this.$ogust.getCustomerInvoices(this.getUser.customers[0].customerId, { year: this.year, month: this.month === 'Tous' ? '' : this.$moment().month(this.month).format('MM') }); // 276329398 // this.getUser.customer_id
        }
        for (let i = 0, l = Object.keys(this.invoices).length; i < l; i++) {
          this.invoices[i].invoice_date = this.$moment(this.invoices[i].invoice_date, 'YYYYMMDD').format('DD/MM/YYYY') // .format('DD/MM/YYYY') // .toDate();
          // this.invoices[i].start_of_period = moment(this.invoices[i].start_of_period, 'YYYYMMDD').toDate(); // .format('DD/MM/YYYY')
          // this.invoices[i].end_of_period = moment(this.invoices[i].end_of_period, 'YYYYMMDD').toDate(); // .format('DD/MM/YYYY')
        }
        this.invoices = _.sortBy(this.invoices, ['end_of_period']).reverse();
        this.isDisabled = false;
      } catch (e) {
        console.error(e);
        this.isDisabled = false;
      }
    },
    async getFiscalAttests () {
      try {
        this.fiscalAttests = [];
        this.fiscalAttests = await this.$ogust.getCustomerFiscalAttests(this.getUser.customers[0].customerId, {}); // 235146870 // this.getUser.customer_id // year: this.year
        for (let i = 0, l = Object.keys(this.fiscalAttests).length; i < l; i++) {
          this.fiscalAttests[i].period_start = this.$moment(this.fiscalAttests[i].period_start, 'YYYYMMDD').format('MM/YYYY');
          this.fiscalAttests[i].reference = this.$moment(this.fiscalAttests[i].reference, 'YYYY-M').format('YYYY');
        }
        this.fiscalAttests = _.sortBy(this.fiscalAttests, ['period_end']).reverse();
      } catch (e) {
        console.error(e);
        this.isDisabled = false;
      }
    },
    getInvoicesAndFiscalAttests () {
      this.getInvoices();
      this.getFiscalAttests();
    },
    getLastInvoices () {

    },
    downloadFile (url, label) {
      if (process.env.NODE_ENV === 'production') {
        this.$ga.event('Aidants', 'click', label);
      }
      openURL(url);
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~variables';

.margin-bottom
  margin-bottom: 10px

#invoicesTitle
  font-size: 1.5em
  margin-bottom: 20px

#fiscalAttestTitle
  font-size: 1.5em
  margin-top: 30px
  margin-bottom: 20px

#invoicesFilter
  margin-bottom: 25px
a
  color: $primary
  text-decoration: none
</style>
