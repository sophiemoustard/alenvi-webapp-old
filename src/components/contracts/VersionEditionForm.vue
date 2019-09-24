<template>
  <div>
    <ni-input in-modal caption="Taux horaire"  type="number" suffix="€" required-field
      v-model="value.grossHourlyRate" :error="validations.grossHourlyRate.$error"
      @blur="validations.grossHourlyRate.$touch" />
    <ni-datetime-picker caption="Date d'effet" v-model="value.startDate" :min="minStartDate"
      in-modal required-field @blur="validations.startDate.$touch" :error="validations.startDate.$error" />
    <div class="margin-input last">
      <q-checkbox v-model="value.shouldBeSigned" label="Signature en ligne" />
    </div>
  </div>
</template>

<script>
import Input from '../form/Input';
import DatetimePicker from '../form/DatetimePicker';

export default {
  name: 'VersionEditionForm',
  props: {
    value: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    minStartDate: { type: String, default: '' },
  },
  components: {
    'ni-input': Input,
    'ni-datetime-picker': DatetimePicker,
  },
  methods: {},
}
</script>
