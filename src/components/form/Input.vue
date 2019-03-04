<template>
  <div v-if="displayInput" class="col-xs-12 col-md-6">
    <div class="row justify-between">
      <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
      <q-icon v-if="error" name="error_outline" color="secondary" />
    </div>
    <q-field :error="error" :error-label="errorLabel">
      <q-input
        :value="value"
        color="white"
        inverted-light
        @focus="focusHandler"
        @blur="blurHandler"
        @input="update"
        :upper-case="upperCase"
        :lower-case="lowerCase"
        :type="type"
        :disable="disable"
        :rows="rows"
        :suffix="suffix"
        :class="{'borders': borders}"
      />
    </q-field>
  </div>
</template>

<script>
import { REQUIRED_LABEL } from '../../data/constants';

export default {
  props: {
    caption: String,
    error: Boolean,
    errorLabel: { type: String, default: REQUIRED_LABEL },
    value: [String, Number],
    upperCase: { type: Boolean, default: false },
    lowerCase: { type: Boolean, default: false },
    disable: { type: Boolean, default: false },
    type: { type: String, default: 'text' },
    rows: { type: Number, default: 1 },
    displayInput: { type: Boolean, default: true },
    suffix: { type: String, default: '' },
    borders: { type: Boolean, default: false },
    requiredField: { type: Boolean, default: false }
  },
  methods: {
    blurHandler (event) {
      this.$emit('blur');
    },
    focusHandler (event) {
      this.$emit('focus');
    },
    update (value) {
      this.$emit('input', value);
    },
  },
}
</script>

<style lang="stylus" scoped>
@import '~variables'
  .borders
    border: 1px solid $light-grey !important
</style>
