<template>
  <div class="layout-padding">
    <p class="text-center">Entre tes identifiants pour continuer avec Pigi !</p>
    <div class="row justify-center">
      <div class="alenvi-logo">
        <img src="https://res.cloudinary.com/alenvi/image/upload/v1499948101/images/bot/Pigi.png" class="responsive">
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
</template>

<script>
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
        window.location.href = `${process.env.MESSENGER_LINK}?ref=${token}`
      } catch (e) {
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
.alenvi-logo
  width: 125px
  height: 125px
.q-field
  margin: 0 0 10px 0
</style>
