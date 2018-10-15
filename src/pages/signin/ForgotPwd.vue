<template>
  <div class="neutral-background" style="min-height: 100vh">
    <q-card flat class="layout-padding" style="width: 500px; max-width: 90vw">
      <q-card-media>
        <img src="https://res.cloudinary.com/alenvi/image/upload/v1539605431/images/business/Compani/compani_logo_1L_RVB_S.png" alt="Logo Compani" class="responsive">
      </q-card-media>
      <q-card-title>
        Nous allons vous envoyer un email pour réinitialiser votre mot de passe. Veuillez renseigner votre adresse email :
      </q-card-title>
      <q-card-main>
        <p class="input-caption">Email</p>
        <q-field :error="$v.email.$error" error-label="Veuillez rentrer un email valide. (ex: mail@mail.com)">
          <q-input v-model.trim="email" @blur="$v.email.$touch" inverted-light color="white"/>
        </q-field>
      </q-card-main>
      <q-card-actions class="row justify-center">
        <q-btn @click="submit" color="primary" :disable="$v.email.$invalid">Envoyer</q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
import { email, required } from 'vuelidate/lib/validators'

export default {
  data () {
    return {
      email: ''
    }
  },
  validations: {
    email: { email, required }
  },
  methods: {
    async submit () {
      try {
        const payload = { email: this.email.toLowerCase(), from: this.$route.query.from || 'w' };
        await this.$users.forgotPassword(payload);
        this.$q.notify({
          color: 'positive',
          icon: 'thumb up',
          detail: 'Un email a été envoyé à l\'adresse indiquée',
          position: 'bottom-right',
          timeout: 2500
        });
      } catch (e) {
        let content = '';
        if (e.response && e.response.status) {
          if (e.response.status === 400) {
            content = 'Veuillez remplir le champ email.';
          } else if (e.response.status === 404) {
            content = "Aucun utilisateur ne correspond à l'email indiqué";
          } else {
            content = 'Erreur. Si le problème persiste, contactez le support technique';
          }
        }
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: content,
          position: 'bottom-right',
          timeout: 2500
        });
        console.error(e.response);
      }
    }
  },
  beforeDestroy () {
    clearTimeout(this.timeout);
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .bg-negative
    background: white !important
    color: inherit !important
</style>
