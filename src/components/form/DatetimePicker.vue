<template>
  <div class="col-xs-12 col-md-6">
    <div class="row justify-between">
      <p class="input-caption">{{ caption }}</p>
      <q-icon v-if="error" name="error_outline" color="secondary" />
    </div>
    <q-field :error="error" :error-label="errorLabel">
      <q-datetime :value="value" type="date" format="DD/MM/YYYY" color="white" ok-label="OK" cancel-label="Fermer"
        inverted-light popover @focus="focusHandler" @blur="blurHandler" @input="update"
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
    value: String,
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
