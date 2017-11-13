<template>
  <div class="layout-padding row justify-center">
    <div style="width: 700px; max-width: 90vw;">
      <p class="caption">Création de compte Alenvi</p>
      <q-field icon="phone" helper="Numéro sans délimiteur (espaces, points...)">
        <q-input v-model="phoneNbr" float-label="Numéro de téléphone" :after="[{ icon: 'send', content: true, handler: handlePhone }]"/>
      </q-field>
      <p class="caption">Envoi de code pour compte existant</p>
      <q-field icon="phone" helper="Numéro sans délimiteur (espaces, points...)">
        <q-input v-model="phoneNbr" float-label="Numéro de téléphone" :after="[{ icon: 'send', content: true, handler: handlePhone }]"/>
      </q-field>
      <p v-if="employee">Est-ce bien l'auxiliaire {{ employee.first_name }} {{ employee.last_name }} que tu souhaites accueillir ?</p>
      <!-- <br>
      <q-search v-model="searchUserFromMobilePhone" :debounce="600" placeholder="Numéro auxiliaire" type="tel" stack-label="Numéro de téléphone" /> -->
    </div>
  </div>
</template>

<script>
  import {
    QField,
    QInput,
    QSearch,
    Dialog
  } from 'quasar';

  import users from '../../models/Users'
  import ogust from '../../models/Ogust';

  export default {
    components: {
      QField,
      QInput,
      QSearch,
      Dialog
    },
    data() {
      return {
        phoneNbr: '',
        // searchUserFromMobilePhone: ''
        employee: ''
      }
    },
    methods: {
      async handlePhone() {
        try {
          const payload = {
            mobile_phone: this.phoneNbr
          }
          const res = await ogust.getEmployees(payload);
          this.employee = res[0];
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

</script>

<style lang="stylus">

</style>
