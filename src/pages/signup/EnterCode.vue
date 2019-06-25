<template>
  <div class="row justify-center layout-padding">
    <q-card style="width: 500px">
      <q-card-title>
        Entre le code à 4 chiffres que tu as reçu par SMS
      </q-card-title>
      <q-card-separator />
      <q-card-main class="row justify-center layout-padding">
        <q-input v-model="code" v-mask="'####'" type="tel" inverted-light color="white" align="center" autofocus />
      </q-card-main>
      <q-card-actions class="row justify-center">
        <q-btn class="full-width btn-submit" @click="submit" color="primary" :disable="!code" big>Envoyer</q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
import { NotifyNegative } from '../../components/popup/notify';

export default {
  data () {
    return {
      code: '',
      boxesStyle: {
        style: 'color: #E2007A; height: 40px',
        autocorrect: 'off'
      }
    }
  },
  methods: {
    async submit () {
      try {
        const activationDataRaw = await this.$activationCode.check(this.code);
        this.$q.cookies.set('signup_token', activationDataRaw.token, { path: '/', expires: 1, secure: process.env.NODE_ENV !== 'development' });
        this.$q.cookies.set('signup_userEmail', activationDataRaw.activationData.userEmail, { path: '/', expires: 1, secure: process.env.NODE_ENV !== 'development' });
        this.$q.cookies.set('signup_userId', activationDataRaw.activationData.newUserId, { path: '/', expires: 1, secure: process.env.NODE_ENV !== 'development' });
        this.$router.replace({ path: '/createPassword' });
      } catch (e) {
        NotifyNegative('Code invalide');
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

  .btn-submit
    border-radius: 0

  .q-if
    font-size: 24px

  .custom-input
    height: 60px
    @media (max-width: 321px)
      height: 50px

  .q-if-inverted
    padding: 0

  .q-card-actions
    padding: 0

  /deep/ .q-if
    & input.q-input-target
      height: 60px
      line-height: 60px
      @media (max-width: 321px)
        height: 50px
        line-height: 50px
</style>
