<template>
  <div>
    <div class="layout-padding">
      <div class="row justify-center">
        <div class="alenvi-logo">
          <img src="https://res.cloudinary.com/alenvi/image/upload/v1507124345/images/business/alenvi_logo_complet_full.png" class="responsive">
        </div>
      </div>
      <div class="row justify-center">
        <q-field class="col-xs-12 col-sm-3" icon="vpn_key" :error="$v.credentials.password.$error" :error-label="passwordError">
          <q-input v-model="credentials.password" float-label="Nouveau mot de passe" type="password" @blur="$v.credentials.password.$touch"/>
        </q-field>
      </div>
      <div class="row justify-center">
        <q-field class="col-xs-12 col-sm-3" icon="check" :error="$v.credentials.passwordConfirm.$error" error-label="Le mot de passe entré et la confirmation sont différents.">
          <q-input @keyup.enter="submit" v-model="credentials.passwordConfirm" float-label="Confirmation mot de passe" type="password" @blur="$v.credentials.passwordConfirm.$touch"/>
        </q-field>
      </div>
      <div class="row justify-center">
        <div class="col-xs-12 col-sm-3">
          <q-btn class="full-width" color="primary" @click="submit()" flat :disable="$v.credentials.$invalid">Login</q-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import {
  QField,
  QInput,
  QBtn,
  Cookies,
  date
} from 'quasar'

import { required, sameAs, minLength, maxLength } from 'vuelidate/lib/validators'

import users from '../../models/Users'
import { alenviAlert } from '../../../helpers/alerts'

export default {
  components: {
    QField,
    QInput,
    QBtn
  },
  data () {
    return {
      credentials: {
        password: '',
        passwordConfirm: ''
      }
    }
  },
  validations: {
    credentials: {
      password: { required, minLength: minLength(6), maxLength: maxLength(20) },
      passwordConfirm: { required, sameAsPassword: sameAs('password') }
    }
  },
  computed: {
    getUser () {
      return this.$store.getters.user;
    },
    passwordError () {
      if (!this.$v.credentials.password.required) {
        return 'Champ requis';
      } else if (!this.$v.credentials.password.minLength || !this.$v.credentials.password.maxLength) {
        return 'Le mot de passe doit contenir entre 6 et 20 caractères.'
      }
    }
  },
  methods: {
    async submit () {
      try {
        const user = await users.update(`${process.env.API_HOSTNAME}/users/`, {
          password: this.credentials.password
        });
        this.$router.replace({ path: '/login' });
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
