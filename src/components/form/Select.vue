<template>
  <div :class="{ 'col-xs-12 col-md-6': !inModal, 'margin-input full-width': inModal, last: last }">
    <div v-if="caption" class="row justify-between">
      <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
      <q-icon v-if="error" name="error_outline" color="secondary" />
    </div>
    <q-field :error="error" :error-label="errorLabel">
      <q-select :value="value" color="white" inverted-light :options="options" :filter="filter"
        :filter-placeholder="filterPlaceholder" :clearable="clearable" :multiple="multiple"
        :class="{'borders': inModal}" :disable="disable" @focus="onFocus" @blur="onBlur" @input="update" />
    </q-field>
  </div>
</template>

<script>
import { REQUIRED_LABEL } from '../../data/constants';

export default {
  name: 'NiSelect',
  props: {
    caption: String,
    error: Boolean,
    errorLabel: { type: String, default: REQUIRED_LABEL },
    options: Array,
    value: [String, Number, Object],
    requiredField: { type: Boolean, default: false },
    inModal: { type: Boolean, default: false },
    last: { type: Boolean, default: false },
    filter: { type: Boolean, default: true },
    filterPlaceholder: { type: String, default: 'Rechercher' },
    disable: { type: Boolean, default: false },
    clearable: { type: Boolean, default: false },
    multiple: { type: Boolean, default: false },
  },
  methods: {
    onFocus () {
      this.$emit('focus');
    },
    onBlur () {
      this.$emit('blur');
    },
    update (value) {
      this.$emit('input', value);
    },
  },
}
</script>

<style lang="stylus" scoped>
@import '~variables'
  .borders&.q-if-inverted
    border: 1px solid $light-grey;
  /deep/ .q-if .q-if-inner
    overflow: hidden;
</style>
