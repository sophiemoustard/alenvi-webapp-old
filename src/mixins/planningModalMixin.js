import SelectSector from '../components/form/SelectSector';
import DatetimePicker from '../components/form/DatetimePicker.vue';
import DatetimeRange from '../components/form/DatetimeRange.vue';
import ModalSelect from '../components/form/ModalSelect';
import ModalInput from '../components/form/ModalInput';
import SearchAddress from '../components/form/SearchAddress';
import FileUploader from '../components/form/FileUploader';
import { formatFullIdentity } from '../helpers/utils';
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
  CUSTOMER_INITIATIVE,
  AUXILIARY_INITIATIVE,
  ABSENCE_TYPES,
  ABSENCE_NATURES,
  UNJUSTIFIED,
  DAILY,
  HOURLY,
  ILLNESS,
  REQUIRED_LABEL,
  CUSTOMER_CONTRACT,
  COMPANY_CONTRACT,
  ADMIN,
  COACH,
  EVENT_TYPES,
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
      DAILY,
      HOURLY,
      absenceNatureOptions: ABSENCE_NATURES,
      cancellationConditions: [
        { label: 'Facturée & payée', value: INVOICED_AND_PAYED },
        { label: 'Facturée & non payée', value: INVOICED_AND_NOT_PAYED },
      ],
      cancellationReasons: [
        { label: 'Initiative du client', value: CUSTOMER_INITIATIVE },
        { label: 'Initiative du de l\'intervenant', value: AUXILIARY_INITIATIVE },
      ],
    };
  },
  computed: {
    getUser () {
      return this.$store.getters['main/user'];
    },
    absenceOptions () {
      if (this.newEvent && this.newEvent.absenceNature === HOURLY) {
        return ABSENCE_TYPES.filter(type => type.value === UNJUSTIFIED);
      }

      return ABSENCE_TYPES;
    },
    disableCreationButton () {
      if (!this.newEvent.type) return true;
      switch (this.newEvent.type) {
        case ABSENCE:
          if (this.newEvent.absenceNature === DAILY) {
            return !this.newEvent.auxiliary || !this.newEvent.absence || !this.newEvent.dates.startDate ||
              !this.newEvent.dates.endDate || !this.newEvent.absenceNature;
          }

          return !this.newEvent.auxiliary || !this.newEvent.absence || !this.newEvent.dates.startDate ||
            !this.newEvent.absenceNature || !this.newEvent.dates.startHour || !this.newEvent.dates.endHour;
        case INTERVENTION:
          return !this.newEvent.customer || !this.newEvent.subscription || !this.newEvent.dates.startDate ||
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
          if (this.editedEvent.absenceNature === DAILY) {
            return !this.editedEvent.auxiliary || !this.editedEvent.absence || !this.editedEvent.dates.startDate ||
              !this.editedEvent.dates.endDate || !this.editedEvent.absenceNature;
          }

          return !this.editedEvent.auxiliary || !this.editedEvent.absence || !this.editedEvent.dates.startDate ||
            !this.editedEvent.absenceNature || !this.editedEvent.dates.startHour || !this.editedEvent.dates.endHour;
        case INTERVENTION:
          const shouldDisableButton = !this.editedEvent.subscription || !this.editedEvent.dates.startDate ||
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
    eventTypeOptions () {
      if (this.selectedAuxiliary && !this.selectedAuxiliary._id) {
        return EVENT_TYPES.filter(type => type.value === INTERVENTION);
      }

      if (this.selectedAuxiliary && !this.selectedAuxiliary.hasActiveCompanyContractOnEvent) {
        return EVENT_TYPES.filter(type => type.value !== INTERNAL_HOUR);
      }

      return EVENT_TYPES;
    },
    auxiliariesOptions () {
      return this.auxiliaries.length === 0 ? [] : [
        { label: 'À affecter', value: '' },
        ...this.auxiliaries.map(aux => this.formatPersonOptions(aux)),
      ];
    },
    customersOptions () {
      if (this.customers.length === 0 || !this.selectedAuxiliary) return [];
      if (!this.selectedAuxiliary._id) return this.customers.map(cus => this.formatPersonOptions(cus)); // Unassigned event
      if (!this.selectedAuxiliary.contracts) return [];

      let customers = this.customers;
      if (this.selectedAuxiliary && !this.selectedAuxiliary.hasActiveCompanyContractOnEvent) {
        const auxiliaryCustomers = [];
        for (const contract of this.selectedAuxiliary.contracts) {
          if (contract.customer && !auxiliaryCustomers.includes(contract.customer)) auxiliaryCustomers.push(contract.customer);
        }

        customers = this.customers.filter(cus => auxiliaryCustomers.includes(cus._id));
      }

      return customers.map(cus => this.formatPersonOptions(cus));
    },
    internalHourOptions () {
      return this.internalHours.map(hour => ({
        label: hour.name,
        value: hour._id,
      }));
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
      return !this.validations.location.fullAddress.required ? REQUIRED_LABEL : 'Adresse non valide';
    },
    customerAddress () {
      return this.$_.get(this.editedEvent, 'customer.contact.address.fullAddress', '');
    },
    customerProfileRedirect () {
      if (this.getUser.role.name === COACH || this.getUser.role.name === ADMIN) return { name: 'customers profile', params: { id: this.editedEvent.customer._id } };
      return { name: 'profile customers info', params: { customerId: this.editedEvent.customer._id } };
    }
  },
  methods: {
    formatPersonOptions (person) {
      return {
        label: formatFullIdentity(person.identity),
        value: person._id,
      };
    },
    // Event creation
    customerSubscriptionsOptions (customerId) {
      if (!customerId) return [];
      const selectedCustomer = this.customers.find(customer => customer._id === customerId);
      if (!selectedCustomer || !selectedCustomer.subscriptions || selectedCustomer.subscriptions.length === 0) return [];

      let subscriptions = selectedCustomer.subscriptions;
      if (this.selectedAuxiliary._id) {
        if (!this.selectedAuxiliary.hasActiveCustomerContractOnEvent) subscriptions = subscriptions.filter(sub => sub.service.type !== CUSTOMER_CONTRACT);
        if (!this.selectedAuxiliary.hasActiveCompanyContractOnEvent) subscriptions = subscriptions.filter(sub => sub.service.type !== COMPANY_CONTRACT);
      }

      return subscriptions.map(sub => ({
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
    toggleServiceSelection (customerId) {
      const customerSubscriptionsOptions = this.customerSubscriptionsOptions(customerId);
      if (customerSubscriptionsOptions.length === 1 && this.creationModal) this.newEvent.subscription = customerSubscriptionsOptions[0].value;
    },
  },
};
