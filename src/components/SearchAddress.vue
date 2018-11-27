<template>
  <q-search :value="value" inverted-light color="white" placeholder=" " no-icon
    @input="inputEvent"
    @blur="blurEvent">
    <q-autocomplete @search="searchAddress" @selected="selectedAddress" />
  </q-search>
</template>

<script>
export default {
  name: 'SearchAddress',
  props: ['value'],
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
    }
  }
}
</script>
