<template>
  <div class="layout-padding row justify-center">
    <q-card flat class="layout-padding" style="width: 500px; max-width: 90vw;">
      <q-card-media>
        <img src="https://res.cloudinary.com/alenvi/image/upload/v1507124345/images/business/alenvi_logo_complet_full.png" class="responsive">
      </q-card-media>
      <q-card-main>
        <q-field class="col-xs-12 col-sm-3" icon="mail">
          <q-input @keyup.enter="submit" v-model.trim="credentials.email" float-label="Adresse email" />
        </q-field>
        <q-field class="col-xs-12 col-sm-3" icon="vpn_key">
          <q-input @keyup.enter="submit" v-model="credentials.password" float-label="Mot de passe" type="password" />
        </q-field>
      </q-card-main>
      <q-card-actions>
        <q-btn class="full-width" color="primary" @click="submit">Login</q-btn>
      </q-card-actions>
      <q-card-actions>
        <router-link class="row justify-center" :to="{ path: '/forgotPassword', query: { from: 'p' } }"><small>Mot de passe oublié ?</small></router-link>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
import { date } from 'quasar'

export default {
  data () {
    return {
      credentials: {
        email: '',
        password: ''
      }
    }
  },
  computed: {
    formattedCredentials () {
      return {
        email: this.credentials.email.toLowerCase(),
        password: this.credentials.password
      }
    }
  },
  methods: {
    async submit () {
      try {
        const user = await this.$bot.authenticate(this.formattedCredentials);
        const token = user.data.data.token;
        console.log(user);
        console.log('MESSENGER_LINK', process.env.MESSENGER_LINK);
        console.log('TOKEN', token);
        this.$q.cookies.set('alenvi_token', user.data.data.token, { path: '/', expires: date.addToDate(new Date(), { seconds: user.data.data.expiresIn }), secure: process.env.NODE_ENV !== 'development' });
        this.$q.cookies.set('alenvi_token_expires_in', user.data.data.expiresIn, { path: '/', expires: date.addToDate(new Date(), { seconds: user.data.data.expiresIn }), secure: process.env.NODE_ENV !== 'development' });
        this.$q.cookies.set('refresh_token', user.data.data.refreshToken, { path: '/', expires: 365, secure: process.env.NODE_ENV !== 'development' });
        this.$q.cookies.set('user_id', user.data.data.user._id, { path: '/', expires: date.addToDate(new Date(), { seconds: user.data.data.expiresIn }), secure: process.env.NODE_ENV !== 'development' });
        window.location.href = `${process.env.MESSENGER_LINK}?ref=${token}`
      } catch (e) {
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Impossible de se connecter.',
          position: 'bottom-right',
          timeout: 2500
        });
        console.error(e.response);
      }
      //   var newLocation = 'https://alenvi-api.herokuapp.com/bot/authorize' + window.location.search;
      //   if (window.location.search) {
      //     newLocation += '&';
      //   } else {
      //     newLocation += '?'
      //   }
      //   window.location = newLocation + 'email=' + this.credentials.email + '&password=' + this.credentials.password;
      //   return false;
      // }
    }
  }

}
</script>

<style lang="stylus" scoped>
@import '~variables'

.alenvi-logo
  width: 125px
  height: 125px

.q-field
  margin: 0 0 10px 0

</style>
