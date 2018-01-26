<template>
  <div class="layout-padding">
    <div class="row justify-center">
      <div style="width: 700px; max-width: 90vw;">
        <p class="caption">Création de compte aidant familial</p>
        <!-- TEST by typing email -->
        <!-- <q-field icon="mail" helper="Adresse email de l'aidant">
          <q-input v-model="email" float-label="Email" :after="[{ icon: 'send', content: true, handler: handleEmail }]"/>
        </q-field> -->
        <!-- TEST by typing the beginning of a client's name -->
        <!-- <q-search v-model="terms" placeholder="Commencez à entrer le nom d'un bénéficiaire...">
          <q-autocomplete @search="search" @selected="selected" />
        </q-search> -->
        <!-- Find client's helpers on the fly -->
        <!-- <q-item tag="label" v-for="(helper, index) in helpers" :key="index">
          <q-item-side>
            <q-checkbox v-model="checked"></q-checkbox>
          </q-item-side>
          <q-item-main>
            <q-item-tile label>{{ helper.first_name }} {{ helper.last_name }}</q-item-tile>
          </q-item-main>
        </q-item> -->
        
        <p>Un mot de passe sera généré automatiquement.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { QField, QInput, Dialog, Toast, QSearch, QAutocomplete, filter, QItem, QItemSide, QItemMain, QItemTile, QCheckbox } from 'quasar';
import randomize from 'randomatic';
import _ from 'lodash';

import users from '../../models/Users';
import ogust from '../../models/Ogust';
import email from '../../models/Email';

export default {
  components: {
    QField,
    QInput,
    Toast,
    QSearch,
    QAutocomplete,
    QItem,
    QItemSide,
    QItemMain,
    QItemTile,
    QCheckbox
  },
  data () {
    return {
      checked: true,
      email: '',
      terms: '',
      helpers: '',
      config: {
        title: 'Liste des aidants Ogust',
        noHeader: false,
        bodyStyle: {
          maxHeight: '700px'
        },
        rowHeight: 'auto',
        pagination: {
          rowsPerPage: 10,
          options: [10, 20, 30]
        },
        messages: {
          noData: 'Pas d\'aidant ou de bénéficiaire'
        },
        labels: {
          allCols: 'Colonnes (toutes)',
          rows: 'Lignes',
          search: 'Rechercher'
        },
        responsive: true
      },
      columns: [
        {
          label: 'Prénom aidant',
          field: 'first_name',
          width: '75px',
          filter: false,
          sort: true,
          type: 'string',
        },
        {
          label: 'Nom aidant',
          field: 'last_name',
          width: '75px',
          filter: false,
          sort: true,
          type: 'string',
        },
        {
          label: 'Nom bénéficiaire',
          field: 'lastNameClient', // TODO: add all last name from clients in this object
          width: '75px',
          filter: false,
          sort: true,
          type: 'string',
        },
        {
          label: 'Enregistré ?',
          field: 'isRegistered',
          filter: false,
          sort: true,
          type: 'boolean',
          width: '75px'
        }
      ]
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
                  } else {
                    // const user = await users.update({ customer_id: customer[0].id_customer });
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
    },
    // terms = word typed in field, done = function to call at the end taking array of object
    async search (terms, done) {
      try {
        let customers = await ogust.getCustomers({ lastName: `${terms}%` });
        if (Object.keys(customers).length == 0) {
          return done([]);
        }
        // Object of object to array of object
        customers = _.sortBy(customers);
        for (let i = 0, l = customers.length; i < l; i++) {
          customers[i].label = customers[i].last_name;
          customers[i].value = customers[i].last_name;
        }
        done(filter(terms, { field: 'last_name', list: customers }));
      } catch (e) {
        console.error(e);
        done([]);
      }
    },
    async selected (item) {
      try {
        this.helpers = await ogust.getCustomerContacts(item.id_customer);
        console.log(this.helpers);
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
