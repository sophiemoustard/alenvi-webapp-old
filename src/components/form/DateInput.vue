<template>
  <div @click="datetimePopover = !datetimePopover">
    <q-input color="white" inverted-light :value="formattedDate" @input="update($event, 'DD/MM/YYYY')" placeholder="jj/mm/yyyy"
      @change="blurHandler" align="center" :class="[ datetimePopover ? 'underline' : '']" :disable="disable" />
    <q-popover v-model="datetimePopover" :disable="disable">
      <q-datetime-picker :value="value" format="DD MMM YYYY" color="white" inverted-light @input="update" minimal :min="min" />
    </q-popover>
  </div>
</template>

<script>
export default {
  name: 'NiDateInput',
  props: {
    value: String,
    min: { type: String, default: '' },
    disable: { type: Boolean, default: false },
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
      this.datetimePopover = false;
      this.$emit('blur');
      this.$emit('input', value);
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

  /deep/ .q-datetime-days div.q-datetime-day-active > span
    color: $black !important;

</style>
