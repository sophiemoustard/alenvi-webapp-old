<template>
  <div class="layout-padding">
    <div class="row xs-gutter justify-center">
      <div id="picture">
        <img :src="user.alenvi.picture ? user.alenvi.picture : 'https://res.cloudinary.com/alenvi/image/upload/c_scale,h_107,q_auto,w_180/v1513764284/images/users/default_avatar.png'" alt="" style="width: 180px;">
      </div>
      <div>
        <p><strong>{{ user.alenvi.firstname }} {{ user.alenvi.lastname }}</strong></p>
        <p>{{ user.alenvi.role.name }}</p>
        <p v-if="user.alenvi.sector">Communauté: {{ user.alenvi.sector }}</p>
      </div>
    </div>
    <div class="row justify-center">
      EN CONSTRUCTION [Stats, Gamification...]
    </div>
  </div>
</template>

<script>

import _ from 'lodash'

import users from '../../models/Users';
import ogust from '../../models/Ogust';

export default {
  components: {
  },
  data() {
    return {
      user: {
        alenvi: {},
        ogust: {}
      }
    }
  },
  async created() {
    try {
      this.user.alenvi = await users.getById(this.$route.params.id);
      this.user.ogust = await ogust.getEmployeeById(this.user.alenvi.employee_id);
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
