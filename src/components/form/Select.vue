<template>
  <div>
    <div class="row justify-between">
      <p class="input-caption">{{ caption }}</p>
      <q-icon v-if="error" name="error_outline" color="secondary" />
    </div>
    <q-field :error="error" :error-label="errorLabel">
      <q-select :value="value" color="white" inverted-light :options="options" @focus="focusHandler"
        @blur="blurHandler" @input="update" :class="inputBorderClass"
      />
    </q-field>
  </div>
</template>

<script>
export default {
  props: {
    caption: String,
    error: Boolean,
    errorLabel: {
      type: String,
      default: 'Champ requis',
    },
    options: Array,
    value: [String, Number],
    withBorders: { type: Boolean, default: false },
  },
  methods: {
    focusHandler () {
      this.$emit('myFocus');
    },
    blurHandler () {
      this.$emit('myBlur');
    },
    update (value) {
      this.$emit('input', value);
    },
  },
  computed: {
    inputBorderClass () {
      return this.withBorders ? 'input-border' : '';
    },
  },
}
</script>

<style lang="stylus" scoped>
@import '~variables'

  .input-border
    border: 1px solid $light-grey

  .bg-negative
    background: none !important
    color: inherit !important
</style>
