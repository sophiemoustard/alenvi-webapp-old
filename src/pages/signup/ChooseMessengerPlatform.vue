<template>
  <div class="row"><!-- Column because we need to activate flex for last button (see his own class), no-wrap so there are no more columns created -->
    <div class="col-12 row signup-header-padding bg-white items-center">
      <div class="col-6">
        <img style="height: 30px" src="https://res.cloudinary.com/alenvi/image/upload/v1539605431/images/business/Compani/compani_logo_1L_RVB_S.png" alt="Logo Compani">
      </div>
      <div class="col-6">
        <p class="no-margin" style="font-size: 0.8rem; text-align: right">Espace Alenvi</p>
      </div>
    </div>
    <div class="col-12 row justify-center neutral-background">
      <div class="signup-body-padding">
        <div class="row justify-center signup-icon-padding">
          <img style="height: 60px" src="https://upload.wikimedia.org/wikipedia/fr/thumb/d/d0/Facebook_Messenger_nouveau_logo.svg/220px-Facebook_Messenger_nouveau_logo.svg.png" alt="">
        </div>
        <p class="no-margin signup-bloctexts">Chez Alenvi, <span class="text-weight-bold">nous utilisons l'application Messenger afin de communiquer avec nos auxiliaires.</span></p>
        <p class="no-margin signup-bloctexts">Pour la télécharger, cliquez sur le bouton ci-dessous correspondant à votre téléphone !</p>
        <div class="row justify-center">
          <div class="col-6" style="width: 136px" @click="sendSMS()">
            <a href="https://play.google.com/store/apps/details?id=com.facebook.orca&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"><img class="badge" alt='Disponible sur Google Play' src='https://play.google.com/intl/en_us/badges/images/generic/fr_badge_web_generic.png'/></a>
          </div>
          <div class="col-6" style="width: 136px" @click="sendSMS()">
            <a href="https://itunes.apple.com/fr/app/messenger/id454638411?mt=8"><img class="badge" style="margin:6%; width:85%" src="statics/App_Store_Badge_FR_RGB_blk_100517.svg" alt="Lien vers l'application Messenger sur l'App Store" /></a>
          </div>
        </div>
        <div class="row justify-center">
          <a :href="messengerLink"><q-btn no-caps class="signup-btn" label="J'ai déjà l'application" icon-right="arrow_forward" color="primary" /></a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

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
      isLoading: false,
      messengerLink: `${process.env.MESSENGER_LINK}`,
      message:
`Attention, avant la signature de ton contrat, tu dois télécharger l'application Facebook Messenger afin de pouvoir utiliser les outils Alenvi.
Voici les deux étapes à suivre:
  1. Si ton téléphone est un Iphone, clique sur ce lien https://appstore.com/messenger, sinon clique sur ce lien: https://play.google.com/store/apps/details?id=com.facebook.orca
  2. Une fois l'application installée, connecte-toi en cliquant sur le lien suivant: ${process.env.MESSENGER_LINK}
Si tu rencontres des difficultés, contacte dès aujourd'hui la personne qui t'a recruté chez Alenvi`,
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
    async sendSMS () {
      try {
        const message = await this.$twilio.sendSMS({
          to: `+33${this.getUser.mobilePhone.substring(1)}`,
          body: this.message,
        });
        console.log('SMS envoyé =', message);
        this.isLoading = false;
        this.$q.notify({
          color: 'positive',
          icon: 'thumb up',
          detail: 'SMS bien envoyé',
          position: 'bottom-right',
          timeout: 2500
        });
      } catch (e) {
        this.isLoading = false;
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de l\'envoi du SMS',
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
      padding: 24px 0px 24px 0px
    &-body-padding
      padding: 0px 24px 0px 24px
    &-bloctexts
      text-align: center
      padding-bottom: 24px
    &-btn
      font-size: 16px
      // @media screen and (min-width: 768px)
      margin-top: 24px
      margin-bottom: 24px
      // @media screen and (max-width: 768px)
      //   border-radius: 0
      //   position: fixed
      //   bottom: 0
      //   left: 0
      //   width: 100%
      //   z-index: 700

  // .neutral-background
  //   @media screen and (max-width: 768px)
  //     height: 85vh

  .badge
    max-width: 100%
    height: auto
</style>
