<template>
  <div class="layout-padding">
    <div class="row justify-center">
      <div style="width: 700px; max-width: 90vw;">
        <p class="caption">Sélection des coachs de permanence</p>
        <q-item tag="label" v-for="(coach, index) in coaches" :key="index">
          <q-item-side>
            <q-checkbox v-model="coach.isConstrained" @change="handleConstrainedCoach(coach)"></q-checkbox>
          </q-item-side>
          <q-item-main>
            <q-item-tile label>{{ coach.firstname }} {{ coach.lastname }}</q-item-tile>
          </q-item-main>
        </q-item>
      </div>
    </div>
  </div>
</template>

<script>
import { QItem, QItemSide, QItemMain, QItemTile, QCheckbox } from 'quasar';
import _ from 'lodash';

import users from '../../models/Users';

export default {
  components: {
    QItem,
    QItemSide,
    QItemMain,
    QItemTile,
    QCheckbox
  },
  data () {
    return {
      checked: null,
      email: '',
      terms: '',
      coaches: {}
    }
  },
  async created () {
    try {
      this.coaches = await users.showAll({ role: 'Coach' });
      for (let i = 0, l = this.coaches.length; i < l; i++) {
        if (!this.coaches[i].isConstrained) {
          this.coaches[i].isConstrained = false;
        }
      }
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
    async handleConstrainedCoach (coach) {
      try {
        const userUpdated = await users.updateById({ _id: coach._id, isConstrained: coach.isConstrained });
        console.log(userUpdated);
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
