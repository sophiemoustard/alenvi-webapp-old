<template>
  <div class="layout-padding">
    <div class="row justify-center">
      <div id="picture">
        <img :src="user.alenvi.picture ? user.alenvi.picture : 'https://res.cloudinary.com/alenvi/image/upload/c_scale,h_107,q_auto,w_180/v1513764284/images/users/default_avatar.png'" alt="" style="width: 180px;">
      </div>
    </div>
    <br>
    <div class="row justify-center">
      <div class="" style="width: 400px; max-width: 90vw;">
        <q-input v-model="user.alenvi.firstname" float-label="Prénom"/>
        <q-input v-model="user.alenvi.lastname" float-label="Nom"/>
        <select-role v-model="user.alenvi.role.name"/>
        <!-- Date de naissance: <input v-model="user.ogust.date_of_birth" type="date" float-label="Date de naissance"/> -->
        <q-input v-model="user.alenvi.local.email" float-label="Email"/>
        <q-input v-model="user.ogust.mobile_phone" float-label="Mobile"/>
        <q-input v-model="user.ogust.landline" float-label="Fixe"/>
      </div>
    </div>
    <div class="row justify-center">
      <q-btn big flat @click="updateUser">Enregistrer</q-btn>
    </div>
  </div>
</template>

<script>

import { QInput, QBtn, Toast } from 'quasar';

// import moment from 'moment'

import users from '../../models/Users';
import ogust from '../../models/Ogust';
import SelectSector from '../../SelectSector.vue'
import SelectRole from '../../SelectRole.vue'

export default {
  components: {
    QInput,
    QBtn,
    Toast,
    SelectSector,
    SelectRole
  },
  data () {
    return {
      user: {
        alenvi: {
          role: {},
          local: {}
        },
        ogust: {}
      }
    }
  },
  async mounted () {
    try {
      this.user.alenvi = await users.getById(this.$route.params.id);
      this.user.ogust = await ogust.getCustomerById(this.user.alenvi.customer_id);
      console.log('OGUST', this.user.ogust);
      // this.user.ogust.date_of_birth = moment(this.user.ogust.date_of_birth, 'YYYYMMDD').format('YYYY-MM-DD');
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
    async updateUser () {
      try {
        const userToSendOgust = {
          id_customer: this.user.alenvi.customer_id,
          first_name: this.user.alenvi.firstname,
          last_name: this.user.alenvi.lastname,
          email: this.user.alenvi.local.email,
          mobile_phone: this.user.ogust.mobile_phone,
          landline: this.user.ogust.landline
        };
        const userToSendAlenvi = {
          _id: this.$route.params.id,
          firstname: this.user.alenvi.firstname,
          lastname: this.user.alenvi.lastname,
          local: {
            email: this.user.alenvi.local.email
          }
        };
        await ogust.setEmployee(userToSendOgust);
        await users.updateById(userToSendAlenvi);
        Toast.create('Profil mis à jour');
      } catch (e) {
        Toast.create('Erreur lors de la mise à jour de votre profil');
        console.error(e);
      }
    }
  }
};
</script>

<style lang="stylus" scoped>
@import '~variables';

</style>
