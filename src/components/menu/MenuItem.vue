<template>
  <q-item v-if="displayItem" :to="{ name, params, query }" exact>
    <q-item-side :icon="icon" />
    <q-item-main :label="label" />
  </q-item>
</template>

<script>
export default {
  props: {
    params: Object,
    query: Object,
    name: String,
    label: String,
    icon: String,
    displayItem: { type: Boolean, default: true },
  },
}
</script>
