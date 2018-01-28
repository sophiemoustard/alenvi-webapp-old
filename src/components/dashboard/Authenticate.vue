<template>
  <div class="row justify-center layout-padding">
    <q-card flat class="layout-padding" style="width: 500px; max-width: 90vw;">
      <q-card-media>
        <img src="https://res.cloudinary.com/alenvi/image/upload/v1507124345/images/business/alenvi_logo_complet_full.png" class="responsive">
      </q-card-media>
      <q-card-main>
        <q-field class="col-xs-12 col-sm-3" icon="mail">
          <q-input v-model.trim="credentials.email" float-label="Adresse email" />
        </q-field>
        <q-field class="col-xs-12 col-sm-3" icon="vpn_key">
          <q-input @keyup.enter="submit" v-model="credentials.password" float-label="Mot de passe" type="password" />
        </q-field>
      </q-card-main>
      <q-card-actions>
        <q-btn class="full-width" color="primary" @click="submit()">Login</q-btn>
      </q-card-actions>
      <q-card-actions>
        <router-link class="row justify-center" to="/forgotPassword">Mot de passe oublié ?</router-link>
      </q-card-actions>
    </q-card>
  </div>
</template>


<script>

import {
  QField,
  QInput,
  QCard,
  QCardMain,
  QCardSeparator,
  QCardActions,
  QCardMedia,
  QBtn,
  Cookies,
  date
} from 'quasar'

import axios from 'axios'
import { alenviAlert } from '../../helpers/alerts'

export default {
  components: {
    QField,
    QInput,
    QCard,
    QCardMain,
    QCardSeparator,
    QCardActions,
    QCardMedia,
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
  computed: {
    getUser () {
      return this.$store.getters.user;
    }
  },
  methods: {
    async submit () {
      try {
        const user = await axios.post(`${process.env.API_HOSTNAME}/users/authenticate`, {
          email: this.credentials.email.toLowerCase(),
          password: this.credentials.password
        });
        // console.log(user);
        Cookies.set('alenvi_token', user.data.data.token, { path: '/', expires: date.addToDate(new Date(), { seconds: user.data.data.expiresIn }), secure: process.env.NODE_ENV != 'development' });
        Cookies.set('alenvi_token_expires_in', user.data.data.expiresIn, { path: '/', expires: date.addToDate(new Date(), { seconds: user.data.data.expiresIn }), secure: process.env.NODE_ENV != 'development' });
        Cookies.set('refresh_token', user.data.data.refreshToken, { path: '/', expires: 365, secure: process.env.NODE_ENV != 'development' });
        Cookies.set('user_id', user.data.data.user._id, { path: '/', expires: date.addToDate(new Date(), { seconds: user.data.data.expiresIn }), secure: process.env.NODE_ENV != 'development' });
        await this.$store.dispatch('getUser', Cookies.get('user_id'));
        if (this.getUser.role.name == 'Client') {
          return this.$router.replace({ path: '/dashboard/customer/home' });
        }
        this.$router.replace({ name: 'planning' });
      } catch (e) {
        alenviAlert({ color: 'error', icon: 'warning', content: 'Impossible de se connecter.', position: 'bottom-right', duration: 2500 });
        console.error(e);
      }
    }
  },
  beforeDestroy () {
    clearTimeout(this.timeout);
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
