<template>
  <div class="layout-padding">
    <div id="intro" class="row xs-gutter justify-center">
      <div id="picture">
        <img :src="user.picture ? user.picture : 'https://res.cloudinary.com/alenvi/image/upload/c_scale,h_107,q_auto,w_180/v1513764284/images/users/default_avatar.png'" alt="">
      </div>
      <div>
        <p>PEDRO EL PAPO</p>
        <p>IL SIGNORE GOBELEDO</p>
        <p>Girafe</p>
      </div>
    </div>
    <!-- Picture -->
    <!-- First name -->
    <!-- Last name -->
    <!-- Role -->
    <!-- Date of birth -->
    <!-- Email -->
    <!-- Mobile phone -->
    <!-- Employee id -->
    <!-- Communauté (Sector), ex: "Girafe (1b*)" -->

    <!--  -->
  </div>
</template>

<script>

import _ from 'lodash'

import users from '../../models/Users';
import ogust from '../../models/Ogust';

export default {
  components: {
  },
  data() {
    return {
      user: {}
    }
  },
  created() {
  },
  methods: {
  }
};
</script>

<style lang="stylus" scoped>
@import '~variables';

// #intro
//   width: 100%

</style>
