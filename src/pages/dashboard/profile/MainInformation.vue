<template>
  <q-page v-if="user.alenvi" padding>
    <div class="row justify-center">
      <img :src="user.alenvi.picture.link" alt="" class="avatar">
    </div><br>
    <div class="row justify-center">
      <div>
        <p><strong>{{ user.alenvi.firstname }} {{ user.alenvi.lastname }}</strong></p>
        <p>{{ user.alenvi.role.name }}</p>
        <p v-if="user.alenvi.sector">Communauté: {{ user.community }} ({{ user.alenvi.sector }})</p>
      </div>
    </div>
    EN CONSTRUCTION [Stats, Gamification...]
  </q-page>
</template>

<script>
export default {
  data () {
    return {
      user: {
        alenvi: null,
        ogust: null,
        community: ''
      }
    }
  },
  async created () {
    try {
      this.user.alenvi = await this.$users.getById(this.$route.params.id);
      if (this.user.alenvi.employee_id >= 9) {
        this.user.ogust = await this.$ogust.getEmployeeById(this.user.alenvi.employee_id);
        const sectors = await this.$ogust.getList('employee.sector');
        this.user.community = sectors[this.user.alenvi.sector];
      }
    } catch (e) {
      console.error(e);
    }
  },
}
</script>

<style lang="stylus" scoped>
@import '~variables';
</style>
