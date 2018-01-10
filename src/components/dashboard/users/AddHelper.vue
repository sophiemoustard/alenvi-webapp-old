<template>
  <div class="layout-padding">
    <div class="row justify-center">
      <div style="width: 700px; max-width: 90vw;">
        <p class="caption">Création de compte aidant familial</p>
        <q-field icon="mail" helper="Adresse email de l'aidant">
          <q-input v-model="email" float-label="Email" :after="[{ icon: 'send', content: true, handler: handleEmail }]"/>
        </q-field>
        <p>Un mot de passe sera généré automatiquement.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { QField, QInput, Dialog, Toast } from 'quasar';

import users from '../../models/Users';
import ogust from '../../models/Ogust';

export default {
  components: {
    QField,
    QInput,
    Toast
  },
  data() {
    return {
      email: ""
    }
  },
  methods: {
    async handleEmail() {
      try {
        const params = { email: this.email };
        const customer = await ogust.getCustomers(params);
        await Dialog.create({
          title: 'Envoi email',
          message: `Voulez-vous accueillir l'aidant ${customer[0].last_name} ?`,
          buttons: [
            {
              label: 'Non',
              handler () {
                console.log('Disagreed...')
              }
            },
            {
              label: 'Oui',
              handler () {
                Toast.create('Email envoyé !')
                console.log('On call la fonction d\'email');
                console.log('Agreed!')
              }
            }
          ]
        })
      } catch (e) {
        console.error(e);
      }
    }
  }
};
</script>

<style lang="stylus" scoped>
@import '~variables';
</style>
