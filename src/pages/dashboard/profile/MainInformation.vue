<template>
  <q-page padding>
    <div class="row xs-gutter justify-center">
      <div id="picture">
        <img :src="user.alenvi.picture ? user.alenvi.picture : 'https://res.cloudinary.com/alenvi/image/upload/c_scale,h_107,q_auto,w_180/v1513764284/images/users/default_avatar.png'" alt="" style="width: 180px;">
      </div>
      <div>
        <p><strong>{{ user.alenvi.firstname }} {{ user.alenvi.lastname }}</strong></p>
        <p>{{ user.alenvi.role.name }}</p>
        <p v-if="user.alenvi.sector">Communauté: {{ user.community }} ({{ user.alenvi.sector }})</p>
      </div>
    </div>
    <div class="row justify-center">
      EN CONSTRUCTION [Stats, Gamification...]
    </div>
  </q-page>
</template>

<script>
export default {
  data () {
    return {
      user: {
        alenvi: {
          role: {},
          local: {}
        },
        ogust: {
          date_of_birth: ''
        },
        community: ''
      }
    }
  },
  async created () {
    try {
      this.user.alenvi = await this.$users.getById(this.$route.params.id);
      this.user.ogust = await this.$ogust.getEmployeeById(this.user.alenvi.employee_id);
      const sectors = await this.$ogust.getList('employee.sector');
      this.user.community = sectors[this.user.alenvi.sector];
    } catch (e) {
      console.error(e);
    }
  },
}
</script>

<style lang="stylus" scoped>
@import '~variables';
</style>
