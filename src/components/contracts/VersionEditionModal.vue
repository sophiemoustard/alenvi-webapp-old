<template>
  <ni-modal :value="isOpened" @hide="resetVersionEditionModal">
    <template slot="title">
      Modifier le <span class="text-weight-bold">contrat</span>
    </template>
    <ni-input in-modal caption="Taux horaire"  type="number" suffix="€" required-field
      v-model="editedVersion.grossHourlyRate" :error="validations.grossHourlyRate.$error"
      @blur="validations.grossHourlyRate.$touch" />
    <ni-datetime-picker caption="Date d'effet" v-model="editedVersion.startDate" :min="minStartDate"
      in-modal required-field @blur="validations.startDate.$touch" :error="validations.startDate.$error" />
    <div class="margin-input last">
      <q-checkbox v-model="editedVersion.shouldBeSigned" label="Signature en ligne" />
    </div>
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" label="Modifier le contrat" icon-right="add" color="primary"
        :loading="loading" @click="editVersion" :disable="!isVersionUpdated" />
    </template>
  </ni-modal>
</template>

<script>
import Input from '../form/Input';
import DatetimePicker from '../form/DatetimePicker';
import Modal from '../Modal';

export default {
  name: 'VersionEditionModal',
  props: {
    isOpened: { type: Boolean, default: false },
    editedVersion: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    minStartDate: { type: String, default: '' },
    versionTemplate: { type: String, default: '' },
    isVersionUpdated: { type: Boolean, default: false },
    loading: {type: Boolean, default: false},
  },
  components: {
    'ni-input': Input,
    'ni-datetime-picker': DatetimePicker,
    'ni-modal': Modal,
  },
  methods: {
    editVersion () {
      this.$emit('editVersion');
    },
    resetVersionEditionModal () {
      this.$emit('hide');
    },
  },
}
</script>
