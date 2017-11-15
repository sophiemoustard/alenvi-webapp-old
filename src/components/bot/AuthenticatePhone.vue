<template>
  <div>
    <div class="layout-padding">
      <p class="text-center">Entre ton mot de passe et le code reçu par SMS pour continuer !</p>
      <div class="row justify-center">
        <div class="alenvi-logo">
          <img src="https://res.cloudinary.com/alenvi/image/upload/v1499948101/images/bot/Pigi.png" class="responsive">
        </div>
      </div>
      <div class="row justify-center">
        <q-field class="col-xs-12 col-sm-3" icon="password">
          <q-input v-model="credentials.password" float-label="Mot de passe" type="password"/>
        </q-field>
      </div>
      <div class="row justify-center">
        <q-field class="col-xs-12 col-sm-3" icon="password">
          <q-input v-model="credentials.passwordConfirm" float-label="Confirmation mot de passe" type="password"/>
        </q-field>
      </div>
      <div class="row justify-center">
        <q-field class="col-xs-12 col-sm-3" icon="vpn_key">
          <q-input v-model="credentials.activationCode" float-label="Code d'activation" type="password" />
        </q-field>
      </div>
      <div class="row justify-center">
        <div class="col-xs-12 col-sm-3">
          <q-btn class="full-width" color="primary" @click="submit()">Login</q-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import {
  QField,
  QInput,
  QBtn
} from 'quasar'

export default {
  data () {
    return {
      credentials: {
        password: '',
        passwordConfirm: '',
        activationCode: '',
        // redirect_link: 'https://alenvi-webapp-dev.herokuapp.com/bot/authenticate?account_linking_token=ARTk5ZSYMMN369JxG5QGN0i8IRSs1fTb_WV_fF1x-fGy11JqgnbiMPakZUDMTIoez0mqtlKNdOH31zQxzYoKdXQ2rdKr6l7hMSs6tRgek-V-4A&redirect_uri=https%3A%2F%2Ffacebook.com%2Fmessenger_platform%2Faccount_linking%2F%3Faccount_linking_token%3DARTk5ZSYMMN369JxG5QGN0i8IRSs1fTb_WV_fF1x-fGy11JqgnbiMPakZUDMTIoez0mqtlKNdOH31zQxzYoKdXQ2rdKr6l7hMSs6tRgek-V-4A'
      }
    }
  },
  methods: {
    submit () {
      // var newLocation = 'https://alenvi-api.herokuapp.com/bot/authorize' + window.location.search;
      const newLocation = 'https://m.me/alenvipigi'
      // if (window.location.search) {
      //   newLocation += '&';
      // } else {
      //   newLocation += '?'
      // }
      window.location = newLocation
      // + 'email=' + this.credentials.email + '&password=' + this.credentials.password;
      return false;
    }
  },
  components: {
    QField,
    QInput,
    QBtn
  }
}
</script>

<style lang="css">

  .alenvi-logo {
    width: 125px;
    height: 125px;
  }

  /*.alenvi-logo img {
    max-width: 100%;
    height: auto;
  }*/
</style>
