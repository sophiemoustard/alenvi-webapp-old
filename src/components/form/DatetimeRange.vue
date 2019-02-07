<template>
  <div class='col-12 margin-input'>
    <div v-if="caption" class="row justify-between">
      <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
      <q-icon v-if="hasError" name="error_outline" color="secondary" />
    </div>
    <q-field :error="hasError" :error-label="errorMessage">
      <div class="datetime-container">
        <div class="datetime-item">
          <ni-datetime-input :value="value.startDate" @input="update($event, 'startDate')" class="date-item" name="start-datetime"
            @blur="blurDateHandler" />
          <ni-select-input :value="value.startHour" @input="update($event, 'startHour')" class="time-item" align="center" autofocus-filter
            @blur="blurHourHandler" :options="hoursOptions" filter :filter-placeholder="value.startHour" hide-underline name="start-hour" />
        </div>
        <p class="delimiter">-</p>
        <div class="datetime-item end">
          <ni-select-input :value="value.endHour" @input="update($event, 'endHour')" class="time-item" align="center" autofocus-filter
            @blur="blurHourHandler" :options="endHourOptions" filter :filter-placeholder="value.endHour" hide-underline name="end-hour" />
          <ni-datetime-input :value="value.endDate" @input="update($event, 'endDate')" class="date-item"
            name="end-datetime" @blur="blurDateHandler" />
        </div>
      </div>
    </q-field>
  </div>
</template>

<script>
import DatetimeInput from './DatetimeInput.vue';
import SelectInput from './SelectInput.vue';

export default {
  components: {
    'ni-datetime-input': DatetimeInput,
    'ni-select-input': SelectInput,
  },
  props: {
    caption: { type: String, default: '' },
    error: Boolean,
    value: Object,
    requiredField: { type: Boolean, default: false },
  },
  data () {
    return {
      errorMessage: 'Date(s) et heure(s) invalide(s)',
      childError: false,
    };
  },
  computed: {
    hoursOptions () {
      const range = this.$moment.range(this.$moment().hours(8).minutes(0), this.$moment().hours(20).minutes(0));
      const hours = Array.from(range.by('hours'));
      const selectOptions = [];
      hours.map((hour) => {
        selectOptions.push({ label: hour.format('HH:mm'), value: hour.format('HH:mm') });
        if (hour.format('HH') !== '20') selectOptions.push({ label: hour.minutes(30).format('HH:mm'), value: hour.minutes(30).format('HH:mm') });
      });
      return selectOptions;
    },
    hasError () {
      return this.error || this.childError;
    },
    endHourOptions () {
      return this.hoursOptions.map(option => ({ ...option, disable: this.$moment(option.value, 'HH:mm').isSameOrBefore(this.$moment(this.value.startHour, 'HH:mm')) }));
    },
  },
  methods: {
    blurDateHandler (event) {
      if (event && event.date === '') this.childError = true;
      else if (event && event.date && !(this.$moment(event.date, 'DD/MM/YYYY', true).isValid())) this.childError = true;
      else this.childError = false;
    },
    blurHourHandler (event) {
      if (event && event.hour === '') this.childError = true;
      else if (event && event.hour && !event.hour.match(/[0-2][0-9]:(00|30)/)) this.childError = true;
      else this.childError = false;
    },
    focusHandler (event) {
      this.$emit('focus');
    },
    update (value, key) {
      const dates = { ...this.value, [key]: value }
      this.$emit('blur');
      if (key === 'startDate') dates.endDate = value;
      if (key === 'startHour' && this.$moment(value, 'HH:mm').isSameOrAfter(this.$moment(this.value.endHour, 'HH:mm'))) {
        dates.endHour = this.$moment(value, 'HH:mm').add(2, 'H').format('HH:mm');
      }
      this.$emit('input', dates);
    },
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  /deep/ .datetime-container
    border: 1px solid $light-grey;
    border-radius: 3px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    @media screen and (min-width: 678px)
      & .delimiter
        padding: 10px 14px;
        margin: 0;
        width: 4%;
    @media screen and (max-width: 677px)
      flex-direction: column;
      & .delimiter
        display: none

  /deep/ .q-select
    padding-top: 0px !important;
    .q-if-inner
      padding: 10px;

  .time-item
    /deep/ .q-input.q-if-inverted
      padding: 10px;
      max-width: 120px

  .date-item
    /deep/ .q-input.q-if-inverted
      padding: 10px;
      max-width: 120px
    /deep/ .q-field-content
      padding-top: 0px

  .datetime-item
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    &.end
      @media screen and (max-width: 677px)
        flex-direction: row-reverse;

  /deep/ .q-if-inverted.q-if-focused
    box-shadow: none;

  /deep/ .q-select .q-icon
    display: none;
</style>
