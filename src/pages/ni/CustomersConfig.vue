<template>
  <q-page class="neutral-background" padding>
    <div v-if="company">
      <h4>Configuration bénéficiaires</h4>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Services</p>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Informations</p>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Documents</p>
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  data () {
    return {
      company: null,
    };
  },
  computed: {
    user () {
      return this.$store.getters['main/user'];
    },
  },
  mounted () {
    this.company = this.user.company;
  },
}
</script>
