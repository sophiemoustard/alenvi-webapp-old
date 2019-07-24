<template>
  <div class="event-history">
    <div class="event-history-title">
      <div class="icons">
        <q-icon size="20px" :name="iconName" />
        <img size="20px" :src="getAvatar(history.createdBy)" class="avatar">
      </div>
      <div class="title">
        <span>{{ historyInfo.title }}</span>
        <span v-if="this.history.action !== EVENT_DELETION">{{ historyInfo.subtitle }}</span>
        <span class="history-info">{{ historySignature }}</span>
      </div>
      <div class="icons ">
        <q-btn size="10px" flat round icon="keyboard_arrow_down" @click="toggleDetails" />
      </div>
    </div>
    <div v-if="displayDetails" class="event-history-details">
      <div>{{ historyInfo.details }}</div>
      <div>{{ history.event.misc }}</div>
    </div>
  </div>
</template>

<script>
import { EVENT_CREATION, INTERVENTION, INTERNAL_HOUR, ABSENCE, UNAVAILABILITY, EVENT_DELETION, DEFAULT_AVATAR } from '../../data/constants';
import { formatAuxiliaryShortIdentity, formatFullIdentity, formatCustomerShortIdentity } from '../../helpers/utils';

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
    historyInfo () {
      switch (this.history.action) {
        case EVENT_CREATION:
          return {
            iconName: 'add',
            title: this.getEventCreationHistoryTitle(),
            subtitle: this.getEventCreationHistorySubtitle(),
            details: this.getEventCreationHistoryDetails(),
          };
        case EVENT_DELETION:
          return {
            iconName: 'delete',
            title: this.getEventDeletionHistoryTitle(),
            details: this.getEventDeletionHistoryDetails(),
          };
      }
    },
    historySignature () {
      const date = this.$moment(this.history.createdAt).format('DD/MM/YYYY');
      const user = formatFullIdentity(this.history.createdBy.identity);
      return `Le ${date} par ${user}.`;
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
    getEventCreationHistoryTitle () {
      switch (this.history.event.type) {
        case INTERVENTION:
          const date = this.$moment(this.history.event.startDate).format('DD/MM');
          return `Nouvelle intervention le ${date}.`;
        case INTERNAL_HOUR:
          return 'Nouvelle heure interne.';
        case ABSENCE:
          return 'Nouvelle absence.';
        case UNAVAILABILITY:
          return 'Nouvelle indispo.';
      }
    },
    getEventCreationHistorySubtitle () {
      const auxiliary = this.$_.has(this.history, 'event.auxiliary.identity')
        ? formatAuxiliaryShortIdentity(this.history.event.auxiliary.identity)
        : 'À affecter';

      switch (this.history.event.type) {
        case INTERVENTION:
          const customer = formatCustomerShortIdentity(this.history.event.customer.identity);
          return `${auxiliary} chez ${customer}.`;
        case INTERNAL_HOUR:
        case UNAVAILABILITY:
        case ABSENCE:
          const startDate = this.$moment(this.history.event.startDate);
          const endDate = this.$moment(this.history.event.endDate);

          return this.$moment(startDate).isSame(endDate, 'd')
            ? `${auxiliary} le ${startDate.format('DD/MM')}.`
            : `${auxiliary} du ${startDate.format('DD/MM')} au ${endDate.format('DD/MM')}.`;
      }
    },
    getEventCreationHistoryDetails () {
      const { type, internalHour, absence, location } = this.history.event;
      console.log(this.history.event)
      const startHour = this.$moment(this.history.event.startDate).format('HH:mm');
      const endHour = this.$moment(this.history.event.endDate).format('HH:mm');
      switch (type) {
        case INTERVENTION:
          return `Intervention planifiée de ${startHour} à ${endHour}.`;
        case INTERNAL_HOUR:
          return `${internalHour.name} de ${startHour} à ${endHour}. ${location && location.fullAddress ? `${location.fullAddress}.` : ''}`;
        case ABSENCE:
          const startDate = this.$moment(this.history.event.startDate);
          const endDate = this.$moment(this.history.event.endDate);

          return this.$moment(startDate).isSame(endDate, 'd')
            ? `${absence} le ${startDate.format('DD/MM')} de ${startHour} à ${endHour}.`
            : `${absence} du ${startDate.format('DD/MM')} au ${endDate.format('DD/MM')}.`;
        case UNAVAILABILITY:
          return `${startHour} à ${endHour}.`;
      }
    },
    // Deletion
    getEventDeletionHistoryTitle () {
      const startDate = this.$moment(this.history.event.startDate).format('DD/MM');
      const auxiliary = this.$_.has(this.history, 'event.auxiliary.identity')
        ? formatAuxiliaryShortIdentity(this.history.event.auxiliary.identity)
        : 'À affecter';

      switch (this.history.event.type) {
        case INTERVENTION:
          const customer = formatCustomerShortIdentity(this.history.event.customer.identity);
          return `Intervention du ${startDate} chez ${customer}.`;
        case INTERNAL_HOUR:
          return `Heure interne de ${auxiliary} le ${startDate}`;
        case ABSENCE:
          const endDate = this.$moment(this.history.event.endDate).format('DD/MM');
          return this.$moment(startDate).isSame(endDate)
            ? `Absence de ${auxiliary} le ${startDate}`
            : `Absence de ${auxiliary} du ${startDate} au ${endDate}`;
        case UNAVAILABILITY:
          return `Indispo de ${auxiliary} le ${startDate}`;
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
@import '~variables';
  .event-history
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
    .icons
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      padding: 0 5px;

  .event-history-title
    margin: 2px;
    padding: 5px;
    display: flex;

    .title
      padding: 0 5px;
      display: flex;
      flex-direction column;
      flex: 1;

    .history-info
      font-size: 12px;
      font-style: italic;
      margin: 2px 0 3px;

  .event-history-details
    margin: 2px;
    padding: 5px;
</style>
