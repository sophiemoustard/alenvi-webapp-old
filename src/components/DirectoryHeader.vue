<template>
  <div class="row q-mb-md">
    <div :class="['col-xs-12', { 'col-md-5': displayToggle }, { 'col-md-6': !displayToggle }]">
      <h4 class="no-margin">{{ title }}</h4>
    </div>
    <div :class="['col-xs-12', { 'col-md-5': displayToggle }, { 'col-md-6': !displayToggle }]">
      <q-search class="no-border input-search" v-model="search" :placeholder="searchPlaceholder" color="white"
        inverted-light />
    </div>
    <div v-if="displayToggle" class="col-xs-12 col-md-2 row justify-end">
      <q-toggle v-model="toggle" color="primary" :label="toggleLabel" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'DirectoryHeader',
  props: {
    title: { type: String, default: '' },
    search: { type: String, default: '' },
    searchPlaceholder: { type: String, default: 'Rechercher un profil' },
    toggleLabel: { type: String, default: '' },
    toggle: { type: Boolean, default: false },
    displayToggle: { type: Boolean, default: false },
  },
}
</script>
