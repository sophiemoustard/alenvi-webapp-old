<template>
  <div @click="datetimePopover = !datetimePopover">
    <q-input color="white" inverted-light :value="formattedDate" @input="updateInput" placeholder="jj/mm/yyyy"
      @blur="blurHandler" align="center" :class="[ datetimePopover ? 'underline' : '']" :disable="disable" />
    <q-popover v-model="datetimePopover" :disable="disable">
      <q-datetime-picker :value="model" color="white" inverted-light @input="update" minimal :min="min" />
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
      model: null,
    };
  },
  computed: {
    formattedDate () {
      return this.$moment(this.model).format('DD/MM/YYYY');
    },
  },
  mounted () {
    this.setModel(this.value);
  },
  methods: {
    blurHandler (event) {
      if (!this.datetimePopover) this.$emit('blur');
    },
    updateInput (value) {
      const momentValue = this.$moment(value, 'D/M/YYYY', true)
      if (!momentValue.isValid()) {
        this.$emit('error', true);
        return;
      }
      this.update(momentValue.toISOString());
    },
    update (value) {
      this.datetimePopover = false;
      this.$emit('error', false);
      this.$emit('input', value);
    },
    setModel (value) {
      if (!this.$moment(value).isValid()) return;
      this.model = value;
    }
  },
  watch: {
    value (value) {
      this.setModel(value);
    }
  }
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
