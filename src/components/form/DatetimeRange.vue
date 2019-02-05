<template>
  <div class='col-12 margin-input'>
    <div v-if="caption" class="row justify-between">
      <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
      <q-icon v-if="error" name="error_outline" color="secondary" />
    </div>
    <q-field :error="error" :error-label="errorLabel">
      <div class="datetime-container">
        <ni-datetime-input :value="value.startDate" @input="update($event, 'startDate')" class="datetime-item" idKey="start-datetime" @blur="blurHandler" />
        <ni-select-input :value="value.startHour" @input="update($event, 'startHour')" class="datetime-item" idKey="start-select" @blur="blurHandler"
          :options="hoursOptions" />
        <p class="delimiter">-</p>
        <ni-select-input :value="value.endHour" @input="update($event, 'endHour')" class="datetime-item" idKey="end-select" @blur="blurHandler"
          :options="hoursOptions" />
        <ni-datetime-input :value="value.endDate" @input="update($event, 'endDate')" :min="value.startDate" class="datetime-item" idKey="end-datetime"
          @blur="blurHandler"/>
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
    errorLabel: { type: String, default: 'Champ requis' },
    value: Object,
    requiredField: { type: Boolean, default: false }
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
  },
  methods: {
    blurHandler (event) {
      this.$emit('blur');
    },
    focusHandler (event) {
      this.$emit('focus');
    },
    update (value, key) {
      const date = {
        ...this.value,
        [key]: value,
      }
      this.$emit('input', date);
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
    justify-content: center;
    & .delimiter
      padding: 10px 14px;
      margin: 0;
      width: 4%;
    @media screen and (max-width: 677px)
      flex-direction: column
      .delimiter
        display: none;

  .datetime-item
    /deep/ .q-field-content
      padding-top: 0px
    @media screen and (min-width: 678px)
      width: 23%
    @media screen and (max-width: 677px)
      width: 100%

  /deep/ .q-if-inverted.q-if-focused
    box-shadow: none;

  /deep/ .q-select .q-icon
    display: none;
</style>
