<template>
  <div>
    <div class="row justify-between">
      <p class="input-caption">{{ caption }}</p>
      <q-icon v-if="error" name="error_outline" color="secondary" />
    </div>
    <q-field :error="error" :error-label="errorLabel">
      <q-select :value="value" color="white" inverted-light :options="options" @focus="focusHandler" @blur="blurHandler" @input="update" />
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
}
</script>
