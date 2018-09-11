<template>
  <div class="row"><!-- Column because we need to activate flex for last button (see his own class), no-wrap so there are no more columns created -->
    <div class="col-12 row signup-header-padding bg-white items-center">
      <div class="col-6">
        <img style="height: 30px" src="https://res.cloudinary.com/alenvi/image/upload/v1507019444/images/business/alenvi_logo_complet_183x50.png" alt="">
      </div>
      <div class="col-6">
        <p class="no-margin" style="font-size: 0.8rem; text-align: right">Espace Alenvi</p>
      </div>
    </div>
    <div class="col-12 neutral-background signup-body-padding">
      <div class="row justify-center signup-icon-padding">
        <img style="height: 50px" src="https://upload.wikimedia.org/wikipedia/fr/thumb/d/d0/Facebook_Messenger_nouveau_logo.svg/220px-Facebook_Messenger_nouveau_logo.svg.png" alt="">
      </div>
      <p class="row justify-center no-margin signup-bloctexts">Chez Alenvi, <span class="text-weight-bold">Nous utilisons l'application Messenger afin de communiquer avec nos auxiliaires.</span></p>
      <p class="row justify-center no-margin signup-bloctexts">Pour la télécharger, cliquez sur le bouton ci-dessous correspondant à votre téléphone !</p>
      <!-- <div class="row margin-input">
        <div class="col-12">
          <div class="row justify-center">
            <a style="" href='https://play.google.com/store/apps/details?id=com.facebook.orca&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'><img alt='Disponible sur Google Play' src='https://play.google.com/intl/en_us/badges/images/generic/fr_badge_web_generic.png'/></a>
          </div>
        </div>
      </div> -->
      <!-- <div class="row margin-input">
        <div class="col-12">
          <div class="row justify-between">
            <p class="input-caption">Email</p>
          </div>
          <q-input @keyup.enter="submit" v-model.trim="credentials.email" color="white" inverted-light lower-case/>
        </div>
      </div>
      <div class="row margin-input">
        <div class="col-12">
          <div class="row justify-between">
            <p class="input-caption">Mot de passe</p>
          </div>
          <q-input @keyup.enter="submit" v-model="credentials.password" type="password" color="white" inverted-light/>
        </div>
      </div>
      <router-link class="row justify-end" :to="{ path: '/forgotPassword', query: { from: 'w' } }"><small>Mot de passe oublié ?</small></router-link> -->
      <div class="row justify-center">
        <q-btn no-caps class="signup-btn" label="Me connecter" icon-right="ion-log-in" color="primary" @click="submit()" />
      </div>
    </div>
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
  name: 'Authentication',
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
  }
}
</script>

<style lang="stylus" scoped>

  .signup
    &-header-padding
      padding: 24px 24px 12px 24px
    &-icon-padding
      padding: 12px 24px 12px 24px
    &-bloctexts
      font-size: 0.8rem
      text-align: center
      padding: 0px 0px 24px 0px
    &-body-padding
      margin: 0 auto 0 auto
      padding: 0px 24px 0px 24px
    &-btn
      @media screen and (min-width: 768px)
        font-size: 16px
        margin-bottom: 24px
      @media screen and (max-width: 768px)
        border-radius: 0
        position: absolute
        bottom: 0
        width: 100%

  .neutral-background
    @media screen and (max-width: 768px)
      height: 85vh

</style>
