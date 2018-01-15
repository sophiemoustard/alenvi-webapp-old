<template>
  <div class="layout-padding">
    <div class="row justify-center">
      <!-- <div style="width: 700px; max-width: 90vw;"> -->
        <p v-if="Object.keys(fiscalAttests).length === 0">Aucune attestation fiscale disponible</p>
        <q-card inline v-for="(fiscalAttest, index) in fiscalAttests" :key="index" style="cursor: pointer">
          <q-card-title class="text-center">
            {{fiscalAttest.period_start}}
          </q-card-title>
          <q-card-actions align="around" v-if="fiscalAttest.print_url">
            <q-btn flat round small color="primary">
              <a :href="fiscalAttest.print_url" download>
                <q-icon name="file download" />
              </a>
            </q-btn>
          </q-card-actions>
          <q-card-main v-if="!fiscalAttest.print_url">Bientôt disponible !</q-card-main>
        </q-card>
      <!-- </div> -->
    </div>
  </div>
</template>

<script>

import ogust from '../../../models/Ogust';

import moment from 'moment';

import { QCard, QCardTitle, QCardActions, QBtn, QIcon, QCardMain } from 'quasar';

export default {
  components: {
    QCard,
    QCardTitle,
    QCardActions,
    QCardMain,
    QBtn,
    QIcon
  },
  data () {
    return {
      fiscalAttests: {}
    }
  },
  computed: {
    getUser () {
      return this.$store.getters.user;
    }
  },
  async created () {
    try {
      this.fiscalAttests = await ogust.getCustomerFiscalAttests(276329398); // this.getUser.customer_id
      console.log(this.fiscalAttests);
      for (let i = 0, l = Object.keys(this.fiscalAttests).length; i < l; i++) {
        this.fiscalAttests[i].period_start = moment(this.fiscalAttests[i].period_start, 'YYYYMMDD').format('MM/YYYY');
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
