<template>
  <div class="layout-padding row justify-center">
    <div style="width: 700px; max-width: 90vw;">
      <p class="caption">Blabla</p>
    </div>
  </div>
</template>

<script>
import { QCard } from 'quasar';

import users from '../../models/Users';
import ogust from '../../models/Ogust';

export default {
  components: {
    QCard,
  },
  data() {
    return {

    }
  },
  methods: {
  }
};
</script>

<style lang="stylus" scoped>
@import '~variables';
</style>
