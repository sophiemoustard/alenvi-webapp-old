<template>
  <div class="neutral-background column" style="height: 100vh"><!-- Column because we need to activate flex for last button (see his own class) -->
    <div class="row signup-header-padding bg-white items-center">
      <div class="col-6">
        <img style="height: 30px" src="https://res.cloudinary.com/alenvi/image/upload/v1507019444/images/business/alenvi_logo_complet_183x50.png" alt="">
      </div>
      <div class="col-6">
        <p class="no-margin" style="font-size: 0.8rem">Espace Auxiliaire d'envie</p>
      </div>
    </div>
    <div class="signup-body-padding">
      <div class="row justify-between items-center">
        <div class="col-2" style="text-align: left">
          <span><q-icon name="thumb up" size="2rem" /></span>
        </div>
        <div class="col-10 signup-bloctext-padding">
          <p class="no-margin" style="font-size: 0.8rem">Afin de confirmer la création de votre compte Alenvi, merci de <span class="text-weight-bold">choisir un mot de passe</span></p>
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
          <!-- <div class="row justify-between"> -->
            <p class="input-caption">Mot de passe</p>
            <!-- <q-icon v-if="$v.user.alenvi.local.password.$error" name="error_outline" color="secondary" /> -->
          <!-- </div> -->
          <q-field :error="$v.user.alenvi.local.password.$error" :error-label="passwordError">
            <q-input v-model="user.alenvi.local.password" type="password" color="white" inverted-light lower-case @blur="$v.user.alenvi.local.password.$touch()"/>
          </q-field>
        </div>
      </div>
      <div class="row margin-input">
        <div class="col-12">
          <div class="row justify-between">
            <p class="input-caption">Confirmation mot de passe</p>
            <q-icon v-if="$v.passwordConfirm.$error" name="error_outline" color="secondary" />
          </div>
          <q-field :error="$v.passwordConfirm.$error" :error-label="passwordError">
            <q-input v-model="passwordConfirm" type="password" color="white" inverted-light lower-case @blur="$v.passwordConfirm.$touch()"/>
          </q-field>
        </div>
      </div>
    </div>
    <div class="flex-align-end">
      <q-btn no-caps class="full-width signup-btn" label="Envoyer message" icon-right="send" color="primary" :loading="loading" @click="sendMessage()" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { required, email, sameAs, minLength } from 'vuelidate/lib/validators';

export default {
  name: 'CreatePassword',
  data () {
    return {
      loading: false,
      user: {
        alenvi: {
          local: {
            email: 'pierre.hofman@gmail.com',
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
  computed: {
    ...mapGetters({
      // currentUser: 'main/user',
      // user: 'rh/getUserProfile'
    }),
    passwordError () {
      if (!this.$v.user.alenvi.local.password.required) {
        return 'Champ requis';
      } else if (!this.$v.user.alenvi.local.password.minLength) {
        return 'Mot de passe trop court';
      }
    },
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
      border-radius: 0

  .margin-input
    margin-bottom: 6px
    &.last
      margin-bottom: 24px

  .flex-align-end
    flex-grow: 1
    display: flex
    align-items: flex-end

</style>
