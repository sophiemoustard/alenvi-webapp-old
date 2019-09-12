<template>
  <ni-input in-modal caption="Taux horaire"  type="number" suffix="€" required-field
    v-model="value.grossHourlyRate" :error="validations.grossHourlyRate.$error"
    @blur="validations.grossHourlyRate.$touch" />
</template>

<script>
import Input from '../form/Input';

export default {
  name: 'VersionEditionForm',
  props: {
    value: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-input': Input,
  },
  methods: {},
}
</script>
