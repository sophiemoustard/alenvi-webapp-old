<template>
  <div class="row justify-center layout-padding">
    <q-card flat class="layout-padding" style="width: 500px; max-width: 90vw">
      <q-card-media>
        <img src="https://res.cloudinary.com/alenvi/image/upload/c_scale,q_auto,w_400/v1507124345/images/business/alenvi_logo_complet_full.png" alt="Logo Alenvi" class="responsive">
      </q-card-media>
      <q-card-title>
        Nous allons vous envoyer un email pour réinitialiser votre mot de passe. Veuillez renseigner votre adresse email :
      </q-card-title>
      <q-card-main>
        <q-field icon="mail" :error="$v.email.$error" error-label="Veuillez rentrer un email valide. (ex: mail@mail.com)">
          <q-input v-model.trim="email" float-label="Email" @blur="$v.email.$touch"/>
        </q-field>
      </q-card-main>
      <q-card-actions class="row justify-end">
        <q-btn @click="submit" color="primary" :disable="$v.email.$invalid">Envoyer</q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
import { QInput, QCard, QCardTitle, QCardMain, QCardSeparator, QCardActions, QCardMedia, QBtn, QField } from 'quasar'
import { email, required } from 'vuelidate/lib/validators'

import users from '../models/Users'
import { alenviAlert } from '../../helpers/alerts'

export default {
  components: {
    QInput,
    QCard,
    QCardTitle,
    QCardMain,
    QCardSeparator,
    QCardActions,
    QCardMedia,
    QBtn,
    QField
  },
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
        await users.forgotPassword({ email: this.email });
        alenviAlert({
          color: 'positive',
          icon: 'thumb up',
          content: "Un email a été envoyé à l'adresse indiquée.",
          position: 'bottom-right',
          duration: 3000
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
        alenviAlert({
          color: 'error',
          icon: 'warning',
          content,
          position: 'bottom-right',
          duration: 3000
        });
        console.error(e.response);
      }
    }
  },
  beforeDestroy () {
    clearTimeout(this.timeout);
  }
};
</script>

<style lang="stylus" scoped>
  @import '~variables'

</style>
