<template>
  <div>
    <q-input color="white" inverted-light :value="value" @blur="blurHandler" align="center" @input="update"
      :after="[{ icon: 'access_time', handler () { toggleSelect(); } }]" />
    <q-select :options="options" v-model="value" @input="update" filter filter-placeholder=" "
      color="white" inverted-light hide-underline align="center" class="datetime-item" :id="idKey" />
  </div>
</template>

<script>
export default {
  name: 'NiSelectInput',
  props: {
    value: String,
    idKey: String,
    options: Array,
  },
  methods: {
    toggleSelect () {
      document.getElementById(this.idKey).click();
    },
    blurHandler (event) {
      this.$emit('blur');
    },
    update (value) {
      if (value.match(/[0-2][0-9]:(00|30)/)) this.$emit('input', value);
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
