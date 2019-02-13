<template>
  <div @click="datetimePopover = !datetimePopover">
    <q-input color="white" inverted-light :value="formattedDate" @input="update($event, 'DD/MM/YYYY')" placeholder="jj/mm/yyyy"
      @blur="blurHandler" align="center" :class="[ datetimePopover ? 'underline' : '']" />
    <q-popover v-model="datetimePopover">
      <q-datetime-picker :value="value" format="DD MMM YYYY" color="white" inverted-light @input="update" minimal />
    </q-popover>
  </div>
</template>

<script>
export default {
  name: 'NiDatetimeInput',
  props: {
    value: String,
  },
  data () {
    return {
      datetimePopover: false,
    };
  },
  computed: {
    formattedDate () {
      return this.$moment(this.value).format('DD/MM/YYYY');
    },
  },
  methods: {
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
        this.datetimePopover = false;
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
    border-radius: 0;

  /deep/.q-popover
    transform: translateY(2px);
    /deep/.q-datetime-day-active
      background-color: $primary !important;

  .underline
    border-bottom: 2px solid $primary;

</style>
