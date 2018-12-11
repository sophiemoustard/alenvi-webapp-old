<template>
   <div style="max-width: 90vw;">
     <h4>Modifications planning</h4>
     <p class="caption">Sélection des coachs de permanence</p>
     <q-item v-if="coaches" tag="label" v-for="(coach, index) in coaches" :key="index">
       <q-item-side>
         <q-checkbox v-model="coach.isConstrained" @input="handleConstrainedCoach(coach)"></q-checkbox>
       </q-item-side>
       <q-item-main>
         <q-item-tile label>{{ coach.firstname }} {{ coach.lastname }}</q-item-tile>
       </q-item-main>
     </q-item>
   </div>
</template>

<script>

export default {
  data () {
    return {
      checked: null,
      email: '',
      terms: '',
      coaches: null
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
