<template>
  <div class="row q-mb-md">
    <div :class="['col-xs-12', { 'col-md-5': displayToggle }, { 'col-md-6': !displayToggle }]">
      <h4 class="no-margin">{{ title }}</h4>
    </div>
    <div :class="['col-xs-12', { 'col-md-5': displayToggle }, { 'col-md-6': !displayToggle }]">
      <q-search class="no-border input-search" :value="search" :placeholder="searchPlaceholder" color="white"
        inverted-light @input="input" :debounce=0 />
    </div>
    <div v-if="displayToggle" class="col-xs-12 col-md-2 row justify-end">
      <q-toggle :value="toggleValue" color="primary" :label="toggleLabel" @input="toggle" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'DirectoryHeader',
  props: {
    title: { type: String, default: '' },
    searchPlaceholder: { type: String, default: 'Rechercher un profil' },
    toggleLabel: { type: String, default: '' },
    toggleValue: { type: Boolean, default: false },
    displayToggle: { type: Boolean, default: false },
    search: { type: String, default: '' },
  },
  methods: {
    input (value) {
      this.$emit('updateSearch', value);
    },
    toggle (value) {
      this.$emit('toggle', value);
    },
  },
}
</script>
