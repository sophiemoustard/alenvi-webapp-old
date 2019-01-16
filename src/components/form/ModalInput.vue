<template>
  <div :class="['row', 'margin-input', { last: last }]">
    <div class="col-12">
      <div class="row justify-between">
        <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
        <q-icon v-if="error" name="error_outline" color="secondary" />
      </div>
      <q-field :error="error" :error-label="errorLabel">
        <q-input :value="value" color="white" inverted-light @input="inputHandler" @blur="blurHandler" :suffix="suffix" :type="type" :rows="rows" :readonly="readOnly" />
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
    value: [String, Number],
    last: Boolean,
    suffix: { type: String, default: '' },
    type: { type: String, default: 'text' },
    rows: { type: Number, default: 1 },
    readOnly: { type: Boolean, default: false },
    requiredField: { type: Boolean, default: false }
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
