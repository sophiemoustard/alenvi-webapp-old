<template>
  <div class="history">
    <div class="history-title">
      <div class="history-info">
        <div>{{ historyInfo.title }}</div>
        <q-btn v-if="historyInfo.details" color="primary" size="10px" flat round icon="remove_red_eye" @click="toggleDetails" />
      </div>
      <div v-if="displayDetails" class="history-details">
        <div>{{ historyInfo.details }}</div>
        <div class="history-misc">{{ history.event.misc }}</div>
      </div>
      <div class="history-signature">
        <img size="20px" :src="getAvatar(history.createdBy)" class="avatar">
        <div>{{ historySignature }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { EVENT_CREATION, INTERNAL_HOUR, ABSENCE, EVENT_DELETION, DEFAULT_AVATAR, ABSENCE_TYPES, EVENT_TYPES, INTERVENTION, UNAVAILABILITY } from '../../data/constants';
import { formatAuxiliaryShortIdentity, formatCustomerShortIdentity } from '../../helpers/utils';

export default {
  name: 'EventHistory',
  props: {
    history: { type: Object, default: () => ({}) },
  },
  data () {
    return {
      EVENT_DELETION,
      displayDetails: false,
    };
  },
  computed: {
    iconName () {
      switch (this.history.action) {
        case EVENT_CREATION:
          return 'add';
        case EVENT_DELETION:
          return 'delete';
      }
    },
    auxiliaryName () {
      return this.$_.has(this.history, 'event.auxiliary.identity')
        ? formatAuxiliaryShortIdentity(this.history.event.auxiliary.identity)
        : 'À affecter';
    },
    customerName () {
      return this.$_.has(this.history, 'event.customer.identity') && formatCustomerShortIdentity(this.history.event.customer.identity);
    },
    startDate () {
      return this.$moment(this.history.event.startDate).format('DD/MM');
    },
    endDate () {
      return this.$moment(this.history.event.endDate).format('DD/MM');
    },
    startHour () {
      return this.$moment(this.history.event.startDate).format('HH:mm');
    },
    endHour () {
      return this.$moment(this.history.event.endDate).format('HH:mm');
    },
    isMultipleDaysEvent () {
      return !this.$moment(this.history.event.startDate).isSame(this.history.event.endDate, 'day');
    },
    eventType () {
      if (!this.$_.has(this.history, 'event.type')) return '';

      if (this.history.event.type === INTERNAL_HOUR) return 'heure interne';
      else {
        const type = EVENT_TYPES.find(type => type.value === this.history.event.type);
        return type ? type.label : '';
      }
    },
    eventName () {
      const { type, internalHour, absence } = this.history.event;
      switch (type) {
        case INTERVENTION:
        case UNAVAILABILITY:
          return this.eventType;
        case INTERNAL_HOUR:
          return internalHour.name;
        case ABSENCE:
          const absenceName = ABSENCE_TYPES.find(abs => abs.value === absence);
          return absenceName ? absenceName.label : 'Absence';
      }
    },
    historyInfo () {
      switch (this.history.action) {
        case EVENT_CREATION:
          return {
            iconName: 'add',
            title: this.getEventCreationTitle(),
            details: this.getEventCreationDetails(),
          };
        case EVENT_DELETION:
          return {
            iconName: 'delete',
            title: this.getEventDeletionTitle(),
            details: this.getEventDeletionDetails(),
          };
      }
    },
    historySignature () {
      const date = this.$moment(this.history.createdAt).format('DD/MM');
      const hour = this.$moment(this.history.createdAt).format('HH:mm');
      const user = formatAuxiliaryShortIdentity(this.history.createdBy.identity);

      return `${user} le ${date} à ${hour}`;
    },
  },
  methods: {
    getAvatar (user) {
      return this.$_.get(user, 'picture.link') || DEFAULT_AVATAR;
    },
    toggleDetails () {
      this.displayDetails = !this.displayDetails;
    },
    // Creation
    getEventCreationTitle () {
      if (this.isMultipleDaysEvent) return `Nouvelle ${this.eventType.toLowerCase()} de ${this.auxiliaryName} du ${this.startDate} au ${this.endDate}.`;
      if (this.customerName) return `Nouvelle ${this.eventType.toLowerCase()} de ${this.auxiliaryName} le ${this.startDate} chez ${this.customerName}.`;
      return `Nouvelle ${this.eventType.toLowerCase()} de ${this.auxiliaryName} le ${this.startDate}.`;
    },
    getEventCreationDetails () {
      const { location } = this.history.event;

      if (this.isMultipleDaysEvent) return `${this.eventName} planifiée du ${this.startDate} au ${this.endDate}.`
      if (location && location.fullAddress) return `${this.eventName} planifiée le ${this.startDate} de ${this.startHour} à ${this.endHour}. ${location.fullAddress}.`
      return `${this.eventName} planifiée le ${this.startDate} de ${this.startHour} à ${this.endHour}.`
    },
    // Deletion
    getEventDeletionTitle () {
      if (this.isMultipleDaysEvent) return `Suppression de l'${this.eventType.toLowerCase()} de ${this.auxiliaryName} du ${this.startDate} au ${this.endDate}.`;
      if (this.customerName) return `Suppression de l'${this.eventType.toLowerCase()} de ${this.auxiliaryName} le ${this.startDate} chez ${this.customerName}.`
      return `Suppression de l'${this.eventType.toLowerCase()} de ${this.auxiliaryName} le ${this.startDate}.`
    },
    getEventDeletionDetails () {
      if (this.history.event.type === ABSENCE) return;

      if (location && location.fullAddress) return `${this.eventName} initialement prévu(e) de ${this.startHour} à ${this.endHour}. ${location.fullAddress}.`;
      return `${this.eventName} initialement prévu(e) de ${this.startHour} à ${this.endHour}.`;
    },
  },
}
</script>

<style lang="stylus" scoped>
@import '~variables';
  .history
    margin: 2px;
    width: 100%;
    display: block;
    font-size: 15px;
    @media (max-width: 767px)
      font-size: 14px
    &:after
      content: "";
      display: block;
      margin: auto;
      width: 95%;
      border-bottom: 1px solid $light-grey;
    .avatar
      height: 20px !important;
      width: 20px !important;

  .history-title
    margin: 2px 10px 0 2px;
    padding: 5px;

    .history-info
      display: flex;
      div
        flex: 1;
      .q-btn-round
        height: 20px;

    .history-details
      font-size: 14px;
      margin: 3px 0 5px;

      .history-misc
        font-style: italic;

    .history-signature
      font-size: 12px;
      font-style: italic;
      display: flex;
      align-items: center
      margin: 2px 0 3px;
      div
        margin-left: 5px

</style>
