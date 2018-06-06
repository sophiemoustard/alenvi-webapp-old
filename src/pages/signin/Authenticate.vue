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
        <router-link class="row justify-center" :to="{ path: '/forgotPassword', query: { from: 'w' } }"><small>Mot de passe oublié ?</small></router-link>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>

import { date } from 'quasar'

export default {
  metaInfo: {
    title: 'Connexion',
    meta: [
      { name: 'description', content: 'Espace personnalisé pour accéder à vos documents et informations liés aux interventions réalisées par Alenvi.' },
    ]
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
      return this.$store.getters['main/user'];
    }
  },
  async mounted () {
  },
  methods: {
    async submit () {
      try {
        const user = await this.$axios.post(`${process.env.API_HOSTNAME}/users/authenticate`, {
          email: this.credentials.email.toLowerCase(),
          password: this.credentials.password
        });
        // console.log(user);
        this.$q.cookies.set('alenvi_token', user.data.data.token, { path: '/', expires: date.addToDate(new Date(), { seconds: user.data.data.expiresIn }), secure: process.env.NODE_ENV !== 'development' });
        this.$q.cookies.set('alenvi_token_expires_in', user.data.data.expiresIn, { path: '/', expires: date.addToDate(new Date(), { seconds: user.data.data.expiresIn }), secure: process.env.NODE_ENV !== 'development' });
        this.$q.cookies.set('refresh_token', user.data.data.refreshToken, { path: '/', expires: 365, secure: process.env.NODE_ENV !== 'development' });
        this.$q.cookies.set('user_id', user.data.data.user._id, { path: '/', expires: date.addToDate(new Date(), { seconds: user.data.data.expiresIn }), secure: process.env.NODE_ENV !== 'development' });
        await this.$store.dispatch('main/getUser', this.$q.cookies.get('user_id'));
        // if (this.getUser.role.name === 'Client') {
        //   return this.$router.replace({ path: '/dashboard/customer/home' });
        // }
        if (this.$q.platform.is.desktop) {
          this.$store.commit('main/setToggleDrawer', true);
        }

        if (this.$route.query.from) {
          return this.$router.replace({ path: this.$route.query.from });
        }

        if (this.getUser.role.name === 'Client') {
          this.$ga.page(this.$router);
          this.$router.replace({ path: '/dashboard/customer/home' });
        } else if (this.getUser.role.name === 'Auxiliaire' && !this.getUser.administrative.signup.complete) {
          this.$router.replace({ path: '/signupComplete' });
        } else {
          this.$router.replace({ path: '/dashboard/planning' });
        }
      } catch (e) {
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Impossible de se connecter.',
          position: 'bottom-right',
          timeout: 2500
        });
        console.error(e);
      }
    }
  },
  beforeDestroy () {
    // clearTimeout(this.timeout);
  }
}
</script>

<style lang="stylus" scoped>
.alenvi-logo
  width: 300px;
  height: 125px;

.q-field
  margin: 16px 0

/*.alenvi-logo img {
  max-width: 100%;
  height: auto;
}*/
</style>
