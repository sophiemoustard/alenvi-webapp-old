<template>
  <div class="layout-padding">
    <div class="row justify-center">
      <!-- <div style="width: 700px; max-width: 90vw;"> -->
        <p v-if="Object.keys(invoices).length === 0">Aucun facture disponible</p>
        <!-- <q-card v-if="invoices" inline v-for="(invoice, index) in invoices" :key="index" style="cursor: pointer">
          <q-card-title class="text-center">
            {{invoice.start_of_period}} au {{ invoice.end_of_period }}
          </q-card-title>
          <q-card-actions align="around">
            <q-btn flat round small color="primary">
              <a :href="invoice.print_url" download>
                <q-icon name="file download" />
              </a>
            </q-btn>
          </q-card-actions>
        </q-card> -->
        <q-select v-model="year" float-label="Année" :options="years"></q-select>
        <q-data-table v-if="Object.keys(invoices).length !== 0" class="cursor-pointer" :data="invoices" :config="config" :columns="columns">
          <template slot="col-print_url" slot-scope="cell">
            <q-btn flat round small color="primary">
              <a :href="cell.data" download>
                <q-icon name="file download" />
              </a>
            </q-btn>
            <!-- <q-icon class="cursor-pointer" name="delete" @click="remove(cell.data.id, cell.row.__index, cell.data.userId)" size="1.5rem" /> -->
          </template>
        </q-data-table>

      <!-- </div> -->
    </div>
  </div>
</template>

<script>

import ogust from '../../../models/Ogust';

import moment from 'moment';
import _ from 'lodash';

import { QCard, QCardTitle, QCardActions, QBtn, QIcon, QDataTable } from 'quasar';

export default {
  components: {
    QCard,
    QCardTitle,
    QCardActions,
    QBtn,
    QIcon,
    QDataTable,
    QSelect
  },
  data () {
    return {
      years: {},
      invoices: {},
      config: {
        title: 'Factures disponibles',
        noHeader: false,
        bodyStyle: {
          maxHeight: '700px'
        },
        rowHeight: 'auto',
        pagination: {
          rowsPerPage: 5,
          options: [5, 15, 25]
        },
        messages: {
          noData: 'Pas de données disponibles.'
        },
        labels: {
          allCols: 'Colonnes (toutes)',
          rows: 'Lignes',
          search: 'Rechercher'
        },
        responsive: true
      },
      columns: [
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
        // {
        //   label: 'Communauté',
        //   field: 'sector',
        //   filter: true,
        //   sort: true,
        //   type: 'number',
        //   width: '150px'
        // },
        {
          label: 'Téléchargement',
          field: 'print_url',
          width: '75px'
        }
        // {
        //   label: 'Envoyés',
        //   field: 'sent',
        //   filter: false,
        //   sort: false,
        //   width: '70px'
        // },
        // {
        //   label: 'Echec',
        //   field: 'failed',
        //   filter: false,
        //   sort: false,
        //   width: '70px'
        // },
        // {
        //   label: 'Total',
        //   field: 'total',
        //   filter: false,
        //   sort: false,
        //   width: '50px'
        // }
      ]
    }
  },
  computed: {
    getUser () {
      return this.$store.getters.user;
    }
  },
  async created () {
    try {
      this.invoices = await ogust.getCustomerInvoices(276329398, { year: '2017' }); // this.getUser.customer_id
      for (let i = 0, l = Object.keys(this.invoices).length; i < l; i++) {
        this.invoices[i].invoice_date = moment(this.invoices[i].invoice_date, 'YYYYMMDD').toDate(); // .format('DD/MM/YYYY')
        // this.invoices[i].start_of_period = moment(this.invoices[i].start_of_period, 'YYYYMMDD').toDate(); // .format('DD/MM/YYYY')
        // this.invoices[i].end_of_period = moment(this.invoices[i].end_of_period, 'YYYYMMDD').toDate(); // .format('DD/MM/YYYY')
      }
      this.invoices = _.sortBy(this.invoices, ['end_of_period']).reverse();
      console.log(this.invoices);
      // this.years = {
        // TO DO
      // }
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
  }
};
</script>

<style lang="stylus" scoped>
@import '~variables';
</style>
