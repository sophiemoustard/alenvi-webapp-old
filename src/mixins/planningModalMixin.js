import SelectSector from '../components/form/SelectSector';
import DatetimePicker from '../components/form/DatetimePicker.vue';
import DatetimeRange from '../components/form/DatetimeRange.vue';
import ModalSelect from '../components/form/ModalSelect';
import ModalInput from '../components/form/ModalInput';
import SearchAddress from '../components/form/SearchAddress';
import FileUploader from '../components/form/FileUploader';
import {
  INTERVENTION,
  ABSENCE,
  UNAVAILABILITY,
  INTERNAL_HOUR,
  NEVER,
  EVERY_DAY,
  EVERY_WEEK_DAY,
  EVERY_WEEK,
  INVOICED_AND_PAYED,
  INVOICED_AND_NOT_PAYED,
  NOT_INVOICED_AND_NOT_PAYED,
  CUSTOMER_INITIATIVE,
  AUXILIARY_INITIATIVE,
  DATE_OPTIONS,
  ABSENCE_TYPE,
  ILLNESS,
} from '../data/constants';

export const planningModalMixin = {
  components: {
    'ni-select-sector': SelectSector,
    'ni-datetime-picker': DatetimePicker,
    'ni-search-address': SearchAddress,
    'ni-modal-select': ModalSelect,
    'ni-modal-input': ModalInput,
    'ni-file-uploader': FileUploader,
    'ni-datetime-range': DatetimeRange,
  },
  data () {
    return {
      INTERVENTION,
      ABSENCE,
      UNAVAILABILITY,
      INTERNAL_HOUR,
      NEVER,
      ILLNESS,
      absenceOptions: ABSENCE_TYPE,
      dateOptions: DATE_OPTIONS,
      cancellationConditions: [
        { label: 'Facturée & payée', value: INVOICED_AND_PAYED },
        { label: 'Facturée & non payée', value: INVOICED_AND_NOT_PAYED },
        { label: 'Non facturée & non payée', value: NOT_INVOICED_AND_NOT_PAYED },
      ],
      cancellationReasons: [
        { label: 'Initiative du client', value: CUSTOMER_INITIATIVE },
        { label: 'Initiative du de l\'intervenant', value: AUXILIARY_INITIATIVE },
      ],
      eventTypeOptions: [
        {label: 'Intervention', value: INTERVENTION},
        {label: 'Interne', value: INTERNAL_HOUR},
        {label: 'Absence', value: ABSENCE},
        {label: 'Indispo', value: UNAVAILABILITY}
      ],
    };
  },
  computed: {
    disableCreationButton () {
      if (!this.newEvent.type) return true;
      switch (this.newEvent.type) {
        case ABSENCE:
          return !this.newEvent.auxiliary || !this.newEvent.absence || !this.newEvent.dates.startDate ||
            !this.newEvent.dates.endDate || !this.newEvent.startDuration;
        case INTERVENTION:
          return !this.newEvent.auxiliary || !this.newEvent.customer || !this.newEvent.subscription || !this.newEvent.dates.startDate ||
            !this.newEvent.dates.endDate || !this.newEvent.dates.startHour || !this.newEvent.dates.endHour;
        case INTERNAL_HOUR:
          return !this.newEvent.auxiliary || !this.newEvent.dates.startDate || !this.newEvent.dates.endDate ||
            !this.newEvent.internalHour || !this.newEvent.dates.startHour || !this.newEvent.dates.endHour;
        case UNAVAILABILITY:
        default:
          return !this.newEvent.auxiliary || !this.newEvent.dates.startDate || !this.newEvent.dates.endDate ||
            !this.newEvent.dates.startHour || !this.newEvent.dates.endHour;
      }
    },
    disableEditionButton () {
      switch (this.editedEvent.type) {
        case ABSENCE:
          return !this.editedEvent.auxiliary || !this.editedEvent.absence || !this.editedEvent.dates.startDate ||
            !this.editedEvent.dates.endDate || !this.editedEvent.startDuration;
        case INTERVENTION:
          const shouldDisableButton = !this.editedEvent.auxiliary || !this.editedEvent.subscription || !this.editedEvent.dates.startDate ||
            !this.editedEvent.dates.endDate || !this.editedEvent.dates.startHour || !this.editedEvent.dates.endHour;
          if (this.editedEvent.isCancelled) return shouldDisableButton || !this.editedEvent.cancel.condition || !this.editedEvent.cancel.reason;
          else return shouldDisableButton;
        case INTERNAL_HOUR:
          return !this.editedEvent.auxiliary || !this.editedEvent.dates.startDate || !this.editedEvent.dates.endDate ||
            !this.editedEvent.internalHour || !this.editedEvent.dates.startHour || !this.editedEvent.dates.endHour;
        case UNAVAILABILITY:
        default:
          return !this.editedEvent.auxiliary || !this.editedEvent.dates.startDate || !this.editedEvent.dates.endDate ||
            !this.editedEvent.dates.startHour || !this.editedEvent.dates.endHour;
      }
    },
    auxiliariesOptions () {
      return this.auxiliaries.length === 0 ? [] : this.auxiliaries.map(aux => ({
        label: `${aux.identity.firstname || ''} ${aux.identity.lastname}`,
        value: aux._id,
      }));
    },
    customersOptions () {
      return this.customers.length === 0 ? [] : this.customers.map(customer => ({
        label: `${customer.identity.firstname || ''} ${customer.identity.lastname}`,
        value: customer._id,
      }));
    },
    internalHourOptions () {
      return this.internalHours.map(hour => ({
        label: hour.name,
        value: hour._id,
      }));
    },
    oneDayRepetitionLabel () {
      if (this.creationModal) return `Tous les ${this.$moment(this.newEvent.dates.startDate).day()}`;
      if (this.editionModal) return `Tous les ${this.$moment(this.editedEvent.dates.startDate).day()}`;
      return 'Tous les lundis';
    },
    repetitionOptions () {
      const oneDayRepetitionLabel = this.creationModal
        ? `Tous les ${this.$moment(this.newEvent.dates.startDate).format('dddd')}s`
        : 'Tous les lundis';

      return [
        { label: 'Jamais', value: NEVER },
        { label: 'Tous les jours', value: EVERY_DAY },
        { label: 'Tous les jours de la semaine (lundi au vendredi)', value: EVERY_WEEK_DAY },
        { label: oneDayRepetitionLabel, value: EVERY_WEEK },
      ];
    },
    addressError () {
      if (!this.validations.location.fullAddress.required) return 'Champ requis';

      return 'Adresse non valide';
    },
  },
  methods: {
    // Event creation
    customerSubscriptionsOptions (customerId) {
      if (!customerId) return [];
      const selectedCustomer = this.customers.find(customer => customer._id === customerId);

      return !selectedCustomer || !selectedCustomer.subscriptions || selectedCustomer.subscriptions.length === 0
        ? []
        : selectedCustomer.subscriptions.map(sub => ({
          label: sub.service.name,
          value: sub._id,
        }));
    },
    // Event edition
    toggleCancellationForm (value) {
      if (!value) this.editedEvent.cancel = {};
    },
    toggleRepetition () {
      this.editedEvent.cancel = {};
      this.editedEvent.isCancelled = false;
    },
    isRepetition (event) {
      return ABSENCE !== event.type && event.repetition && event.repetition.frequency !== NEVER;
    },
  },
};