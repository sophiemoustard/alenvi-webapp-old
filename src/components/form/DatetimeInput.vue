<template>
  <div>
    <q-input color="white" inverted-light :value="formattedDate" @input="update($event, 'DD/MM/YYYY')" placeholder="jj/mm/yyyy"
      :after="[{ icon: 'calendar_today', handler () { toggleDatetime(); } }]" @blur="blurHandler" align="center" />
    <q-datetime :id="idKey" :value="value" format="DD MMM YYYY" color="white" inverted-light @input="update" hide-underline />
  </div>
</template>

<script>
export default {
  name: 'NiDatetimeInput',
  props: {
    value: String,
    idKey: String,
  },
  computed: {
    formattedDate () {
      return this.$moment(this.value).format('DD/MM/YYYY');
    },
  },
  methods: {
    toggleDatetime () {
      document.getElementById(this.idKey).click();
    },
    blurHandler (event) {
      this.$emit('blur');
    },
    update (value, format) {
      let date;
      if (format) {
        if (this.$moment(value, 'DD/MM/YYYY', true).isValid()) {
          date = this.$moment(value, format).toISOString();
          this.$emit('input', date);
        }
      } else {
        date = value;
        this.$emit('input', date);
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
