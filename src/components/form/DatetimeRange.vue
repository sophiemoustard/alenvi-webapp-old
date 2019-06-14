<template>
  <div class='col-12 margin-input'>
    <div v-if="caption" class="row justify-between">
      <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
      <q-icon v-if="hasError" name="error_outline" color="secondary" />
    </div>
    <q-field :error="hasError" :error-label="errorMessage">
      <div class="datetime-container">
        <div class="datetime-item">
          <ni-date-input :value="value.startDate" @input="update($event, 'startDate')" class="date-item"
            @blur="blurHandler" :disable="disable" />
          <ni-select-input :value="value.startHour" @input="update($event, 'startHour')" class="time-item"
            @blur="blurHandler" :options="hoursOptions" filter :filter-placeholder="value.startHour" hide-underline
            name="start-hour" :disable="disable" align="center" />
        </div>
        <p class="delimiter">-</p>
        <div class="datetime-item end">
          <ni-select-input :value="value.endHour" @input="update($event, 'endHour')" class="time-item" align="center"
            @blur="blurHandler" :options="endHourOptions" :disable="disable" />
          <ni-date-input :value="value.endDate" @input="update($event, 'endDate')" class="date-item"
            @blur="blurHandler" :min="value.startDate" :disable="disable || disableEndDate" />
        </div>
      </div>
    </q-field>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import DateInput from './DateInput.vue';
import SelectInput from './SelectInput.vue';
import { PLANNING_VIEW_START_HOUR, PLANNING_VIEW_END_HOUR } from '../../data/constants.js';
import { minDate, validHour } from '../../helpers/vuelidateCustomVal.js';

export default {
  components: {
    'ni-date-input': DateInput,
    'ni-select-input': SelectInput,
  },
  props: {
    caption: { type: String, default: '' },
    error: { type: Boolean, default: false },
    value: { type: Object, default: () => ({}) },
    requiredField: { type: Boolean, default: false },
    disable: { type: Boolean, default: false },
    disableEndDate: { type: Boolean, default: false },
  },
  data () {
    return {
      errorMessage: 'Date(s) et heure(s) invalide(s)',
      childError: false,
    };
  },
  validations () {
    return {
      value: {
        startDate: { required },
        startHour: { required, validHour },
        endDate: { required, minDate },
        endHour: { required, validHour },
      },
    }
  },
  computed: {
    hoursOptions () {
      const range = this.$moment.range(this.$moment().hours(PLANNING_VIEW_START_HOUR).minutes(0), this.$moment().hours(PLANNING_VIEW_END_HOUR).minutes(0));
      const hours = Array.from(range.by('hours'));
      const selectOptions = [];
      hours.map((hour) => {
        selectOptions.push({ label: hour.format('HH:mm'), value: hour.format('HH:mm') });
        if (hour.format('HH') !== `${PLANNING_VIEW_END_HOUR}`) selectOptions.push({ label: hour.minutes(30).format('HH:mm'), value: hour.minutes(30).format('HH:mm') });
      });
      return selectOptions;
    },
    hasError () {
      if (this.error || this.$v.value.startDate.$error || this.$v.value.startHour.$error || this.$v.value.endDate.$error || this.$v.value.endHour.$error) {
        return true;
      }

      const startDatetime = this.$moment(`${this.value.startDate.slice(0, 10)}T${this.value.startHour}`);
      const endDatetime = this.$moment(`${this.value.endDate.slice(0, 10)}T${this.value.endHour}`);
      return startDatetime.isAfter(endDatetime);
    },
    endHourOptions () {
      return this.hoursOptions.map(option => {
        return { ...option, disable: this.$moment(option.value, 'HH:mm').isSameOrBefore(this.$moment(this.value.startHour, 'HH:mm')) }
      });
    },
  },
  methods: {
    blurHandler () {
      this.$v.value.$touch();
      this.$emit('blur');
    },
    update (value, key) {
      this.blurHandler();
      const dates = { ...this.value, [key]: value }
      if (key === 'startDate') dates.endDate = value;
      if (key === 'startHour' && this.$moment(value, 'HH:mm').isSameOrAfter(this.$moment(this.value.endHour, 'HH:mm'))) {
        const startHour = this.$moment(value, 'HH:mm');
        const max = this.$moment(startHour).endOf('d');
        dates.endHour = this.$moment.min(startHour.add(2, 'H'), max).format('HH:mm');
      }

      this.$emit('input', dates);
    },
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  /deep/ .q-field-content
    padding: 0;

  /deep/ .datetime-container
    border: 1px solid $light-grey;
    border-radius: 3px;
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    background-color: $white;
    @media screen and (min-width: 768px)
      & .delimiter
        padding: 10px 14px;
        margin: 0;
        width: 4%;
    @media screen and (max-width: 767px)
      flex-direction: column;
      & .delimiter
        display: none;

  .time-item
    /deep/ .q-input.q-if-inverted
      padding: 10px;
      max-width: 100px
      /deep/ .q-if-inner
        div
          width: 100%

  .date-item
    /deep/ .q-input.q-if-inverted
      padding: 10px;
      max-width: 120px
      /deep/ .q-if-inner
        div
          width: 100%
    /deep/ .q-field-content
      padding-top: 0px;

  .datetime-item
    display: flex;
    flex-direction: row;
    justify-content: center;
    &.end
      @media screen and (max-width: 767px)
        border-top: 1px solid $light-grey;
        flex-direction: row-reverse;

  /deep/ .q-if-inverted.q-if-focused
    box-shadow: none;

</style>
