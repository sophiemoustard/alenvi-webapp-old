<template>
  <div class="layout-padding">
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
    </div>
  </div>
</template>

<script>

import { QCard, QCardTitle, QCardActions, QBtn, QIcon } from 'quasar';

import moment from 'moment'

import users from '../../models/Users';
import ogust from '../../models/Ogust';

export default {
  components: {
    QCard,
    QCardTitle,
    QCardActions,
    QBtn,
    QIcon
  },
  data () {
    return {
      user: {},
      salaries: {}
    }
  },
  async created () {
    try {
      this.user = await users.getById(this.$route.params.id);
      this.salaries = await ogust.getEmployeeSalaries(this.user.employee_id);
      for (let i = 0, l = Object.keys(this.salaries).length; i < l; i++) {
        this.salaries[i].period_start = moment(this.salaries[i].period_start, 'YYYYMMDDHHmm').format('MM/YYYY');
      }
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
