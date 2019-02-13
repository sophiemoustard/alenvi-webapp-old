import Planning from '../components/Planning.vue';
import SelectSector from '../components/form/SelectSector';
import DatetimePicker from '../components/form/DatetimePicker.vue';
import DatetimeRange from '../components/form/DatetimeRange.vue';
import ModalSelect from '../components/form/ModalSelect';
import ModalInput from '../components/form/ModalInput';
import SearchAddress from '../components/form/SearchAddress';
import FileUploader from '../components/form/FileUploader';
import { required, requiredIf } from 'vuelidate/lib/validators';
import { frAddress } from '../helpers/vuelidateCustomVal.js';
import {
  INTERVENTION,
  ABSENCE,
  UNAVAILABILITY,
  INTERNAL_HOUR,
  ILLNESS,
  NEVER,
  EVERY_DAY,
  EVERY_WEEK_DAY,
  EVERY_WEEK,
  INVOICED_AND_PAYED,
  INVOICED_AND_NOT_PAYED,
  NOT_INVOICED_AND_NOT_PAYED,
  CUSTOMER_INITIATIVE,
  AUXILIARY_INITIATIVE,
} from '../data/constants';

export const planningMixin = {
  components: {
    'ni-planning-manager': Planning,
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
      newEvent: {},
      creationModal: false,
      editedEvent: {},
      editionModal: false,
      cancellationConditions: [
        { label: 'Facturée & payée', value: INVOICED_AND_PAYED },
        { label: 'Facturée & non payée', value: INVOICED_AND_NOT_PAYED },
        { label: 'Non facturée & non payée', value: NOT_INVOICED_AND_NOT_PAYED },
      ],
      cancellationReasons: [
        { label: 'Initiative du client', value: CUSTOMER_INITIATIVE },
        { label: 'Initiative du de l\'intervenant', value: AUXILIARY_INITIATIVE },
      ],
    };
  },
  validations () {
    return {
      newEvent: {
        type: { required },
        dates: {
          startDate: { required },
          endDate: { required },
        },
        startDuration: { required: requiredIf((item) => item.type === ABSENCE) },
        endDuration: { required: requiredIf((item) => item.type === ABSENCE) },
        auxiliary: { required },
        sector: { required },
        customer: { required: requiredIf((item) => item.type === INTERVENTION) },
        subscription: { required: requiredIf((item) => item.type === INTERVENTION) },
        internalHour: { required: requiredIf((item) => item.type === INTERNAL_HOUR) },
        absence: { required: requiredIf((item) => item.type === ABSENCE) },
        location: { fullAddress: { frAddress } },
        repetition: {
          frequency: { required: requiredIf((item) => item.type !== ABSENCE) }
        },
        attachment: {
          driveId: requiredIf((item) => item.type === ABSENCE && item.absence === ILLNESS),
          link: requiredIf((item) => item.type === ABSENCE && item.absence === ILLNESS),
        },
      },
      editedEvent: {
        dates: {
          startDate: { required },
          endDate: { required },
        },
        startDuration: { required: requiredIf((item) => item.type === ABSENCE) },
        endDuration: { required: requiredIf((item) => item.type === ABSENCE) },
        auxiliary: { required },
        sector: { required },
        customer: { required: requiredIf((item) => item.type === INTERVENTION) },
        subscription: { required: requiredIf((item) => item.type === INTERVENTION) },
        internalHour: { required: requiredIf((item) => item.type === INTERNAL_HOUR) },
        absence: { required: requiredIf((item) => item.type === ABSENCE) },
        location: { fullAddress: { frAddress } },
        repetition: {
          frequency: { required: requiredIf((item) => item.type !== ABSENCE) },
        },
        cancel: {
          condition: { required: requiredIf((item, parent) => parent.isCancelled) },
          reason: { required: requiredIf((item, parent) => parent.isCancelled) },
        },
      },
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
    // Event creation
    selectedAddress (item) {
      if (this.creationModal) this.newEvent.location = Object.assign({}, this.newEvent.location, item);
      if (this.editionModal) this.editedEvent.location = Object.assign({}, this.editedEvent.location, item);
    },
    resetCreationForm (partialReset, type = INTERVENTION) {
      this.$v.newEvent.$reset();
      if (!partialReset) this.newEvent = {};
      else {
        this.newEvent = {
          type,
          dates: {
            startDate: partialReset ? this.newEvent.dates.startDate : '',
            startHour: partialReset ? this.newEvent.dates.startHour : '',
            endDate: partialReset ? this.newEvent.dates.endDate : '',
            endHour: partialReset ? this.newEvent.dates.endHour : '',
          },
          repetition: { frequency: NEVER },
          startDuration: '',
          endDuration: '',
          auxiliary: partialReset ? this.newEvent.auxiliary : '',
          customer: '',
          subscription: '',
          sector: partialReset ? this.newEvent.sector : '',
          internalHour: '',
          absence: '',
          location: {},
          attachment: {},
        };
      }
    },
    getPayload (event) {
      let payload = { ...this.$_.omit(event, ['dates', '__v']) }
      payload = this.$_.pickBy(payload);

      if (event.type === INTERNAL_HOUR) {
        const internalHour = this.internalHours.find(hour => hour._id === event.internalHour);
        payload.internalHour = internalHour;
      }
      if (event.type === ABSENCE) {
        payload.startDate = this.$moment(event.dates.startDate).hours(event.startDuration[0].startHour).toISOString();
        if (event.endDuration !== '') {
          payload.endDate = this.$moment(event.dates.endDate).hours(event.endDuration[0].endHour).toISOString();
        } else {
          payload.endDate = this.$moment(event.dates.endDate).hours(event.startDuration[0].endHour).toISOString();
        }

        this.$_.unset(payload, 'startDuration');
        this.$_.unset(payload, 'endDuration');
      } else {
        payload.startDate = this.$moment(event.dates.startDate).hours(event.dates.startHour.split(':')[0])
          .minutes(event.dates.startHour.split(':')[1]).toISOString();
        payload.endDate = this.$moment(event.dates.endDate).hours(event.dates.endHour.split(':')[0])
          .minutes(event.dates.endHour.split(':')[1]).toISOString();
      }

      if (event.location && event.location.fullAddress) delete payload.location.location;
      if (event.location && Object.keys(event.location).length === 0) delete payload.location;
      if (event.cancel && Object.keys(event.cancel).length === 0) delete payload.cancel;
      if (event.cancel && Object.keys(event.cancel).length === 0) delete payload.attachment;
      if (event.shouldUpdateRepetition) delete payload.misc;

      return payload;
    },
    // Event edition
    openEditionModal (eventId) {
      const editedEvent = this.events.find(ev => ev._id === eventId);
      const { createdAt, updatedAt, startDate, endDate, ...eventData } = editedEvent;
      const auxiliary = editedEvent.auxiliary._id;
      const dates = {
        startDate,
        endDate,
        startHour: `${this.$moment(startDate).hours() < 10
          ? `0${this.$moment(startDate).hours()}`
          : this.$moment(startDate).hours()}:${this.$moment(startDate).minutes() || '00'}`,
        endHour: `${this.$moment(endDate).hours() < 10
          ? `0${this.$moment(endDate).hours()}`
          : this.$moment(endDate).hours()}:${this.$moment(endDate).minutes() || '00'}`,
      };
      switch (editedEvent.type) {
        case INTERVENTION:
          const subscription = editedEvent.subscription._id;
          this.editedEvent = { isCancelled: false, cancel: {}, shouldUpdateRepetition: false, ...eventData, dates, auxiliary, subscription };
          break;
        case INTERNAL_HOUR:
          const internalHour = editedEvent.internalHour._id;
          this.editedEvent = { location: {}, shouldUpdateRepetition: false, ...eventData, auxiliary, internalHour, dates };
          break;
        case ABSENCE:
          const { startDuration, endDuration } = this.getAbsenceDurations(editedEvent);
          this.editedEvent = {
            location: {},
            attachment: {},
            ...eventData,
            auxiliary,
            startDuration,
            endDuration,
            dates: { startDate, endDate },
          };
          break;
        case UNAVAILABILITY:
          this.editedEvent = { shouldUpdateRepetition: false, ...eventData, auxiliary, dates };
          break;
      }

      this.editionModal = true
    },
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
    resetEditionForm () {
      this.$v.editedEvent.$reset();
      this.editedEvent = {};
    },
  },
};
