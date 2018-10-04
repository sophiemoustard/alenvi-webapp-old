<template>
  <q-page class="neutral-background" padding>
    <div class="center-account">
      <q-field icon="email">
        <q-input v-model="user.credentials.email" float-label="Email" />
      </q-field>
      <q-field icon="ion-android-lock" helper="Entrez votre nouveau mot de passe. Il doit contenir au moins 6 caractères jusqu'à 20 maximum" :error="$v.user.credentials.password.$error"
        error-label="Le mot de passe doit contenir entre 6 et 20 caractères.">
        <q-input type="password" float-label="Nouveau mot de passe" v-model.trim="user.credentials.password" @blur="$v.user.credentials.password.$touch" />
      </q-field>
      <q-field icon="ion-android-lock" :error="$v.user.credentials.passwordConfirm.$error" error-label="Le mot de passe entré et la confirmation sont différents.">
        <q-input type="password" float-label="Confirmation nouveau mot de passe" v-model.trim="user.credentials.passwordConfirm" @blur="$v.user.credentials.passwordConfirm.$touch" />
      </q-field>
    </div>
  </q-page>
</template>

<script>
import { required, email, sameAs, minLength, maxLength } from 'vuelidate/lib/validators'

export default {
  data () {
    return {
      user: {
        credentials: {
          email: '',
          password: '',
          passwordConfirm: ''
        }
      }
    }
  },
  validations: {
    user: {
      credentials: {
        email: { required, email },
        password: {
          minLength: minLength(6),
          maxLength: maxLength(20)
        },
        passwordConfirm: {
          sameAsPassword: sameAs('password')
        }
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  .center-account
    max-width: 40%
    margin-left: auto
    margin-right: auto
</style>
