<template>
  <div :class="['row', 'margin-input', { last: last }]">
    <div class="col-12">
      <div v-if="!!caption" class="row justify-between">
        <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
        <q-icon v-if="error" name="error_outline" color="secondary" />
      </div>
      <q-field :error="error" :error-label="errorLabel">
        <q-input ref="originInput" :value="value" color="white" inverted-light @input="inputHandler" @blur="blurHandler" @focus="focusHandler" :suffix="suffix" :type="type" :rows="rows" :readonly="readOnly" :disable="disable" />
      </q-field>
    </div>
  </div>
</template>

<script>
import { REQUIRED_LABEL } from '../../data/constants';

export default {
  name: 'NiModalInput',
  props: {
    caption: String,
    error: Boolean,
    errorLabel: { type: String, default: REQUIRED_LABEL },
    value: [String, Number],
    last: Boolean,
    suffix: { type: String, default: '' },
    type: { type: String, default: 'text' },
    rows: { type: Number, default: 1 },
    readOnly: { type: Boolean, default: false },
    disable: { type: Boolean, default: false },
    requiredField: { type: Boolean, default: false },
  },
  methods: {
    inputHandler (value) {
      this.$emit('input', value);
    },
    blurHandler () {
      this.$emit('blur');
    },
    focusHandler () {
      this.$emit('focus');
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'
  .q-if-inverted
    border: 1px solid $light-grey

</style>
