<template>
  <div class="history">
    <div class="history-title">
      <div class="history-info">
        <div>{{ historyInfo.title }} {{ historyInfo.subtitle }}</div>
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
import { EVENT_CREATION, INTERVENTION, INTERNAL_HOUR, ABSENCE, UNAVAILABILITY, EVENT_DELETION, DEFAULT_AVATAR, ABSENCE_TYPES } from '../../data/constants';
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
          const absenceName = ABSENCE_TYPES.find(abs => abs.value === absence);

          return this.$moment(startDate).isSame(endDate, 'd')
            ? `${absenceName.label || 'Absence'} le ${startDate.format('DD/MM')} de ${startHour} à ${endHour}.`
            : `${absenceName.label || 'Absence'} du ${startDate.format('DD/MM')} au ${endDate.format('DD/MM')}.`;
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
    getEventDeletionHistoryDetails () {
      const { type, internalHour, location } = this.history.event;

      const startHour = this.$moment(this.history.event.startDate).format('HH:mm');
      const endHour = this.$moment(this.history.event.endDate).format('HH:mm');
      switch (type) {
        case INTERVENTION:
          return `Intervention initialement prévue de ${startHour} à ${endHour}.`;
        case INTERNAL_HOUR:
          return `${internalHour.name} initialement prévu(e) de ${startHour} à ${endHour}. ${location && location.fullAddress ? `${location.fullAddress}.` : ''}`;
        case UNAVAILABILITY:
          return `Initialement prévue de ${startHour} à ${endHour}.`;
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
