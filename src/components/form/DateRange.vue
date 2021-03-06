<template>
  <div class='col-12'>
    <div v-if="caption" class="row justify-between">
      <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
      <q-icon v-if="hasError" name="error_outline" color="secondary" />
    </div>
    <q-field :error="hasError" :error-label="errorMessage">
      <div class="date-container" :class="{ borderless: borderless }">
        <div class="date-item">
          <ni-date-input :value="value.startDate" @input="update($event, 'startDate')" class="date-item"
            @blur="blurDateHandler" @error="setFieldError('startDate', $event)" />
        </div>
        <p class="delimiter">-</p>
        <div class="date-item">
          <ni-date-input :value="value.endDate" @input="update($event, 'endDate')" class="date-item"
            @blur="blurDateHandler" :min="value.startDate" @error="setFieldError('endDate', $event)" />
        </div>
      </div>
    </q-field>
  </div>
</template>

<script>
import DateInput from './DateInput.vue';
import moment from 'moment';

export default {
  components: {
    'ni-date-input': DateInput,
  },
  props: {
    caption: { type: String, default: '' },
    error: Boolean,
    value: { type: Object, default: function () { return { startDate: this.$moment().startOf('d').toISOString(), endDate: this.$moment().endOf('d').toISOString() } } },
    requiredField: { type: Boolean, default: false },
    borderless: { type: Boolean, default: false },
  },
  data () {
    return {
      errorMessage: 'Date(s) invalide(s)',
      orderError: false,
      childErrors: {
        startDate: false,
        endDate: false,
      },
      blur: false,
    };
  },
  computed: {
    childrenHaveError () {
      return Object.values(this.childErrors).indexOf(true) !== -1;
    },
    hasError () {
      return this.blur && (this.error || this.orderError || this.childrenHaveError);
    },
  },
  methods: {
    blurDateHandler (event) {
      this.blur = true;
      this.$emit('blur');
    },
    update (value, key) {
      const dates = { ...this.value, [key]: value }
      this.blur = false;

      if (!this.childrenHaveError) {
        const start = moment(dates.startDate);
        let end = moment(dates.endDate);

        if (key === 'startDate' && start.isAfter(end)) {
          end = moment(start).endOf('d');
          dates.endDate = end.toISOString();
        }

        this.orderError = start.isAfter(end);
      }

      this.$emit('update:error', this.orderError || this.childrenHaveError);
      this.$emit('input', dates);
    },
    setFieldError (field, error) {
      this.childErrors[field] = error;
      this.$emit('update:error', this.orderError || this.childrenHaveError);
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
    justify-content: space-evenly;
    background-color: $white;
    & .delimiter
      padding: 10px 0;
      margin: 0;
      width: 4%;
  & .borderless
    border: none;

  .date-item
    /deep/ .q-input.q-if-inverted
      max-width: 120px

  /deep/ .q-if-inverted.q-if-focused
    box-shadow: none;

</style>
