<template>
  <div class="row"><!-- Column because we need to activate flex for last button (see his own class) -->
    <div class="col-12 row signup-header-padding bg-white items-center">
      <div class="col-6">
        <img style="height: 30px" src="https://res.cloudinary.com/alenvi/image/upload/v1507019444/images/business/alenvi_logo_complet_183x50.png" alt="">
      </div>
      <div class="col-6">
        <p class="no-margin" style="font-size: 0.8rem; text-align: right">Espace Alenvi</p>
      </div>
    </div>
    <div class="col-12 row justify-center neutral-background">
      <div class="signup-body-padding">
        <div class="row items-center">
          <div class="col-2" style="text-align: left">
            <span><q-icon name="thumb up" size="2rem" /></span>
          </div>
          <div class="col-10 signup-bloctext-padding">
            <p class="no-margin" style="font-size: 0.8rem;">Afin de confirmer la création de votre compte Alenvi, merci de <span class="text-weight-bold">choisir un mot de passe</span></p>
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Email</p>
              <q-icon v-if="$v.user.alenvi.local.email.$error" name="error_outline" color="secondary" />
            </div>
            <q-input v-model.trim="user.alenvi.local.email" color="white" inverted-light lower-case @blur="$v.user.alenvi.local.email.$touch()"/>
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Mot de passe</p>
              <q-icon v-if="$v.user.alenvi.local.password.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.user.alenvi.local.password.$error" :error-label="passwordError">
              <q-input v-model="user.alenvi.local.password" type="password" color="white" inverted-light @blur="$v.user.alenvi.local.password.$touch()"/>
            </q-field>
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Confirmation mot de passe</p>
              <q-icon v-if="$v.passwordConfirm.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.passwordConfirm.$error" :error-label="passwordConfirmError">
              <q-input v-model="passwordConfirm" type="password" color="white" inverted-light lower-case @blur="$v.passwordConfirm.$touch()"/>
            </q-field>
          </div>
        </div>
        <div class="row justify-center">
          <q-btn no-caps class="signup-btn" label="Créer mon compte Alenvi" icon-right="arrow_forward" color="primary" :loading="loading" @click="submit" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { required, email, sameAs, minLength } from 'vuelidate/lib/validators';

export default {
  name: 'CreatePassword',
  data () {
    return {
      loading: false,
      alenviToken: '',
      user: {
        alenvi: {
          _id: '',
          local: {
            email: '',
            password: ''
          }
        }
      },
      passwordConfirm: ''
    }
  },
  validations () {
    return {
      user: {
        alenvi: {
          local: {
            email: { required, email },
            password: { required, minLength: minLength(4) }
          }
        }
      },
      passwordConfirm: { required, sameAsPassword: sameAs(() => this.user.alenvi.local.password) }
    }
  },
  mounted () {
    this.user.alenvi.local.email = this.$q.cookies.get('signup_userEmail');
    this.user.alenvi._id = this.$q.cookies.get('signup_userId');
    this.alenviToken = this.$q.cookies.get('signup_token');
  },
  computed: {
    passwordError () {
      if (!this.$v.user.alenvi.local.password.required) {
        return 'Champ requis';
      } else if (!this.$v.user.alenvi.local.password.minLength) {
        return 'Mot de passe trop court';
      }
    },
    passwordConfirmError () {
      if (!this.$v.passwordConfirm.required) {
        return 'Champ requis';
      } else if (!this.$v.passwordConfirm.sameAs) {
        return 'Le mot de passe doit être identique';
      }
    }
  },
  methods: {
    async submit () {
      try {
        await this.$users.updateById(this.user.alenvi, this.alenviToken);
        this.$q.cookies.remove('signup_token', { path: '/' });
        this.$q.cookies.remove('signup_userId', { path: '/' });
        this.$q.cookies.remove('signup_userEmail', { path: '/' });
        this.$router.replace('/login');
      } catch (e) {
        console.error(e);
        if (e.response) {
          console.log(e.response);
        }
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Echec de la mise à jour de l\'utilisateur',
          position: 'bottom-right',
          timeout: 2500
        });
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
      padding: 0px 24px 0px 24px
    &-btn
      font-size: 16px
      @media screen and (min-width: 768px)
        margin-top: 20px
        margin-bottom: 24px
      @media screen and (max-width: 768px)
        border-radius: 0
        position: absolute
        bottom: 0
        width: 100%

  .margin-input
    margin-bottom: 6px
    &.last
      margin-bottom: 24px

  // disable Quasar default input error colors
  .bg-negative
    background: white !important
    color: black !important

  .neutral-background
    @media screen and (max-width: 768px)
      height: 85vh

</style>
