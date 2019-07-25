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
import { EVENT_CREATION, INTERNAL_HOUR, ABSENCE, EVENT_DELETION, DEFAULT_AVATAR, ABSENCE_TYPES, EVENT_TYPES, INTERVENTION, UNAVAILABILITY, NEVER, EVERY_DAY, EVERY_WEEK_DAY, EVERY_WEEK, EVERY_TWO_WEEKS, EVENT_UPDATE } from '../../data/constants';
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
      return `${this.$moment(this.history.event.startDate).hour()}h${this.$moment(this.history.event.startDate).format('mm')}`;
    },
    endHour () {
      return `${this.$moment(this.history.event.endDate).hour()}h${this.$moment(this.history.event.endDate).format('mm')}`;
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
      if (!this.isOneDayEvent) return `${this.eventName} planifiée du ${this.startDate} au ${this.endDate}.`;

      const { location } = this.history.event;
      let details;
      if (this.isRepetition) details = `${this.eventName}s de ${this.startHour} à ${this.endHour} à partir du ${this.startDate}.`;
      else details = `${this.eventName} planifiée le ${this.startDate} de ${this.startHour} à ${this.endHour}.`;

      return location && location.fullAddress ? `${details} ${location.fullAddress}.` : details;
    },
    // Deletion
    getEventDeletionTitle () {
      const pronom = this.isRepetition && this.history.event.type === INTERVENTION ? 'la ' : 'l\'';
      if (this.isRepetition) return `Suppression de ${pronom}${this.eventType.toLowerCase()} ${this.repetitionFrequency} à partir du ${this.startDate}.`;

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

      return location && location.fullAddress ? `${details} ${location.fullAddress}.` : details;
    },
    // Update
    getEventUpdateTitle () {
      const { auxiliary } = this.history.update;
      if (auxiliary) {
        return this.formatAuxiliaryUpdateTitle();
      }
    },
    formatAuxiliaryUpdateTitle () {
      const { from, to } = this.history.update.auxiliary
      const toAuxiliary = to && to.identity ? formatAuxiliaryShortIdentity(to.identity) : 'À affecter';
      const fromAuxiliary = from && from.identity ? formatAuxiliaryShortIdentity(from.identity) : 'À affecter';

      let title;
      if ((!to || !to.identity) && from && from.identity) title = `Passage en à affecter.`;
      else if ((!from || !from.identity) && to && to.identity) title = `Affectation à ${toAuxiliary}`;
      else title = `${toAuxiliary} remplace ${fromAuxiliary}`;

      if (this.isRepetition) title += ` ${this.eventType} ${this.repetitionFrequency}`;
      else title += ` ${this.eventType} du ${this.startDate}`;

      return this.customerName ? `${title} chez ${this.customerName}` : `${title}`;
    },
    getEventUpdateDetails () {
      const { auxiliary } = this.history.update;
      if (auxiliary) {
        return this.getEventCreationDetails();
      }
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
