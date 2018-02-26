<template>
  <div class="layout-padding">
    <div class="row justify-center">
      <div style="width: 700px; max-width: 90vw;">
        <p class="caption">Sélection des coachs de permanence</p>
        <q-item tag="label" v-for="(coach, index) in coaches" :key="index">
          <q-item-side>
            <q-checkbox v-model="coach.isConstrained" @input="handleConstrainedCoach(coach)"></q-checkbox>
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

export default {
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
      this.coaches = await this.$users.showAll({ role: 'Coach' });
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
        await this.$users.updateById({ _id: coach._id, isConstrained: coach.isConstrained });
        this.$q.notify({
          color: 'positive',
          icon: 'thumb up',
          detail: 'Coachs de permanence mis à jour',
          position: 'bottom-right',
          duration: 2500
        });
      } catch (e) {
        console.error(e);
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de la mise à jour des coachs de permanence',
          position: 'bottom-right',
          duration: 2500
        });
      }
    }
  }
};
</script>

<style lang="stylus" scoped>
@import '~variables';
</style>
