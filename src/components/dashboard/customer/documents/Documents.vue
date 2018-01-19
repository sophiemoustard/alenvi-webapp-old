<template>
  <div class="layout-padding">
    <div class="row">
      Période
      <!-- <q-field class="on-left" label="Période" icon="ion-calendar" style="max-width: 175px"> -->
      <q-select v-model="year" :options="years" @change="getInvoicesAndFiscalAttests"></q-select> <!-- :disable="invoices.length == 0" -->
      <!-- </q-field> -->
      <q-select v-model="year" :options="years" @change="getInvoicesAndFiscalAttests"></q-select> <!-- :disable="invoices.length == 0" -->
    </div>
    <q-data-table v-if="fiscalAttests.length !== 0" class="cursor-pointer" :data="fiscalAttests" :config="configFiscalAttests" :columns="columnsFiscalAttests">
      <template slot="col-print_url" slot-scope="cell">
        <q-btn flat round small color="primary">
          <a :href="cell.data" download>
            <q-icon name="file download" />
          </a>
        </q-btn>
      </template>
    </q-data-table>
    <q-data-table class="cursor-pointer" :data="invoices" :config="configInvoices" :columns="columnsInvoices">
      <template slot="col-print_url" slot-scope="cell">
        <q-btn flat round small color="primary">
          <a :href="cell.data" download>
            <q-icon name="file download" />
          </a>
        </q-btn>
      </template>
    </q-data-table>
  </div>
</template>

<script>

import ogust from '../../../models/Ogust';

import moment from 'moment';
import _ from 'lodash';

import { QCard, QCardTitle, QCardActions, QBtn, QIcon, QDataTable, QSelect, QField } from 'quasar';

export default {
  components: {
    QCard,
    QCardTitle,
    QCardActions,
    QBtn,
    QIcon,
    QDataTable,
    QSelect,
    QField
  },
  data () {
    return {
      years: [],
      year: moment().year().toString(),
      invoices: [],
      fiscalAttests: [],
      configInvoices: {
        title: 'Mes factures',
        noHeader: false,
        bodyStyle: {
          maxHeight: '700px'
        },
        rowHeight: 'auto',
        pagination: {
          rowsPerPage: 10,
          options: [10, 20, 30]
        },
        messages: {
          noData: 'Pas de facture disponible'
        },
        labels: {
          allCols: 'Colonnes (toutes)',
          rows: 'Lignes',
          search: 'Rechercher'
        },
        responsive: true
      },
      columnsInvoices: [
        {
          label: 'Date de facturation',
          field: 'invoice_date',
          width: '75px',
          filter: false,
          sort (a, b) {
            return (new Date(a)) - (new Date(b));
          },
          type: 'date',
          format (value) {
            return new Date(value).toLocaleString([], {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              // hour: '2-digit',
              // minute: '2-digit'
            });
          }
        },
        {
          label: 'Montant TTC',
          field: 'amount_incl_taxe',
          filter: false,
          sort: true,
          type: 'number',
          width: '75px'
        },
        {
          label: 'Téléchargement',
          field: 'print_url',
          width: '75px'
        }
      ],
      configFiscalAttests: {
        title: 'Mes attestations fiscales',
        noHeader: false,
        bodyStyle: {
          maxHeight: '700px'
        },
        rowHeight: 'auto',
        pagination: {
          rowsPerPage: 5,
          options: [5, 10, 15]
        },
        messages: {
          noData: 'Pas de d\'attestation fiscale disponible'
        },
        labels: {
          allCols: 'Colonnes (toutes)',
          rows: 'Lignes',
          search: 'Rechercher'
        },
        responsive: true
      },
      columnsFiscalAttests: [
        {
          label: 'Année',
          field: 'reference',
          width: '75px',
          filter: false,
          sort (a, b) {
            return (new Date(a)) - (new Date(b));
          },
          type: 'date',
          format (value) {
            return new Date(value).toLocaleString([], {
              year: 'numeric'
            });
          }
        },
        {
          label: 'Téléchargement',
          field: 'print_url',
          width: '75px'
        }
      ]
    }
  },
  computed: {
    getUser () {
      return this.$store.getters.user;
    }
  },
  created () {
    for (let year = moment().year(); year >= 2016; year--) {
      this.years.push({
        label: year.toString(),
        value: year.toString()
      })
    }
    this.getInvoices();
    this.getFiscalAttests();
  },
  methods: {
    async getInvoices() {
      try {
        // this.invoices = [];
        this.invoices = await ogust.getCustomerInvoices(276329398, { year: this.year }); // this.getUser.customer_id
        for (let i = 0, l = Object.keys(this.invoices).length; i < l; i++) {
          this.invoices[i].invoice_date = moment(this.invoices[i].invoice_date, 'YYYYMMDD').toDate(); // .format('DD/MM/YYYY')
          // this.invoices[i].start_of_period = moment(this.invoices[i].start_of_period, 'YYYYMMDD').toDate(); // .format('DD/MM/YYYY')
          // this.invoices[i].end_of_period = moment(this.invoices[i].end_of_period, 'YYYYMMDD').toDate(); // .format('DD/MM/YYYY')
        }
        this.invoices = _.sortBy(this.invoices, ['end_of_period']).reverse();
        console.log(this.invoices);
      } catch (e) {
        console.error(e);
      }
    },
    async getFiscalAttests() {
      try {
        this.fiscalAttests = [];
        this.fiscalAttests = await ogust.getCustomerFiscalAttests(235146870, { year: this.year }); // this.getUser.customer_id
        for (let i = 0, l = Object.keys(this.fiscalAttests).length; i < l; i++) {
          this.fiscalAttests[i].period_start = moment(this.fiscalAttests[i].period_start, 'YYYYMMDD').format('MM/YYYY');
        }
        this.fiscalAttests = _.sortBy(this.fiscalAttests, ['period_end']).reverse();
        console.log(this.fiscalAttests);
      } catch (e) {
        console.error(e);
      }
    },
    getInvoicesAndFiscalAttests() {
      this.getInvoices();
      this.getFiscalAttests();
    }
  }
};
</script>

<style lang="stylus" scoped>
@import '~variables';
</style>
