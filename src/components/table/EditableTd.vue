<template>
  <div>
    <div class="cursor-pointer text-primary" v-show="!props[editionBoolean]" @click="startEdition">
      {{ value }}
    </div>
    <q-input v-show="props[editionBoolean]" class="datatable-inner-input" :ref="refName" :value="props[this.editedField]"
      @change="setEdition($event)" :suffix="suffix" type="number" @blur="disableEdition" inverted-light color="white"
      @keyup.esc="disableEdition" no-parent-field @keyup.enter="disableEdition" />
  </div>
</template>

<script>
export default {
  name: 'EditableTd',
  props: {
    props: { type: Object, default: () => ({}) },
    editedField: { type: String, default: '' },
    editionBoolean: { type: String, default: '' },
    refName: { type: String, default: '' },
    value: String,
    suffix: String,
  },
  methods: {
    disableEdition () {
      this.$emit('disable', { obj: this.props, path: this.editionBoolean })
    },
    setEdition (event) {
      this.$emit('change', { value: event, obj: this.props, path: this.editedField })
    },
    startEdition () {
      this.$emit('click', { ref: this.$refs[this.refName], obj: this.props, path: this.editionBoolean })
    },
  },
}
</script>

<style lang="stylus" scoped>

</style>
