<template>
  <div class="neutral-background" style="min-height: 100vh">
    <q-card flat class="layout-padding" style="width: 500px; max-width: 90vw">
      <q-card-media>
        <img src="https://res.cloudinary.com/alenvi/image/upload/v1539605431/images/business/Compani/compani_logo_1L_RVB_S.png" alt="Logo Compani" class="responsive">
      </q-card-media>
      <q-card-title>
        Veuillez renseigner un nouveau mot de passe:
      </q-card-title>
      <q-card-main>
        <div class="margin-input">
          <p class="input-caption">Nouveau mot de passe (6 caractères minimum)</p>
          <q-field :error="$v.passwords.password.$error"
            error-label="Le mot de passe doit contenir entre 6 et 20 caractères.">
            <q-input icon="vpn key" type="password" v-model.trim="passwords.password" @blur="$v.passwords.password.$touch"
              inverted-light color="white" />
          </q-field>
        </div>
        <div class="margin-input">
          <p class="input-caption">Confirmation nouveau mot de passe</p>
          <q-field :error="$v.passwords.passwordConfirm.$error" error-label="Le mot de passe entré et la confirmation sont différents.">
            <q-input type="password" v-model.trim="passwords.passwordConfirm" @blur="$v.passwords.passwordConfirm.$touch"
              inverted-light color="white" />
          </q-field>
        </div>
      </q-card-main>
      <q-card-actions class="row justify-center">
        <q-btn @click="submit" color="primary" :disable="$v.passwords.$invalid">Envoyer</q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
import { sameAs, minLength, maxLength, required } from 'vuelidate/lib/validators'

import users from '../../api/Users'

export default {
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
        next({ path: '/error403Pwd' });
      }
    } catch (e) {
      if (e.response) {
        console.error(e.response);
      } else {
        console.error(e);
      }
      next({ path: '/error403Pwd' });
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
      this.token = checkToken.token;
      this.userId = checkToken.user._id;
      this.userEmail = checkToken.user.email;
      this.from = checkToken.user.from;
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
            expiresIn: null,
            from: null
          }
        };
        await this.$users.updateById(userPayload, this.token);
        let detail = '';
        let action = null;
        switch (this.from) {
          case 'p':
            detail = 'Mot de passe changé. Redirection vers Pigi...';
            action = () => {
              window.location.href = `${process.env.MESSENGER_LINK}`;
            };
            break;
          default:
            detail = 'Mot de passe changé. Redirection vers la page de connexion...';
            action = () => {
              this.$router.replace({ path: '/login' });
            };
        }
        this.$q.notify({
          color: 'positive',
          icon: 'thumb up',
          detail,
          position: 'bottom-right',
          timeout: 2500
        });
        this.timeout = setTimeout(action, 2000)
      } catch (e) {
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur, si le problème persiste, contactez le support technique',
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

  .margin-input
    margin-bottom: 10px

  .bg-negative
    background: white !important
    color: inherit !important
</style>
