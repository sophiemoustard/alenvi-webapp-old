<template>
  <div>
    <q-input color="white" inverted-light :value="value" @blur="blurHandler" align="center" @input="update"
      :after="[{ icon: 'access_time', handler () { toggleSelect(); } }]" />
    <q-select :options="options" :value="value" @input="update" filter filter-placeholder=" " color="white"
      inverted-light hide-underline align="center" class="datetime-item" :ref="name" />
  </div>
</template>

<script>
export default {
  name: 'NiSelectInput',
  props: {
    value: String,
    name: String,
    options: Array,
  },
  methods: {
    toggleSelect () {
      this.$refs[this.name].show();
    },
    blurHandler (hour) {
      if (hour instanceof String) this.$emit('blur', { hour });
    },
    update (hour) {
      this.$emit('blur', { hour });
      if (hour.match(/[0-2][0-9]:(00|30)/)) this.$emit('input', hour);
    },
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .q-input.q-if-inverted
    margin: 0;

  /deep/ .q-select
    &.q-if-inverted
      padding: 0;
    .q-if-inner
      display: none
    .q-icon
      display: none
</style>
