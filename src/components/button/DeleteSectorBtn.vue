<template>
  <q-btn :disable="disable" :flat="flat" :round="round" :small="small" :color="color" :icon="icon" @click="clickHandler" :sector="sector" />
</template>

<script>
export default {
  name: 'DeleteSectorBtn',
  props: {
    flat: Boolean,
    round: Boolean,
    small: Boolean,
    color: String,
    icon: String,
    sector: String
  },
  data () {
    return {
      disable: false,
      test: []
    }
  },
  async created () {
    await this.hasAuxiliaries();
  },
  watch: {
    async sector (val) {
      await this.hasAuxiliaries();
    }
  },
  methods: {
    clickHandler () {
      this.$emit('click');
    },
    async hasAuxiliaries () {
      try {
        if (this.sector) {
          const auxiliaries = await this.$users.showAll({ sector: this.sector });
          this.disable = auxiliaries.length > 0;
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
}
</script>
