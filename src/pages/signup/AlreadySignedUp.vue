<template>
  <div class="fixed-center text-center">
    <p>
      <q-icon
        name="thumb_up"
        size="5rem"
      />
    </p>
    <p class="text-faded">Tu as déjà complété ton inscription !</p>
    <q-btn color="primary" style="width:200px;" @click="goToPigi">Retour Pigi</q-btn><!-- @click="$router.push('/')" -->
  </div>
</template>

<script>
import { openURL } from 'quasar'

export default {
  methods: {
    goToPigi () {
      openURL(process.env.MESSENGER_LINK);
    }
  }
}
</script>
