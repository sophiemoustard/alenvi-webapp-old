<template>
  <q-page padding class="row justify-center">
      <div style="width: 700px; max-width: 90vw;">
        <p class="caption">Création de compte aidant familial</p>
        <!-- TEST by typing email -->
        <!-- <q-field icon="mail" helper="Adresse email de l'aidant">
          <q-input v-model="email" float-label="Email" :after="[{ icon: 'send', content: true, handler: handleEmail }]"/>
        </q-field> -->
        <!-- TEST by typing the beginning of a client's name -->
        <q-search v-model="terms" placeholder="Commencez à entrer le nom d'un bénéficiaire...">
          <q-autocomplete @search="search" @selected="selected" />
        </q-search>
        <!-- Find client's helpers on the fly -->
        <q-item v-if="helpers" tag="label" v-for="(helper, index) in helpers" :key="index">
          <q-item-side>
            <q-checkbox v-model="helper.checked" :disable="helper.checked" @input="handleEmail(helper, index)"></q-checkbox>
          </q-item-side>
          <q-item-main>
            <q-item-tile label>{{ helper.last_name }} {{ helper.first_name }}</q-item-tile>
          </q-item-main>
        </q-item>

        <p>Un mot de passe sera généré automatiquement.</p>
      </div>
  </q-page>
</template>

<script>
import { filter } from 'quasar'
import randomize from 'randomatic';
import _ from 'lodash';

export default {
  data () {
    return {
      // checked: false,
      email: '',
      terms: '',
      helpers: null
      // config: {
      //   title: 'Liste des aidants Ogust',
      //   noHeader: false,
      //   bodyStyle: {
      //     maxHeight: '700px'
      //   },
      //   rowHeight: 'auto',
      //   pagination: {
      //     rowsPerPage: 10,
      //     options: [10, 20, 30]
      //   },
      //   messages: {
      //     noData: 'Pas d\'aidant ou de bénéficiaire'
      //   },
      //   labels: {
      //     allCols: 'Colonnes (toutes)',
      //     rows: 'Lignes',
      //     search: 'Rechercher'
      //   },
      //   responsive: true
      // },
      // columns: [
      //   {
      //     label: 'Prénom aidant',
      //     field: 'first_name',
      //     width: '75px',
      //     filter: false,
      //     sort: true,
      //     type: 'string',
      //   },
      //   {
      //     label: 'Nom aidant',
      //     field: 'last_name',
      //     width: '75px',
      //     filter: false,
      //     sort: true,
      //     type: 'string',
      //   },
      //   {
      //     label: 'Nom bénéficiaire',
      //     field: 'lastNameClient', // TODO: add all last name from clients in this object
      //     width: '75px',
      //     filter: false,
      //     sort: true,
      //     type: 'string',
      //   },
      //   {
      //     label: 'Enregistré ?',
      //     field: 'isRegistered',
      //     filter: false,
      //     sort: true,
      //     type: 'boolean',
      //     width: '75px'
      //   }
      // ]
    }
  },
  methods: {
    async handleEmail (helper, index) {
      try {
        this.$q.dialog({
          title: 'Envoi email',
          message: `Voulez-vous accueillir l'aidant ${helper.last_name} ?`,
          ok: 'Confirmer',
          cancel: 'Non'
        }).then(async () => {
          const password = randomize('0', 6);
          if (helper.checked) {
            await this.$users.create({
              local: {
                email: helper.email,
                password
              },
              customer_id: helper.id_customer,
              lastname: helper.last_name,
              role: 'Client'
            });
            this.$q.notify({
              color: 'positive',
              icon: 'thumb up',
              detail: `Utilisateur ${helper.last_name} créé dans la base Alenvi`,
              position: 'bottom-right',
              timeout: 2500
            });
          } // else
          // const user = await users.update({ customer_id: customer[0].id_customer });
          //
          await this.$email.sendWelcome({
            sender: {
              email: 'support@alenvi.io'
            },
            receiver: {
              email: helper.email,
              title: helper.title,
              name: helper.last_name,
              password
            }
          });
          this.$q.notify({
            color: 'positive',
            icon: 'thumb up',
            detail: 'Email envoyé',
            position: 'bottom-right',
            timeout: 2500
          });
        }).catch(() => {
          this.helpers[index].checked = false;
        });
      } catch (e) {
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de l\'envoi de l\'email',
          position: 'bottom-right',
          timeout: 2500
        });
        console.error(e);
      }
    },
    // terms = word typed in field
    // done = function to call at the end, taking array of object
    async search (terms, done) {
      try {
        let customers = await this.$ogust.getCustomers({ last_name: `${terms}%` });
        if (Object.keys(customers).length === 0) {
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
        this.helpers = [];
        const ogustHelpers = await this.$ogust.getCustomerContacts(item.id_customer);
        const filteredOgustHelpers = _.filter(ogustHelpers, helper => helper.email);
        // console.log('ogust', filteredOgustHelpers);
        const alenviHelpers = await this.$users.showAll({ role: 'Client' });
        // console.log('alenvi', alenviHelpers);
        let processed = false;
        for (let k = 0, l = filteredOgustHelpers.length; k < l; k++) {
          for (let i = 0, len = alenviHelpers.length; i < len; i++) {
            if (alenviHelpers[i].local.email === filteredOgustHelpers[k].email) {
              processed = true;
              this.helpers.push({
                first_name: filteredOgustHelpers[k].first_name,
                last_name: filteredOgustHelpers[k].last_name,
                email: filteredOgustHelpers[k].email,
                id_customer: filteredOgustHelpers[k].id_customer,
                checked: true
              });
            }
          }
          if (!processed) {
            this.helpers.push({
              first_name: filteredOgustHelpers[k].first_name,
              last_name: filteredOgustHelpers[k].last_name,
              email: filteredOgustHelpers[k].email,
              id_customer: filteredOgustHelpers[k].id_customer,
              checked: false
            });
          }
          processed = false;
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
}
</script>

<style>
</style>
