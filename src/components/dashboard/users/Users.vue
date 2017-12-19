<template>
  <div class="layout-padding justify-center">
    <!-- <div style="width: 700px; max-width: 90vw;"> -->
    <p>EN CONSTRUCTION</p>
    <q-card style="width: 150px">
      <q-card-media>
        <img src="https://res.cloudinary.com/alenvi/image/upload/q_auto/v1507023533/images/users/IT/Jean-Christophe.jpg" />
      </q-card-media>
      <q-card-title class="text-center">
        Princesse Jasmine
      </q-card-title>
      <!-- <q-card-separator />
      <q-card-main>
        Card Content
      </q-card-main> -->
    </q-card>
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
      users: []
    }
  },
  methods: {
  }
};
</script>

<style lang="stylus" scoped>
@import '~variables';
</style>
