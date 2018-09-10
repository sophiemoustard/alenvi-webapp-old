<template>
  <div class="neutral-background column"><!-- Column because we need to activate flex for last button (see his own class) -->
    <div class="row signup-header-padding bg-white items-center">
      <div class="col-6">
        <img style="height: 30px" src="https://res.cloudinary.com/alenvi/image/upload/v1507019444/images/business/alenvi_logo_complet_183x50.png" alt="">
      </div>
      <div class="col-6">
        <p class="no-margin" style="font-size: 0.8rem; text-align: right">Espace Alenvi</p>
      </div>
    </div>
    <div class="signup-body-padding">
      <div class="row justify-between items-center">
        <div class="col-2" style="text-align: left">
          <span><q-icon name="lock" size="2rem" /></span>
        </div>
        <div class="col-10 signup-bloctext-padding">
          <p class="no-margin" style="font-size: 0.8rem">Pour vous connecter à votre compte Alenvi, merci de <span class="text-weight-bold">saisir votre identifiant</span> et votre <span class="text-weight-bold">mot de passe</span></p>
        </div>
      </div>
      <div class="row margin-input">
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
      <router-link class="row justify-end" :to="{ path: '/forgotPassword', query: { from: 'w' } }"><small>Mot de passe oublié ?</small></router-link>
    </div>
    <div class="flex-align-end">
      <q-btn no-caps class="signup-btn" label="Me connecter" icon-right="ion-log-in" color="primary" @click="submit()" />
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
    &-bloctext-padding
      padding: 24px 0px 24px 0px
    &-body-padding
      margin: 0 auto 0 auto
      padding: 0px 24px 0px 24px
    &-btn
      @media screen and (min-width: 768px)
        font-size: 16px
      @media screen and (max-width: 768px)
        border-radius: 0
        width: 100% !important
        margin-left: 0 !important
        margin-right: 0 !important

  .margin-input
    margin-bottom: 6px
    &.last
      margin-bottom: 24px

  .flex-align-end
    @media screen and (min-width: 768px)
      margin: 10px auto 15px auto
    @media screen and (max-width: 768px)
      flex-grow: 1
      display: flex
      align-items: flex-end

  // disable Quasar default input error colors
  .bg-negative
    background: white !important
    color: black !important

  .neutral-background
    @media screen and (max-width: 768px)
      height: 100vh

</style>
