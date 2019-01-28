<template>
  <q-page class="neutral-background" padding>
    <h4>Mon compte</h4>
    <div class="center-account">
      <p class="input-caption">Email</p>
      <q-field class="margin-input" :error="$v.user.credentials.email.$error" error-label="Email invalide.">
        <q-input v-model.trim="user.credentials.email" @blur="$v.user.credentials.email.$touch" inverted-light color="white" />
      </q-field>
      <p class="input-caption">Nouveau mot de passe</p>
      <q-field class="margin-input" :error="$v.user.credentials.password.$error" error-label="Le mot de passe doit contenir entre 6 et 20 caractères.">
        <q-input type="password" v-model.trim="user.credentials.password" @blur="$v.user.credentials.password.$touch" inverted-light color="white" />
      </q-field>
      <p class="input-caption">Confirmation mot de passe</p>
      <q-field class="margin-input last" :error="$v.user.credentials.passwordConfirm.$error" error-label="Le mot de passe entré et la confirmation sont différents.">
        <q-input type="password" v-model.trim="user.credentials.passwordConfirm" @blur="$v.user.credentials.passwordConfirm.$touch" inverted-light color="white" />
      </q-field>
      <div class="row justify-center">
        <q-btn big @click="updateUser()" color="primary" :disabled="$v.user.$invalid">Modifier</q-btn>
      </div>
      <hr style="margin-top: 5%; margin-bottom: 5%">
      <div class="row justify-center">
        <q-btn big color="primary" @click="logout">Déconnexion</q-btn>
      </div>
    </div>
  </q-page>
</template>

<script>
import { required, email, sameAs, minLength, maxLength } from 'vuelidate/lib/validators';
import { NotifyPositive, NotifyNegative } from '../components/popup/notify';

export default {
  metaInfo: {
    title: 'Mon compte'
  },
  data () {
    return {
      user: {
        credentials: {
          email: '',
          password: '',
          passwordConfirm: ''
        },
        alenvi: {}
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
  },
  async mounted () {
    try {
      this.user.alenvi = await this.$users.getById(this.$route.params.id);
      this.user.credentials.email = this.user.alenvi.local.email;
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
    async updateUser () {
      try {
        const userToSend = {
          _id: this.$route.params.id,
          local: {
            email: this.user.credentials.email
          }
        };
        if (this.user.credentials.password) {
          userToSend.local.password = this.user.credentials.password
        };
        await this.$users.updateById(userToSend);
        NotifyPositive('Profil mis à jour');
        this.user.credentials.password = '';
        this.user.credentials.passwordConfirm = '';
      } catch (e) {
        NotifyNegative('Erreur lors de la mise à jour du profil');
        this.user.credentials.password = '';
        this.user.credentials.passwordConfirm = '';
        console.error(e);
      }
    },
    logout () {
      this.$q.cookies.remove('alenvi_token', { path: '/' });
      this.$q.cookies.remove('alenvi_token_expires_in', { path: '/' });
      this.$q.cookies.remove('refresh_token', { path: '/' });
      this.$q.cookies.remove('user_id', { path: '/' });
      this.$router.replace('/login');
    }
  }
}
</script>

<style lang="stylus" scoped>

  .center-account
    max-width: 40%
    @media screen && (max-width: 600px)
      max-width: 100%
</style>
