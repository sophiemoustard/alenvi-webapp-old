<template>
  <div style="max-width: 90vw;">
    <q-item v-if="tasks" tag="label" v-for="(task, index) in tasks" :key="index">
      <q-item-side>
        <q-checkbox v-model="task.check.isDone" @input="handleTask(task)" />
      </q-item-side>
      <q-item-main>
        <q-item-tile label>{{ task.task.name }}</q-item-tile>
      </q-item-main>
    </q-item>
  </div>
</template>

<script>
import { displayTask } from '../helpers/taskValidation.js'
export default {
  data () {
    return {
      tasks: null
    }
  },
  computed: {
    getUser () {
      return this.$store.getters['rh/getUserProfile'];
    }
  },
  async mounted () {
    try {
      const user = await this.$users.getById(this.getUser._id);
      this.tasks = user.procedure.filter(task => displayTask(task, user));
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
    async handleTask (task) {
      try {
        await this.$users.updateTask({ user_id: this.getUser._id, task_id: task.task._id, isDone: task.check.isDone });
        this.$store.dispatch('rh/getUserProfile', this.getUser._id);
        this.$q.notify({
          color: 'positive',
          icon: 'thumb up',
          detail: 'Tâche mise à jour',
          position: 'bottom-right',
          duration: 2500
        });
      } catch (e) {
        console.error(e);
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de la mise à jour de la tâche',
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
