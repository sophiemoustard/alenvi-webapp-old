<template>
  <div class="row margin-input">
    <div class="col-12">
      <div class="row justify-between">
        <p class="input-caption">{{ caption }}</p>
        <q-icon v-if="error" name="error_outline" color="secondary" />
      </div>
      <q-field :error="error" :error-label="errorLabel">
        <q-datetime :value="value" type="date" format="DD/MM/YYYY" color="white" ok-label="OK" cancel-label="Fermer"
          inverted-light popover @focus="focusHandler" @blur="blurHandler" @input="update" :min="min"
        />
      </q-field>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    caption: String,
    error: Boolean,
    errorLabel: { type: String, default: 'Champ requis' },
    value: String,
    min: { type: String, default: null },
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

  .q-if-inverted
    border: 1px solid $light-grey

  .bg-negative
    background: none !important
    color: inherit !important

  .margin-input
    margin-bottom: 6px
    &.last
      margin-bottom: 24px

</style>
