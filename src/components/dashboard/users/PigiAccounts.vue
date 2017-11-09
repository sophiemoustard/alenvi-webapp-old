<template>
  <div class="layout-padding row justify-center">
    <div style="width: 700px; max-width: 90vw;">
      <p class="caption">Création de compte Alenvi</p>
      <q-field icon="phone" helper="Numéro sans délimiteur (espaces, points...)">
        <q-input v-model="text" float-label="Numéro de téléphone" :after="[{ icon: 'send', content: true, handler: handleMessage }]"/>
      </q-field>
      <p class="caption">Envoi de code pour compte existant</p>
      <q-field icon="phone" helper="Numéro sans délimiteur (espaces, points...)">
        <q-input v-model="text" float-label="Numéro de téléphone" :after="[{ icon: 'send', content: true, handler: handleMessage }]"/>
      </q-field>
      <br>
      <q-search v-model="searchUserFromMobilePhone" :debounce="600" placeholder="Numéro auxiliaire" type="tel" stack-label="Numéro de téléphone" />
    </div>
  </div>
</template>

<script>
  import {
    QField,
    QInput,
    QSearch
  } from 'quasar';

  export default {
    components: {
      QField,
      QInput,
      QSearch
    },
    data() {
      return {
        text: '',
        searchUserFromMobilePhone: ''
      }
    },
    methods: {
      handleMessage() {
        return ;
      }
    }
  }

</script>

<style lang="stylus">

</style>
