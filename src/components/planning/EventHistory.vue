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
import {
  EVENT_CREATION,
  INTERNAL_HOUR,
  ABSENCE,
  EVENT_DELETION,
  DEFAULT_AVATAR,
  ABSENCE_TYPES,
  EVENT_TYPES,
  INTERVENTION,
  UNAVAILABILITY,
  NEVER,
  EVERY_DAY,
  EVERY_WEEK_DAY,
  EVERY_WEEK,
  EVERY_TWO_WEEKS,
  EVENT_UPDATE,
  CANCELLATION_OPTIONS,
} from '../../data/constants';
import { formatAuxiliaryShortIdentity, formatCustomerShortIdentity, formatHoursWithMinutes } from '../../helpers/utils';

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
      return formatHoursWithMinutes(this.history.event.startDate);
    },
    endHour () {
      return formatHoursWithMinutes(this.history.event.endDate);
    },
    isOneDayEvent () {
      return this.$moment(this.history.event.startDate).isSame(this.history.event.endDate, 'day');
    },
    isRepetition () {
      const { repetition } = this.history.event;
      return !!repetition && repetition.frequency !== NEVER;
    },
    repetitionFrequency () {
      if (!this.isRepetition) return;

      const { repetition, startDate } = this.history.event;
      const day = this.$moment(startDate).format('dddd');
      switch (repetition.frequency) {
        case EVERY_DAY:
          return 'tous les jours';
        case EVERY_WEEK_DAY:
          return 'du lundi au vendredi';
        case EVERY_WEEK:
          return `tous les ${day}s`;
        case EVERY_TWO_WEEKS:
          return `le ${day} une semaine sur 2`;
      }
    },
    eventType () {
      if (!this.$_.has(this.history, 'event.type')) return '';

      const { type } = this.history.event;
      if (this.isRepetition && type === INTERVENTION) return 'Répétition';
      else if (type === INTERNAL_HOUR) return 'Heure interne';
      else {
        const eventType = EVENT_TYPES.find(t => t.value === type);
        return eventType ? eventType.label : '';
      }
    },
    eventName () {
      const { type, internalHour, absence } = this.history.event;
      switch (type) {
        case INTERVENTION:
          return 'Intervention';
        case UNAVAILABILITY:
          return 'Indispo';
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
            title: this.getEventCreationTitle(),
            details: this.getEventCreationDetails(),
          };
        case EVENT_DELETION:
          return {
            title: this.getEventDeletionTitle(),
            details: this.getEventDeletionDetails(),
          };
        case EVENT_UPDATE:
          return {
            title: this.getEventUpdateTitle(),
            details: this.getEventUpdateDetails(),
          }
      }
    },
    historySignature () {
      const date = this.$moment(this.history.createdAt).format('DD/MM');
      const hour = `${this.$moment(this.history.createdAt).hour()}h${this.$moment(this.history.createdAt).format('mm')}`;
      const user = formatAuxiliaryShortIdentity(this.history.createdBy.identity);

      return `${user} le ${date} à ${hour}.`;
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
      const typeAndAuxiliary = `Nouvelle ${this.eventType.toLowerCase()} de ${this.auxiliaryName}`;

      if (!this.isOneDayEvent) return `${typeAndAuxiliary} du ${this.startDate} au ${this.endDate}.`;
      if (this.isRepetition && this.customerName) return `${typeAndAuxiliary} ${this.repetitionFrequency} chez ${this.customerName}.`;
      if (this.isRepetition) return `${typeAndAuxiliary} ${this.repetitionFrequency}.`;
      if (this.customerName) return `${typeAndAuxiliary} le ${this.startDate} chez ${this.customerName}.`;
      return `${typeAndAuxiliary} le ${this.startDate}.`;
    },
    getEventCreationDetails () {
      if (!this.isOneDayEvent) return `${this.eventName} planifié(e) du ${this.startDate} au ${this.endDate}.`;

      let details;
      if (this.isRepetition) details = `${this.eventName}s planifié(e)s de ${this.startHour} à ${this.endHour} à partir du ${this.startDate}.`;
      else details = `${this.eventName} planifié(e) le ${this.startDate} de ${this.startHour} à ${this.endHour}.`;

      const { address } = this.history.event;

      return address && address ? `${details} ${address.fullAddress}.` : details;
    },
    // Deletion
    getEventDeletionTitle () {
      if (this.isRepetition) {
        const pronom = this.history.event.type === INTERVENTION ? 'la ' : 'l\'';
        const title = `Suppression de ${pronom}${this.eventType.toLowerCase()} ${this.repetitionFrequency} à partir du ${this.startDate}.`;
        return this.customerName ? `${title} chez ${this.customerName}.` : `${title}.`
      }

      const typeAndAuxiliary = `Suppression de l'${this.eventType.toLowerCase()} de ${this.auxiliaryName}`;
      if (!this.isOneDayEvent) return `${typeAndAuxiliary} du ${this.startDate} au ${this.endDate}.`;

      const title = `${typeAndAuxiliary} le ${this.startDate}`
      return this.customerName ? `${title} chez ${this.customerName}.` : `${title}.`
    },
    getEventDeletionDetails () {
      if (this.history.event.type === ABSENCE) return;

      let details;
      if (this.isRepetition) details = `${this.eventName}s initialement prévu(e)s de ${this.startHour} à ${this.endHour} à partir du ${this.startDate}.`;
      else details = `${this.eventName} initialement prévu(e) de ${this.startHour} à ${this.endHour}.`;

      const { address } = this.history.event;

      return address && address.fullAddress ? `${details} ${address.fullAddress}.` : details;
    },
    // Update
    getEventUpdateTitle () {
      const { auxiliary, startDate, cancel, startHour } = this.history.update;
      if (auxiliary) return this.formatAuxiliaryUpdateTitle();
      if (startDate) return this.formatDatesUpdateTitle();
      if (cancel) return this.formatCancelUpdateTitle();
      if (startHour) return this.formatHoursUpdateTitle();
    },
    formatAuxiliaryUpdateTitle () { // Auxiliary update : only for intervention and internal hour.
      const { from, to } = this.history.update.auxiliary
      const toAuxiliary = to && to.identity ? formatAuxiliaryShortIdentity(to.identity) : 'À affecter';
      const fromAuxiliary = from && from.identity ? formatAuxiliaryShortIdentity(from.identity) : 'À affecter';

      let title = `Changement d'auxiliaire pour `;
      const pronom = this.isRepetition && this.history.event.type === INTERVENTION ? 'la ' : 'l\'';
      if (this.isRepetition) title += `${pronom}${this.eventType.toLowerCase()} ${this.repetitionFrequency}`;
      else title += `${pronom}${this.eventType.toLowerCase()} du ${this.startDate}`;
      if (this.customerName) title += ` chez ${this.customerName}`;

      if (to && to.identity && from && from.identity) title += `\xa0: ${toAuxiliary} remplace ${fromAuxiliary}`;
      else if (to && to.identity) title += `\xa0: affectée à ${toAuxiliary}`;
      else title += `\xa0: passée en à affecter.`;

      return title;
    },
    formatDatesUpdateTitle () {
      const { endDate, startDate } = this.history.update;
      let title = `Changement de dates pour l'${this.eventType.toLowerCase()} de ${this.auxiliaryName}`;
      if (this.customerName) title += ` chez ${this.customerName}`;

      if (startDate && endDate) {
        title += `\xa0: du ${this.$moment(startDate.to).format('DD/MM')} au ${this.$moment(endDate.to).format('DD/MM')}.`
      } else title += `\xa0: ${this.$moment(startDate.to).format('DD/MM')}.`

      return title;
    },
    formatHoursUpdateTitle () {
      const { endHour, startHour } = this.history.update;
      const { to: startHourTo } = startHour;
      const { to: endHourTo } = endHour;

      const pronom = this.isRepetition && this.history.event.type === INTERVENTION ? 'la ' : 'l\'';
      let title = `Changement d'horaire pour ${pronom}${this.eventType.toLowerCase()} de ${this.auxiliaryName}`;
      if (this.isRepetition) title += ` ${this.repetitionFrequency}`;
      else title += ` le ${this.startDate}`
      if (this.customerName) title += ` chez ${this.customerName}`;

      return `${title}\xa0:  ${this.$moment(startHourTo).format('HH:mm')} - ${this.$moment(endHourTo).format('HH:mm')}.`
    },
    formatCancelUpdateTitle () { // Cancellation : only for intervention and not applied to repetitions.
      return `Annulation de l'${this.eventType.toLowerCase()} de ${this.auxiliaryName} le ${this.startDate} chez ${this.customerName}.`;
    },
    getEventUpdateDetails () {
      const { auxiliary, startDate, cancel, startHour } = this.history.update;
      if (auxiliary) return this.getEventCreationDetails();
      if (startDate) return this.formatDatesUpdateDetails();
      if (cancel) {
        const condition = CANCELLATION_OPTIONS.find(opt => opt.value === cancel.condition);
        return condition ? `${this.getEventDeletionDetails()} ${condition.label}.` : `${this.getEventDeletionDetails()}`;
      }
      if (startHour) return this.formatHoursUpdateDetails();
    },
    formatDatesUpdateDetails () {
      const { endDate, startDate } = this.history.update;
      const startDateFrom = this.$moment(startDate.from).format('DD/MM');
      const endDateFrom = endDate && this.$moment(endDate.from).format('DD/MM');

      let details;
      if (!this.isOneDayEvent) details = `${this.eventName}s initialement prévu(e)s du ${startDateFrom} au ${endDateFrom}.`;
      else details = `${this.eventName} initialement prévu(e) le ${startDateFrom}.`;

      const { address } = this.history.event;

      return address && address.fullAddress ? `${details} ${address.fullAddress}.` : details;
    },
    formatHoursUpdateDetails () {
      const { endHour, startHour } = this.history.update;
      const startHourFrom = formatHoursWithMinutes(startHour.from);
      const endHourFrom = formatHoursWithMinutes(endHour.from);

      let details;
      if (this.isRepetition) details = `${this.eventName}s initialement prévu(e)s de ${startHourFrom} à ${endHourFrom} à partir du ${this.startDate}.`;
      else details = `${this.eventName} initialement prévu(e) de ${startHourFrom} à ${endHourFrom}.`;

      const { address } = this.history.event;

      return address && address.fullAddress ? `${details} ${address.fullAddress}.` : details;
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
    font-size: 13px;
    &:after
      content: "";
      display: block;
      margin: auto;
      width: 95%;
      border-bottom: 1px solid $grey-3;
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
      font-size: 12px;
      color: $dark-grey;
      margin: 3px 0 5px;

      .history-misc
        font-style: italic;

    .history-signature
      color: $dark-grey;
      font-size: 12px;
      font-style: italic;
      display: flex;
      align-items: center
      margin: 2px 0 3px;
      div
        margin-left: 5px

</style>
