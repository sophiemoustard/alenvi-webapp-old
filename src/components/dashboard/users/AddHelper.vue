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
import randomize from 'randomatic';

import users from '../../models/Users';
import ogust from '../../models/Ogust';
import email from '../../models/Email';

export default {
  components: {
    QField,
    QInput,
    Toast
  },
  data () {
    return {
      email: ''
    }
  },
  methods: {
    async handleEmail () {
      try {
        const params = { email: this.email };
        const customer = await ogust.getCustomers(params);
        if (!customer[0]) {
          return Toast.create('Impossible de trouver cet utilisateur')
        }
        Dialog.create({
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
              handler: async () => {
                try {
                  // Check if user already exist in Alenvi DB: if yes, send email, if no create customer then send email
                  const user = await users.showAll({ customer_id: customer[0].id_customer });
                  const password = randomize('0', 6);
                  if (!user) {
                    const userCreated = await users.create({
                      local: {
                        email: this.email,
                        password
                      },
                      customer_id: customer[0].id_customer,
                      lastname: customer[0].last_name,
                      role: 'Client'
                    });
                    Toast.create(`Utilisateur ${customer[0].last_name} créé dans la base Alenvi`);
                  }
                  const sendEmail = await email.sendWelcome({
                    sender: {
                      email: 'contact@alenvi.io'
                    },
                    receiver: {
                      email: this.email,
                      title: customer[0].title,
                      name: customer[0].last_name,
                      password
                    }
                  });
                  Toast.create('Email envoyé !')
                } catch (e) {
                  console.error(e);
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
};
</script>

<style lang="stylus" scoped>
@import '~variables';
</style>
