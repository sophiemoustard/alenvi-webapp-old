<template>
  <div :class="['row', 'margin-input', { last: last }]">
    <div class="col-12">
      <div class="row justify-between">
        <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
        <q-icon v-if="error" name="error_outline" color="secondary" />
      </div>
      <q-field :error="error" :error-label="errorLabel">
        <q-option-group :value="value" @input="inputHandler" @blur="blurHandler" :options="options" :readonly="readOnly" :type="type" :inline="inline" />
      </q-field>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NiModalInput',
  props: {
    caption: String,
    error: Boolean,
    errorLabel: { type: String, default: 'Champ requis' },
    value: [String, Array],
    last: Boolean,
    readOnly: { type: Boolean, default: false },
    requiredField: { type: Boolean, default: false },
    options: Array,
    type: String,
    inline: { type: Boolean, default: false }
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

  .bg-negative
    background: none !important
    color: inherit !important

  .margin-input
    margin-bottom: 6px
    &.last
      margin-bottom: 24px

  .required::after
    content: ' *'
</style>
