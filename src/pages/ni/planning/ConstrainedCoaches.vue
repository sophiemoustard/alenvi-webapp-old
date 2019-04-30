<template>
  <q-page class="neutral-background layout-padding">
    <div style="max-width: 90vw;">
      <h4>Modifications planning</h4>
      <p class="caption">Sélection des coachs de permanence</p>
      <q-item tag="label" v-for="(coach, index) in coaches" :key="index">
        <q-item-side>
          <q-checkbox v-model="coach.isConstrained" @input="handleConstrainedCoach(coach)"></q-checkbox>
        </q-item-side>
        <q-item-main>
          <q-item-tile label>{{ coach.identity.firstname }} {{ coach.identity.lastname }}</q-item-tile>
        </q-item-main>
      </q-item>
    </div>
  </q-page>
</template>

<script>
import { NotifyPositive, NotifyNegative } from '../../../components/popup/notify';

export default {
  name: 'ConstrainedCoaches',
  metaInfo: { title: 'Permanences' },
  data () {
    return {
      checked: null,
      email: '',
      terms: '',
      coaches: []
    }
  },
  async mounted () {
    try {
      const coaches = await this.$users.showAll({ role: 'Coach' });
      for (let i = 0, l = coaches.length; i < l; i++) {
        if (!coaches[i].isConstrained) {
          coaches[i].isConstrained = false;
        }
      }
      this.coaches = coaches;
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
    async handleConstrainedCoach (coach) {
      try {
        await this.$users.updateById({ _id: coach._id, isConstrained: coach.isConstrained });
        NotifyPositive('Coachs de permanence mis à jour');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la mise à jour des coachs de permanence');
      }
    }
  }
};
</script>

<style lang="stylus" scoped>
@import '~variables';
</style>
