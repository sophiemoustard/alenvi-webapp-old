<template>
  <div class="layout-padding row justify-center">
    <!-- <div style="width: 700px; max-width: 90vw;"> -->
    <!-- <p>EN CONSTRUCTION</p> -->
    <q-card inline v-for="(user, index) in users" :key="index" style="width: 180px; cursor: pointer" @click="toProfile(user._id)">
      <q-card-media>
        <img :src="user.picture ? user.picture : 'https://res.cloudinary.com/alenvi/image/upload/c_scale,h_107,q_auto,w_180/v1513764284/images/users/default_avatar.png'" alt="">
        <!-- <img src="https://res.cloudinary.com/alenvi/image/upload/q_auto/v1507023533/images/users/IT/Jean-Christophe.jpg" /> -->
      </q-card-media>
      <q-card-title class="text-center">
        {{user.firstname}}<br />{{user.lastname}}
      </q-card-title>
    </q-card>
    <!-- </div> -->
  </div>
</template>

<script>

import { QCard, QCardMain, QCardSeparator, QCardTitle, QCardMedia } from 'quasar';
import _ from 'lodash'

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
        _.remove(this.users, (o) => { return o.firstname === 'Admin' || o.firstname === 'Pigi' });
      } catch (e) {
        console.error(e);
      }
    },
    toProfile(userId) {
      this.$router.push({ name: 'profile', params: { id: userId }});
    }
  }
};
</script>

<style lang="stylus" scoped>
@import '~variables';
</style>
