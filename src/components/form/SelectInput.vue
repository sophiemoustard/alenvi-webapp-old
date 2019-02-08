<template>
  <div>
    <q-input color="white" inverted-light :value="value" @blur="blurHandler" align="center" @input="update" @focus="toggleSelect"
      :class="[ isFocused ? 'underline' : '']" />
    <q-select :options="options" :value="value" @input="update" color="white" inverted-light hide-underline align="center"
      :ref="name" />
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
  data () {
    return {
      isFocused: false,
    };
  },
  methods: {
    toggleSelect () {
      this.$refs[this.name].show();
      this.isFocused = true;
    },
    blurHandler (hour) {
      if (hour instanceof String) this.$emit('blur', { hour });
      this.isFocused = false;
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
    width: 100%;
    margin: 0;
    border-radius: 0;

  /deep/ .q-select
    &.q-if-inverted
      padding: 0;
      transform: translateY(2px);
    .q-if-inner
      display: none;
    .q-icon
      display: none;

  .underline
    border-bottom: 2px solid $primary;

</style>
