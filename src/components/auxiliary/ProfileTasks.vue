<template>
  <div v-if="tasks">
    <q-item tag="label" v-for="(task, index) in tasks" :key="index">
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
import { displayTask } from '../../helpers/taskValidation.js';
import { NotifyPositive, NotifyNegative } from '../popup/notify.js';

export default {
  data () {
    return {
      tasks: null,
    }
  },
  computed: {
    getUser () {
      return this.$store.getters['rh/getUserProfile'];
    },
  },
  async mounted () {
    try {
      const tasks = await this.$users.getTasks(this.getUser._id);
      this.tasks = tasks.filter(task => displayTask(task, this.getUser));
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
    async handleTask (task) {
      try {
        await this.$users.updateTask({ user_id: this.getUser._id, task_id: task.task._id, isDone: task.check.isDone });
        this.$store.dispatch('rh/getUserProfile', { userId: this.getUser._id });
        NotifyPositive('Tâche mise à jour');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la mise à jour de la tâche');
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
@import '~variables';
</style>
