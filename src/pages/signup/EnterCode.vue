<template>
  <div class="row justify-center layout-padding">
    <div class="column items-center" style="width: 500px">
      <div class="row">
        <h5>Entre le code à 4 chiffres que tu as reçu par SMS</h5>
      </div>
      <div class="row no-wrap justify-center q-mb-md" style="max-width: 500px">
        <q-input class="custom-input on-left" v-for="(box, index) in boxes" :key="index" align="center" @input="changeBoxAndMakeCode(index, $event)"
          v-mask="'#'" :ref="'box' + (index + 1)" type="tel" :autofocus="box.autofocus" v-model.number="box.model"
          pattern="\d+" inverted-light color="white" />
      </div>
      <div class="row">
        <q-btn class="full-width send-btn" @click="submit" color="primary" :disable="!code">Envoyer</q-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { date } from 'quasar';

export default {
  data () {
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
      code: [0, 0, 0, 0],
      boxesStyle: {
        style: 'color: #E2007A; height: 40px',
        autocorrect: 'off'
      }
    }
  },
  methods: {
    changeBoxAndMakeCode (index, event) {
      if (index !== (this.boxes.length - 1) && event.match(/[0-9]/g)) {
        this.code.splice(index, 1, event);
        const newIndex = index + 1;
        this.$refs['box' + (newIndex + 1)][0].focus();
      } else if (index === (this.boxes.length - 1) && event.match(/[0-9]/g)) {
        this.$refs['box' + this.boxes.length][0].blur();
        this.code.splice(index, 1, event);
      }
    },
    async submit () {
      try {
        const activationDataRaw = await this.$activationCode.check(this.code.join(''));
        this.$q.cookies.set('signup_token', activationDataRaw.token, { path: '/', expires: date.addToDate(new Date(), { days: 1 }), secure: process.env.NODE_ENV !== 'development' });
        this.$q.cookies.set('signup_userEmail', activationDataRaw.activationData.userEmail, { path: '/', expires: date.addToDate(new Date(), { days: 1 }), secure: process.env.NODE_ENV !== 'development' });
        this.$q.cookies.set('signup_userId', activationDataRaw.activationData.newUserId, { path: '/', expires: date.addToDate(new Date(), { days: 1 }), secure: process.env.NODE_ENV !== 'development' });
        this.$router.replace({ path: '/createPassword' });
      } catch (e) {
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Code invalide',
          position: 'bottom-right',
          timeout: 2500
        });
        console.error(e.response);
      }
    }
  },
  beforeDestroy () {
    clearTimeout(this.timeout);
  }
}
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

  .q-if-inverted
    border: 1px solid $light-grey
    padding: 0

  .q-card-actions
    padding: 0

  /deep/ .q-if
    &:not(.q-if-disabled):not(.q-if-error):not(.q-if-warning):hover:before
      color: inherit !important
    & input.q-input-target
      height: 60px
      line-height: 60px
      display: flex
      @media (max-width: 321px)
        height: 50px
        line-height: 50px
</style>
