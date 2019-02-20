<template>
  <div :class="{ 'col-12 col-md-6': !inModal, 'col-12': inModal }">
    <div class="row justify-between">
      <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
    </div>
    <q-field :error="error" :error-label="errorLabel">
      <q-search :value="value" inverted-light color="white" placeholder=" " no-icon @input="inputEvent"
        @blur="blurEvent" @focus="focusEvent" :class="{'borders': inModal}">
        <q-autocomplete @search="searchAddress" @selected="selectedAddress" />
      </q-search>
    </q-field>
  </div>
</template>

<script>
export default {
  name: 'SearchAddress',
  props: {
    value: String,
    caption: { type: String, default: 'Adresse' },
    errorLabel: { type: String, default: 'Champ requis' },
    error: { type: Boolean, default: false },
    inModal: { type: Boolean, default: false },
    requiredField: { type: Boolean, default: false }
  },
  methods: {
    async searchAddress (terms, done) {
      try {
        const res = await this.$axios.get('https://api-adresse.data.gouv.fr/search', {
          params: {
            q: terms
          }
        });
        const resultsList = res.data.features.sort((a, b) => b.properties.score - a.properties.score).map(result => {
          return {
            label: result.properties.label,
            value: result.properties.label,
            street: result.properties.name,
            zipCode: result.properties.postcode,
            city: result.properties.city,
            location: result.geometry
          }
        });
        done(resultsList);
      } catch (e) {
        console.error(e);
        done([]);
      }
    },
    selectedAddress (item) {
      const { label, value, ...payload } = item;
      this.$emit('selected', payload);
    },
    inputEvent (value) {
      this.$emit('input', value);
    },
    blurEvent () {
      this.$emit('blur');
    },
    focusEvent () {
      this.$emit('focus');
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~variables'

  .borders
    border: 1px solid $light-grey !important
</style>
