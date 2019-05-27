<template>
  <div class='col-12 margin-input'>
    <div v-if="caption" class="row justify-between">
      <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
      <q-icon v-if="hasError" name="error_outline" color="secondary" />
    </div>
    <q-field :error="hasError" :error-label="errorMessage">
      <div class="date-container">
        <div class="date-item">
          <ni-date-input :value="value.startDate" @input="update($event, 'startDate')" class="date-item" @blur="blurDateHandler" />
        </div>
        <p class="delimiter">-</p>
        <div class="date-item">
          <ni-date-input :value="value.endDate" @input="update($event, 'endDate')" class="date-item" @blur="blurDateHandler"
            :min="value.startDate" />
        </div>
      </div>
    </q-field>
  </div>
</template>

<script>
import DateInput from './DateInput.vue';

export default {
  components: {
    'ni-date-input': DateInput,
  },
  props: {
    caption: { type: String, default: '' },
    error: Boolean,
    value: { type: Object, default: function () { return { startDate: this.$moment().toISOString(), endDate: this.$moment().toISOString() } } },
    requiredField: { type: Boolean, default: false },
  },
  data () {
    return {
      errorMessage: 'Date(s) invalide(s)',
      childError: false,
    };
  },
  computed: {
    hasError () {
      return this.error || this.childError;
    },
  },
  methods: {
    blurDateHandler (event) {
      if (event && event.date === '') this.childError = true;
      else if (event && event.date && !(this.$moment(event.date, 'DD/MM/YYYY', true).isValid())) this.childError = true;
      else if (event && event.date && event.min && this.$moment(event.date).isBefore(this.$moment(event.min))) this.childError = true;
      else this.childError = false;
    },
    blurHourHandler (event) {
      if (event && event.hour === '') this.childError = true;
      else if (event && event.hour && !event.hour.match(/[0-2][0-9]:([0-5]|[0-9])/)) this.childError = true;
      else this.childError = false;
    },
    update (value, key) {
      const dates = { ...this.value, [key]: value }
      this.$emit('blur');
      this.$emit('input', dates);
    },
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  /deep/ .q-field-content
    padding: 0;

  /deep/ .date-container
    border: 1px solid $light-grey;
    border-radius: 3px;
    display: flex;
    flex-direction: row;
    background-color: $white;
    & .delimiter
      padding: 10px 0;
      margin: 0;
      width: 4%;

  .date-item
    /deep/ .q-input.q-if-inverted
      max-width: 120px

  /deep/ .q-if-inverted.q-if-focused
    box-shadow: none;

</style>
