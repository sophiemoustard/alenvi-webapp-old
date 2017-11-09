<template>
  <div class="layout-padding row justify-center">
    <div style="width: 700px; max-width: 90vw;">
      <p class="caption">Création de compte</p>
      <q-field icon="phone" helper="Numéro sans délimiteur (espaces, points...)">
        <q-input v-model="text" float-label="Numéro de téléphone" :after="[{ icon: '', content: true, handler: handleMessage }]"/>
      </q-field>
      <p class="caption">Envoi de code pour compte existant</p>
      <q-field icon="phone" helper="Numéro sans délimiteur (espaces, points...)">
        <q-input v-model="text" float-label="Numéro de téléphone" :after="[sendIcon]"/>
      </q-field>
    </div>
  </div>
</template>

<script>
  import {
    QField,
    QInput,
    QBtn
  } from 'quasar';

  export default {
    components: {
      QField,
      QInput,
      QBtn
    },
    data() {
      return {
        text: ''
      }
    }
  }

</script>

<style lang="stylus">

</style>
