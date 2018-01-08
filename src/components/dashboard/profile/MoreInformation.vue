<template>
  <div class="layout-padding">
    <div id="picture">
      <img :src="user.alenvi.picture ? user.alenvi.picture : 'https://res.cloudinary.com/alenvi/image/upload/c_scale,h_107,q_auto,w_180/v1513764284/images/users/default_avatar.png'" alt="" style="width: 180px;">
    </div>
    <div class="row justify-center">
      <div class="" style="width: 700px; max-width: 90vw;">
        Prénom: <q-input v-model="user.alenvi.firstname" />
        Nom: <q-input v-model="user.alenvi.lastname" />
        Role: <q-input v-model="user.alenvi.role.name" />
        Date de naissance: <q-input v-model="user.ogust.date_of_birth" type="date"/>
        Email: <q-input v-model="user.alenvi.local.email" />
        Mobile: <q-input v-model="user.ogust.mobile_phone" />
        Identifiant employé: <q-input v-model="user.alenvi.employee_id" />
        Communauté: <select-sector v-if="user.alenvi.sector" v-model="user.alenvi.sector" />
      </div>
    </div>
              EN CONSTRUCTION
  </div>
</template>

<script>

import { QInput } from 'quasar';

import moment from 'moment'

import users from '../../models/Users';
import ogust from '../../models/Ogust';
import SelectSector from '../../SelectSector.vue'

export default {
  components: {
    QInput,
    SelectSector
  },
  data () {
    return {
      user: {
        alenvi: {},
        ogust: {}
      },
      userToSend: {
        alenvi: {},
        ogust: {}
      }
    }
  },
  async created () {
    try {
      this.user.alenvi = await users.getById(this.$route.params.id);
      this.user.ogust = await ogust.getEmployeeById(this.user.alenvi.employee_id);
      this.user.ogust.date_of_birth = moment(this.user.ogust.date_of_birth, 'YYYYMMDD').format('YYYY-MM-DD');
      console.log(this.user);
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
  }
};
</script>

<style lang="stylus" scoped>
@import '~variables';

</style>
