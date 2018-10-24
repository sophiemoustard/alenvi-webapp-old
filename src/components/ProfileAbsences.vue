<template>
  <div>
  </div>
</template>

<script>
export default {
  data () {
    return {
    }
  },
  computed: {
    getUser () {
      return this.$store.getters['rh/getUserProfile'];
    }
  },
  async mounted () {
    try {
      const user = await this.$users.getById(this.getUser._id);
      console.log(user);
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
  }
};
</script>

<style lang="stylus" scoped>
@import '~variables';
</style>
