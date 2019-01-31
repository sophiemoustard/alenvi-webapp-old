<template>
  <div class="col-xs-12 col-md-6">
    <div class="row justify-between">
      <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
      <q-icon v-if="error" name="error_outline" color="secondary" />
    </div>
    <q-field :error="error" :error-label="errorLabel">
      <q-select :value="value" color="white" inverted-light :options="options" @focus="focusHandler" @blur="blurHandler" @input="update"
        filter filter-placeholder="Rechercher" />
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
    requiredField: { type: Boolean, default: false }
  },
  methods: {
    focusHandler () {
      this.$emit('focus');
    },
    blurHandler () {
      this.$emit('blur');
    },
    update (value) {
      this.$emit('input', value);
    },
  },
}
</script>
