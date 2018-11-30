<template>
  <div>
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
  },
  methods: {
    blurHandler (event) {
      this.$emit('myBlur');
    },
    focusHandler (event) {
      this.$emit('myFocus');
    },
    update (value) {
      this.$emit('input', value);
    },
  },
}
</script>
