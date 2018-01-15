<template>
  <div class="layout-padding">
    <div class="row justify-center">
      <!-- <div style="width: 700px; max-width: 90vw;"> -->
        <p v-if="Object.keys(invoices).length === 0">Aucun facture disponible</p>
        <q-card v-if="invoices" inline v-for="(invoice, index) in invoices" :key="index" style="cursor: pointer">
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
        </q-card>
      <!-- </div> -->
    </div>
  </div>
</template>

<script>

import ogust from '../../../models/Ogust';

import moment from 'moment';

import { QCard, QCardTitle, QCardActions, QBtn, QIcon } from 'quasar';

export default {
  components: {
    QCard,
    QCardTitle,
    QCardActions,
    QBtn,
    QIcon
  },
  data () {
    return {
      invoices: {}
    }
  },
  computed: {
    getUser () {
      return this.$store.getters.user;
    }
  },
  async created () {
    try {
      this.invoices = await ogust.getCustomerInvoices(276329398); // this.getUser.customer_id
      console.log(this.invoices);
      for (let i = 0, l = Object.keys(this.invoices).length; i < l; i++) {
        this.invoices[i].start_of_period = moment(this.invoices[i].start_of_period, 'YYYYMMDD').format('DD/MM/YYYY');
        this.invoices[i].end_of_period = moment(this.invoices[i].end_of_period, 'YYYYMMDD').format('DD/MM/YYYY');
      }
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
