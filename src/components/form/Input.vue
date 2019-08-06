<template>
  <div v-if="!hidden" :class="{
    'col-xs-12 col-md-6': !forModal,
    'margin-input full-width': forModal,
    last: last
    }">
    <div class="row justify-between">
      <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
      <q-icon v-if="error" name="error_outline" color="secondary" />
    </div>
    <q-field :error="error" :error-label="errorLabel">
      <q-input
        :ref="name"
        :value="value"
        color="white"
        inverted-light
        @focus="onFocus"
        @blur="onBlur"
        @input="update"
        :upper-case="upperCase"
        :lower-case="lowerCase"
        :type="type"
        :disable="disable"
        :readOnly="readOnly"
        :rows="rows"
        :suffix="suffix"
        :class="{'borders': borders || forModal}"
      />
    </q-field>
  </div>
</template>

<script>
import { REQUIRED_LABEL } from '../../data/constants';

export default {
  name: 'NiInput',
  props: {
    caption: String,
    error: Boolean,
    errorLabel: { type: String, default: REQUIRED_LABEL },
    value: [String, Number],
    upperCase: { type: Boolean, default: false },
    lowerCase: { type: Boolean, default: false },
    disable: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
    type: { type: String, default: 'text' },
    rows: { type: Number, default: 1 },
    hidden: { type: Boolean, default: false },
    suffix: { type: String, default: '' },
    borders: { type: Boolean, default: false },
    requiredField: { type: Boolean, default: false },
    name: String,
    forModal: { type: Boolean, default: false },
    last: { type: Boolean, default: false },
  },
  methods: {
    onBlur (event) {
      if (this.type === 'number') {
        this.$nextTick(() => {
          this.$emit('blur');
        });
      } else {
        this.$emit('blur');
      }
    },
    onFocus (event) {
      this.$emit('focus');
    },
    update (value) {
      this.$emit('input', value);
    },
    focus () {
      return this.$refs[this.name].focus();
    },
    select () {
      return this.$refs[this.name].select();
    },
  },
}
</script>

<style lang="stylus" scoped>
@import '~variables'
  .borders
    border: 1px solid $light-grey !important
</style>
