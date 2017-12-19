<template>
  <div class="layout-padding justify-center">
    <!-- <div style="width: 700px; max-width: 90vw;"> -->
    <!-- <p>EN CONSTRUCTION</p>
    <q-card v-for="(user, index) in users" :key="index" style="width: 150px">
      <q-card-media>
        <img :src="user.picture" alt=""> -->
        <!-- <img src="https://res.cloudinary.com/alenvi/image/upload/q_auto/v1507023533/images/users/IT/Jean-Christophe.jpg" /> -->
      <!-- </q-card-media>
      <q-card-title class="text-center">
        {{user.first_name}} {{user.last_name}}
      </q-card-title>
    </q-card> -->
    <!-- </div> -->
  </div>
</template>

<script>

import { QCard, QCardMain, QCardSeparator, QCardTitle, QCardMedia } from 'quasar';

import users from '../../models/Users';
import ogust from '../../models/Ogust';

export default {
  components: {
    QCard,
    QCardTitle,
    QCardMain,
    QCardSeparator,
    QCardMedia
  },
  data() {
    return {
      users: {}
    }
  },
  created() {
    this.getUsers();
  },
  methods: {
    async getUsers() {
      try {
        this.users = await users.showAll();
        console.log(this.users);
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
