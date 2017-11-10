<template>
  <div>
    <div class="layout-padding">
      <!-- <p class="text-center">Dashboard Alenvi</p> -->
      <div class="row justify-center">
        <div class="alenvi-logo">
          <img src="https://res.cloudinary.com/alenvi/image/upload/v1507124345/images/business/alenvi_logo_complet_full.png" class="responsive">
        </div>
      </div>
      <div class="row justify-center">
        <q-field class="col-xs-12 col-sm-3" icon="mail">
          <q-input v-model.trim="credentials.email" float-label="Adresse email"/>
        </q-field>
      </div>
      <div class="row justify-center">
        <q-field class="col-xs-12 col-sm-3" icon="vpn_key">
          <q-input v-model="credentials.password" float-label="Mot de passe" type="password" />
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
  QBtn,
  Cookies,
  date
} from 'quasar'

import { axiosNoHeaders } from '../../helpers/axiosInstances/noHeaders'

let test = Cookies.get('alenvi_token');

export default {
  components: {
    QField,
    QInput,
    QBtn
  },
  data () {
    return {
      credentials: {
        email: '',
        password: ''
      }
    }
  },
  methods: {
    async submit () {
      try {
        const user = await axiosNoHeaders.post(`${process.env.API_HOSTNAME}/users/authenticate`, {
          email: this.credentials.email,
          password: this.credentials.password
        });
        // console.log(user);
        Cookies.set('alenvi_token', user.data.data.token, { path: '/', expires: date.addToDate(new Date(), { seconds: user.data.data.expiresIn }) });
        Cookies.set('alenvi_token_expires_in', user.data.data.expiresIn, { path: '/', expires: date.addToDate(new Date(), { seconds: user.data.data.expiresIn }) });
        Cookies.set('refresh_token', user.data.data.refreshToken, { path: '/', expires: 365 });
        Cookies.set('user_id', user.data.data.user._id, { path: '/', expires: 365 });
        this.$router.push('/dashboard');
      } catch(e) {
        console.error(e);
      }
    }
  }
}
</script>

<style lang="css">

  .alenvi-logo {
    width: 300px;
    height: 125px;
  }

  /*.alenvi-logo img {
    max-width: 100%;
    height: auto;
  }*/
</style>
