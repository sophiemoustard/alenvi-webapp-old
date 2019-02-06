<template>
  <div>
    <q-input color="white" inverted-light :value="formattedDate" @input="update($event, 'DD/MM/YYYY')" placeholder="jj/mm/yyyy"
      :after="[{ icon: 'calendar_today', handler () { toggleDatetime(); } }]" @blur="blurHandler" align="center" />
    <q-datetime :ref="name" :value="value" format="DD MMM YYYY" color="white" inverted-light @input="update"
      hide-underline />
  </div>
</template>

<script>
export default {
  name: 'NiDatetimeInput',
  props: {
    value: String,
    name: String,
  },
  computed: {
    formattedDate () {
      return this.$moment(this.value).format('DD/MM/YYYY');
    },
  },
  methods: {
    toggleDatetime () {
      this.$refs[this.name].show();
    },
    blurHandler (event) {
      this.$emit('blur');
    },
    update (value, format) {
      // update from input component
      if (format) {
        if (this.$moment(value, 'DD/MM/YYYY', true).isValid()) {
          const date = this.$moment(value, format).toISOString();
          this.$emit('blur');
          this.$emit('input', date);
        } else {
          this.$emit('blur', { date: value });
        }
      // update from datetime component
      } else {
        this.$emit('blur');
        this.$emit('input', value);
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .q-input.q-if-inverted
    width: 100%;
    margin: 0;

  /deep/ .q-datetime-input
    &.q-if-inverted
      padding: 0;
    .q-if-inner
      display: none
    .q-icon
      display: none
</style>
