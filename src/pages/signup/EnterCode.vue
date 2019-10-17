<template>
  <div>
    <compani-header />
    <div class="row justify-center layout-padding neutral-background" style="min-height: 100vh">
      <div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Entre le code à 4 chiffres que tu as reçu par SMS</p>
            </div>
            <q-input v-model="code" v-mask="'####'" type="tel" inverted-light color="white" align="center" autofocus />
          </div>
        </div>
        <div class="row justify-center">
          <q-btn @click="submit" color="primary" :disable="!code" big>Envoyer</q-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CompaniHeader from '../../components/CompaniHeader';
import { NotifyNegative } from '../../components/popup/notify';

export default {
  components: {
    'compani-header': CompaniHeader,
  },
  data () {
    return {
      code: '',
      boxesStyle: {
        style: 'color: #E2007A; height: 40px',
        autocorrect: 'off',
      },
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
    },
  },
  beforeDestroy () {
    clearTimeout(this.timeout);
  },
}
</script>
