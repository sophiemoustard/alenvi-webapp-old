<template>
  <div @click="selectPopover = !selectPopover">
    <q-input color="white" inverted-light :value="value" @change="blurHandler" align="center" @input="update" :class="[ selectPopover ? 'underline' : '']"
      :disable="disable" />
    <q-popover v-model="selectPopover" :disable="disable">
      <q-list>
        <q-item link v-for="option in options" :key="option.value">
          <div :class="[option.disable && 'disable']" @click="!option.disable && update(option.value)">{{ option. label }}</div>
        </q-item>
      </q-list>
    </q-popover>
  </div>
</template>

<script>
export default {
  name: 'NiSelectInput',
  props: {
    value: String,
    options: { type: Array, default: () => [] },
    disable: { type: Boolean, default: false },
  },
  data () {
    return {
      selectPopover: false,
    };
  },
  methods: {
    blurHandler (hour) {
      this.$emit('blur', { hour });
    },
    update (hour) {
      this.$emit('input', hour);
      this.selectPopover = false;
    },
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .q-input.q-if-inverted
    width: 100%;
    margin: 0;
    border-radius: 0;

  /deep/.q-popover
    transform: translateY(2px);
    width: 120px;
    /deep/.q-datetime-day-active
      background-color: $primary !important;

  .underline
    border-bottom: 2px solid $primary;

  .q-item
    padding: 0;
    div
      width: 100%
      padding: 8px 16px;

  .disable
    color: $light-grey;
    cursor: default;

</style>
