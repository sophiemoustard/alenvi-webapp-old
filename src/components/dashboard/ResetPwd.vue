<template>
  <div class="row justify-center layout-padding">
    <q-card flat class="layout-padding" style="width: 500px; max-width: 90vw">
      <q-card-media>
        <img src="https://res.cloudinary.com/alenvi/image/upload/c_scale,q_auto,w_400/v1507124345/images/business/alenvi_logo_complet_full.png" alt="Logo Alenvi" class="responsive">
      </q-card-media>
      <q-card-title>
        Veuillez renseigner un nouveau mot de passe:
      </q-card-title>
      <q-card-main>
        <q-field :error="$v.passwords.password.$error" helper="6 caractères minimum"
          error-label="Le mot de passe doit contenir entre 6 et 20 caractères.">
          <q-input icon="vpn key" type="password" float-label="Nouveau mot de passe" v-model.trim="passwords.password" @blur="$v.passwords.password.$touch" />
        </q-field>
        <q-field :error="$v.passwords.passwordConfirm.$error" error-label="Le mot de passe entré et la confirmation sont différents.">
          <q-input type="password" float-label="Confirmation nouveau mot de passe" v-model.trim="passwords.passwordConfirm" @blur="$v.passwords.passwordConfirm.$touch" />
        </q-field>
      </q-card-main>
      <q-card-actions class="row justify-end">
        <q-btn @click="submit" color="primary" :disable="$v.passwords.$invalid">Envoyer</q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
import { QInput, QCard, QCardMain, QCardSeparator, QCardActions, QCardMedia, QBtn, QField, QCardTitle } from 'quasar'
import { sameAs, minLength, maxLength, required } from 'vuelidate/lib/validators'

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
      passwords: {
        password: '',
        passwordConfirm: ''
      },
      token: null,
      userId: null,
      userEmail: '',
      timeout: null
    }
  },
  async beforeRouteEnter (to, from, next) {
    try {
      if (to.params.token) {
        const checkToken = await users.checkResetPasswordToken(to.params.token);
        next(vm => vm.setData(checkToken));
      } else {
        next({ path: '/dashboard/error403Pwd' });
      }
    } catch (e) {
      console.error(e.response);
      next({ path: '/dashboard/error403Pwd' });
    }
  },
  validations: {
    passwords: {
      password: {
        required,
        minLength: minLength(6),
        maxLength: maxLength(20)
      },
      passwordConfirm: {
        required,
        sameAsPassword: sameAs('password')
      }
    }

  },
  methods: {
    setData (checkToken) {
      console.log('CHECKTOKEN', checkToken);
      this.token = checkToken.token;
      this.userId = checkToken.user._id;
      this.userEmail = checkToken.user.email;
      console.log(this.token);
      console.log(this.userId);
    },
    async submit () {
      try {
        const userPayload = {
          _id: this.userId,
          local: {
            password: this.passwords.password
          },
          resetPassword: {
            token: null,
            expiresIn: null
          }
        };
        await users.updateById(userPayload, this.token);
        alenviAlert({
          color: 'positive',
          icon: 'warning',
          content: 'Mot de passe changé. Redirection vers la page de connexion...',
          position: 'bottom-right',
          duration: 2000
        });
        this.timeout = setTimeout(() => {
          this.$router.replace({ path: '/login' });
        }, 2000)
      } catch (e) {
        alenviAlert({
          color: 'error',
          icon: 'warning',
          content: 'Erreur. Si le problème persiste, contactez le support technique',
          position: 'bottom-right',
          duration: 2000
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
