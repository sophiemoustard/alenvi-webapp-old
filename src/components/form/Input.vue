<template>
  <div v-if="displayInput" class="col-xs-12 col-md-6">
    <div class="row justify-between">
      <p class="input-caption">{{ caption }}</p>
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
      />
    </q-field>
  </div>
</template>

<script>
export default {
  props: {
    caption: String,
    error: Boolean,
    errorLabel: { type: String, default: 'Champ requis' },
    value: [String, Number],
    upperCase: { type: Boolean, default: false },
    lowerCase: { type: Boolean, default: false },
    disable: { type: Boolean, default: false },
    type: { type: String, default: 'text' },
    rows: { type: Number, default: 1 },
    displayInput: { type: Boolean, default: true },
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
  .bg-negative
    background: white !important
    color: inherit !important
</style>
