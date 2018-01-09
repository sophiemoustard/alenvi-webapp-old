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
        <p v-if="user.alenvi.employee_id">Id Alenvi: {{ user.alenvi._id }}</p>
        <p v-if="user.alenvi.employee_id">Id Ogust: {{ user.alenvi.employee_id }}</p>
        <q-input v-model="user.alenvi.firstname" float-label="Prénom"/>
        <q-input v-model="user.alenvi.lastname" float-label="Nom"/>
        <select-role v-model="user.alenvi.role.name"/>
        <!-- Date de naissance: <input v-model="user.ogust.date_of_birth" type="date" float-label="Date de naissance"/> -->
        <q-input v-model="user.alenvi.local.email" float-label="Email"/>
        <q-input v-model="user.ogust.mobile_phone" float-label="Mobile"/>
        <select-sector v-if="user.alenvi.sector" v-model="user.alenvi.sector"/>
      </div>
    </div>
    <div class="row justify-center">
      <q-btn big flat @click="updateUser()">Modifier</q-btn>
    </div>
  </div>
</template>

<script>

import { QInput, QBtn, Toast } from 'quasar';

import moment from 'moment'

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
  async created () {
    try {
      this.user.alenvi = await users.getById(this.$route.params.id);
      this.user.ogust = await ogust.getEmployeeById(this.user.alenvi.employee_id);
      // console.log('ALENVI=', this.user.alenvi);
      // console.log('OGUST=', this.user.ogust);
      this.user.ogust.date_of_birth = moment(this.user.ogust.date_of_birth, 'YYYYMMDD').format('YYYY-MM-DD');
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
    async updateUser() {
      try {
        const userToSendOgust = {
          id_employee: this.user.alenvi.employee_id,
          first_name: this.user.alenvi.firstname,
          last_name: this.user.alenvi.lastname,
          email: this.user.alenvi.local.email,
          mobile_phone: this.user.ogust.mobile_phone,
          sector: this.user.alenvi.sector
          // title: this.user.ogust.title,
          // main_adress: this.user.ogust.main_address
        };
        const userToSendAlenvi = {
          _id: this.$route.params.id,
          firstname: this.user.alenvi.firstname,
          lastname: this.user.alenvi.lastname,
          local: {
            email: this.user.alenvi.local.email
          },
          sector: this.user.alenvi.sector,
          role: this.user.alenvi.role.name
        };
        const userUpdatedAlenvi = await users.updateById(userToSendAlenvi);
        Toast.create(`Utilisateur Alenvi bien mis-à-jour`);
        const userUpdatedOgust = await ogust.setEmployee(userToSendOgust);
        Toast.create(`Utilisateur Ogust bien mis-à-jour`);
      } catch (e) {
        Toast.create(`Erreur lors de la mise-à-jour de l'utilisateur`);
        console.error(e);
      }
    }
  }
};
</script>

<style lang="stylus" scoped>
@import '~variables';

</style>
