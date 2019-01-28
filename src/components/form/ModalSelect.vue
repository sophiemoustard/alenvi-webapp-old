<template>
  <div :class="['row', 'margin-input', { last: last }]">
    <div class="col-12">
      <div class="row justify-between">
        <p class="input-caption">{{ caption }}</p>
        <q-icon v-if="error" name="error_outline" color="secondary" />
      </div>
      <q-field :error="error" :error-label="errorLabel">
        <q-select :filter="filter" :filter-placeholder="filterPlaceholder" :value="value" color="white" inverted-light :options="options"
          @input="inputHandler" @blur="blurHandler" :disable="disable" />
      </q-field>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NiModalSelect',
  props: {
    caption: String,
    error: Boolean,
    errorLabel: { type: String, default: 'Champ requis' },
    value: [String, Array],
    last: Boolean,
    options: Array,
    filter: { type: Boolean, default: true },
    filterPlaceholder: { type: String, default: 'Rechercher' },
    disable: { type: Boolean, default: false },
  },
  methods: {
    inputHandler (value) {
      this.$emit('input', value);
    },
    blurHandler () {
      this.$emit('blur');
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'
  .q-if-inverted
    border: 1px solid $light-grey

  .margin-input
    margin-bottom: 6px
    &.last
      margin-bottom: 24px
</style>
