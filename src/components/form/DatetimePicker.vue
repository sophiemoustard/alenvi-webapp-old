<template>
  <div :class="[inModal ? 'col-12' : 'col-xs-12 col-md-6']">
    <div v-if="caption" class="row justify-between">
      <p class="input-caption">{{ caption }}</p>
      <q-icon v-if="error" name="error_outline" color="secondary" />
    </div>
    <q-field :error="error" :error-label="errorLabel">
      <q-datetime :value="value" :type="type" :format="format" color="white" ok-label="OK" cancel-label="Fermer" :class="{border: inModal}"
        inverted-light popover @focus="focusHandler" @blur="blurHandler" @input="update" :min="min" :max="max" :disable="disable"
      />
    </q-field>
  </div>
</template>

<script>
export default {
  props: {
    caption: { type: String, default: '' },
    error: Boolean,
    errorLabel: { type: String, default: 'Champ requis' },
    value: [String, Date],
    type: { type: String, default: 'date' },
    min: { type: String, default: null },
    max: { type: String, default: null },
    disable: { type: Boolean, default: false },
    inModal: { type: Boolean, default: false },
  },
  computed: {
    format () {
      return this.type === 'datetime' ? 'DD/MM/YYYY HH:mm' : 'DD/MM/YYYY';
    },
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

  .bg-negative
    background: none !important
    color: inherit !important

  .margin-input
    margin-bottom: 6px
    &.last
      margin-bottom: 24px

  .border
    border: 1px solid $light-grey;
</style>
