<template>
  <div :class="['row', 'margin-input', { last: last }]">
    <div class="col-12">
      <div v-if="displayCaption" class="row justify-between">
        <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
        <q-icon v-if="error" name="error_outline" color="secondary" />
      </div>
      <q-field :error="error" :error-label="errorLabel" class="col-12">
        <q-option-group :value="value" @input="inputHandler" @blur="blurHandler" :options="options" :readonly="readOnly"
          :type="type" :inline="inline" />
      </q-field>
    </div>
  </div>
</template>

<script>
import { REQUIRED_LABEL } from '../../data/constants';

export default {
  name: 'NiOptionGroup',
  props: {
    caption: String,
    error: Boolean,
    errorLabel: { type: String, default: REQUIRED_LABEL },
    value: [String, Array],
    last: Boolean,
    readOnly: { type: Boolean, default: false },
    requiredField: { type: Boolean, default: false },
    options: Array,
    type: String,
    inline: { type: Boolean, default: false },
    displayCaption: { type: Boolean, default: true },
  },
  methods: {
    inputHandler (value) {
      this.$emit('input', value);
    },
    blurHandler () {
      this.$emit('blur');
    },
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables'
  .required::after
    content: ' *'
</style>
