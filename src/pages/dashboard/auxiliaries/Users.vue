<template>
  <q-page padding class="row justify-center">
    <q-card inline flat v-for="(user, index) in users" :key="index" style="width: 180px; cursor: pointer" @click.native="toProfile(user._id)">
      <q-card-media>
        <img :src="user.picture && user.picture.link ? user.picture.link : 'https://res.cloudinary.com/alenvi/image/upload/c_scale,h_400,q_auto,w_400/v1513764284/images/users/default_avatar.png'" alt="">
        <!-- <img src="https://res.cloudinary.com/alenvi/image/upload/q_auto/v1507023533/images/users/IT/Jean-Christophe.jpg" /> -->
      </q-card-media>
      <q-card-title class="text-center">
        {{user.firstname}}<br />{{user.lastname}}
      </q-card-title>
    </q-card>
  </q-page>
</template>

<script>
import _ from 'lodash'

export default {
  data () {
    return {
      users: {}
    }
  },
  created () {
    this.getUsers();
  },
  methods: {
    async getUsers () {
      try {
        this.users = await this.$users.showAll();
        _.remove(this.users, (o) => { return o.firstname === 'Admin' || o.firstname === 'Pigi' || o.role.name === 'Client' });
      } catch (e) {
        console.error(e);
      }
    },
    toProfile (userId) {
      this.$router.push({ name: 'personal info', params: { id: userId } });
    }
  }

}
</script>

<style lang="stylus" scoped>
@import '~variables';
</style>
