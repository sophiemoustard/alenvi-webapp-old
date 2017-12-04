<template>
  <div class="row justify-center layout-padding">
    <q-card style="width: 500px">
      <q-card-title>
        Entre le code à 4 chiffres que tu as reçu par SMS
      </q-card-title>
      <q-card-separator />
      <q-card-main class="row justify-center layout-padding">
        <!-- <div class="custom-input on-left" v-for="(box, index) in boxes" :key="index"> -->
          <q-input class="custom-input on-left" v-for="(box, index) in boxes" :key="index" align="center" @change="changeBoxAndMakeCode(index, $event)" :attributes="boxesStyle" :ref="'box' + (index + 1)" type="tel" :autofocus="box.autofocus" v-model.number="box.model" :max-length="1"></q-input>

        <!-- </div> -->
      </q-card-main>
      <q-card-actions class="row justify-end">
        <q-btn @click="submit" color="primary" :disable="!code" flat big>Envoyer</q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
import { QInput, QCard, QCardTitle, QCardMain, QCardSeparator, QCardActions, QBtn, Cookies, date } from 'quasar'
import _ from 'lodash'

import activationCode from '../models/ActivationCode'
import { alenviAlert } from '../../helpers/alerts'

export default {
  components: {
    QInput,
    QCard,
    QCardTitle,
    QCardMain,
    QCardSeparator,
    QCardActions,
    QBtn
  },
  data() {
    return {
      boxes: [
        {
          model: '',
          autofocus: true
        },
        {
          model: '',
          autofocus: false
        },
        {
          model: '',
          autofocus: false
        },
        {
          model: '',
          autofocus: false
        }
      ],
      code: '',
      boxesStyle: {
        style: 'color: #E2007A; height: 40px',
        autocorrect: 'off'
      }
    }
  },
  methods: {
    changeBoxAndMakeCode (index, event) {
      if (index !== (this.boxes.length - 1) && event.match(/[0-9]/g)) {
        const newIndex = index + 1;
        this.$refs['box' + (newIndex + 1)][0].focus();
      } else if (index === (this.boxes.length - 1)) {
        this.$refs['box' + this.boxes.length][0].blur();
        this.code = '';
        for (let i = 0, l = this.boxes.length; i < l; i++) {
          this.code += this.boxes[i].model;
        }
      }
    },
    async submit () {
      try {
        const activationDataRaw = await activationCode.check(this.code);
        Cookies.set('signup_is_activated', activationDataRaw.token, { path: '/', expires: date.addToDate(new Date(), { days: 1 }), secure: process.env.NODE_ENV == 'development' ? false : true });
        Cookies.set('signup_sector', activationDataRaw.activationData.sector, { path: '/', expires: date.addToDate(new Date(), { days: 1 }), secure: process.env.NODE_ENV == 'development' ? false : true });
        Cookies.set('signup_mobile', activationDataRaw.activationData.mobile_phone, { path: '/', expires: date.addToDate(new Date(), { days: 1 }), secure: process.env.NODE_ENV == 'development' ? false : true });
        this.$router.replace('/signup');
      } catch (e) {
        alenviAlert({
          color: 'error',
          icon: 'warning',
          content: 'Code invalide',
          position: 'bottom-right',
          duration: 3000
        });
        console.error(e.response);
      }
    }
  },
  beforeDestroy () {
    clearTimeout(this.timeout);
  }
};
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .q-if
    font-size: 24px

  .custom-input
    color: $primary
    width: 60px
    height: 60px
    @media (max-width: 321px)
      width: 50px
      height: 50px
</style>
