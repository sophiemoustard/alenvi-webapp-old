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
      <!-- <br>
      <q-search v-model="searchUserFromMobilePhone" :debounce="600" placeholder="Numéro auxiliaire" type="tel" stack-label="Numéro de téléphone" /> -->
    </div>
  </div>
</template>

<script>

  import twilio from '../../../helpers/twilio'

  import {
    QField,
    QInput,
    QSearch,
    Dialog,
    Toast
  } from 'quasar';

  import users from '../../models/Users'
  import ogust from '../../models/Ogust'
  import activationCode from '../../models/ActivationCode'

  export default {
    components: {
      QField,
      QInput,
      QSearch,
      Toast
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
          Dialog.create({
            title: 'Accueil auxiliaire',
            message: `Accueillir ${this.employee.first_name} ${this.employee.last_name} ?`,
            buttons: [
              {
                label: 'Non',
                handler: () => {
                  Toast.create('Envoi annulé.');
                }
              },
              {
                label: 'Oui',
                raised: true,
                color: 'positive',
                handler: async () => {
                  try {
                    const { code } = await activationCode.create({ mobile_phone: this.employee.mobile_phone });
                    const message = await twilio.sendSMS(this.employee.mobile_phone, { activationCode: code });
                    console.log('SMS envoyé =', message);
                    console.log('Auxiliaire accueilli !');
                  } catch (error) {
                    Toast.create(`Erreur lors de l'envoi du SMS`);
                  }
                }
              }
            ]
          })
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

</script>

<style lang="stylus" scoped>
  @import '~variables'
</style>
