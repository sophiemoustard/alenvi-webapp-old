<template>
  <div>
    <div class="full-width row signup-header-padding">
      <div class="col-6">
        <img style="height: 30px" src="https://res.cloudinary.com/alenvi/image/upload/v1507124345/images/business/alenvi_logo_complet_full.png" alt="">
      </div>
      <div class="col-6">Espace Auxiliaire d'envie</div>
    </div>
    <div class="signup-body-padding">
      <div class="row justify-between items-baseline">
        <div class="col-2" style="text-align: left">
          <span><q-icon name="clear" size="1rem" /></span>
        </div>
        <div class="col-10">
          <h5>Afin de confirmer la création de votre compte Alenvi, merci de <span class="text-weight-bold">choisir un mot de passe</span></h5>
        </div>
      </div>
      <div class="row margin-input">
        <div class="col-12">
          <div class="row justify-between">
            <p class="input-caption">Message</p>
          </div>
          <q-input v-model="message" type="textarea" rows="7"
            color="white" inverted-light
          />
        </div>
      </div>
      <div class="row justify-between">
        <p class="input-caption">Adresse email</p>
        <q-icon v-if="$v.user.alenvi.local.email.$error" name="error_outline" color="secondary" />
      </div>
      <q-input v-model.trim="user.alenvi.local.email"
        color="white"
        inverted-light
        lower-case
        @focus="saveTmp('local.email')"
        @blur="updateUser({ alenvi: 'local.email', ogust: 'email' })"
      />
    </div>
    <q-btn no-caps class="full-width signup-btn" label="Envoyer message" icon-right="send" color="primary" :loading="loading" @click="sendMessage()" />
  </div>
</template>

<script>
export default {

}
</script>

<style lang="stylus" scoped>

  .signup
    &-header-padding
      padding: 24px 24px 24px 24px
    &-body-padding
      padding: 0px 24px 0px 24px
    &-btn
      border-radius: 0

  .margin-input
    margin-bottom: 6px
    &.last
      margin-bottom: 24px
</style>
