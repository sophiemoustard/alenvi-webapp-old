<template>
  <q-page padding>
    <p v-if="Object.keys(salaries).length == 0">Aucun bulletin à afficher</p>
    <q-card v-if="salaries" inline v-for="(salary, index) in salaries" :key="index" style="cursor: pointer">
      <q-card-title class="text-center">
        {{salary.period_start}}
      </q-card-title>
      <q-card-actions align="around">
        <q-btn flat round small color="primary">
          <a :href="salary.print_url" download>
            <q-icon name="file download" />
          </a>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script>
export default {
  data () {
    return {
      user: {},
      salaries: {}
    }
  },
  async created () {
    try {
      this.user = await this.$users.getById(this.$route.params.id);
      this.salaries = await this.$ogust.getEmployeeSalaries(this.user.employee_id);
      for (let i = 0, l = Object.keys(this.salaries).length; i < l; i++) {
        this.salaries[i].period_start = this.$moment(this.salaries[i].period_start, 'YYYYMMDDHHmm').format('MM/YYYY');
      }
    } catch (e) {
      console.error(e);
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~variables'

a
  color: $primary
  text-decoration: none
</style>
