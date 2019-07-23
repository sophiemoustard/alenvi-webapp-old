<template>
  <div :class="['event-history', `event-${history.event.type}`]">
    <!-- <q-icon size="20px" :name="iconName" /> -->
    <img :src="getAvatar(history.createdBy.picture)" class="avatar">
    <div class="title">
      <span>{{ historyTitle.title }}</span>
      <span v-if="this.history.action !== EVENT_DELETION">{{ historyTitle.subtitle }}</span>
      <span class="history-info">{{ historyInfo }}</span>
    </div>
  </div>
</template>

<script>
import { EVENT_CREATION, INTERVENTION, INTERNAL_HOUR, ABSENCE, UNAVAILABILITY, EVENT_DELETION, DEFAULT_AVATAR } from '../../data/constants';
import { formatShortIdentity, formatFullIdentity } from '../../helpers/utils';

export default {
  name: 'EventHistory',
  props: {
    history: { type: Object, default: () => ({}) },
  },
  data () {
    return {
      EVENT_DELETION,
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
    historyTitle () {
      switch (this.history.action) {
        case EVENT_CREATION:
          return {
            iconName: 'add',
            title: this.getEventCreationHistoryTitle(),
            subtitle: this.getEventCreationHistorySubtitle(),
          };
        case EVENT_DELETION:
          return {
            iconName: 'delete',
            title: this.getEventDeletionHistoryTitle(),
          };
      }
    },
    historyInfo () {
      const date = this.$moment(this.history.createdAt).format('DD/MM/YYYY');
      const user = formatFullIdentity(this.history.createdBy.identity);
      return `Le ${date} par ${user}.`;
    },
  },
  methods: {
    getAvatar (user) {
      return this.$_.get(user, 'picture.link') || DEFAULT_AVATAR;
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
        ? formatFullIdentity(this.history.event.auxiliary.identity)
        : 'À affecter';

      switch (this.history.event.type) {
        case INTERVENTION:
          const customer = formatShortIdentity(this.history.event.customer.identity);
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
    // Deletion
    getEventDeletionHistoryTitle () {
      const startDate = this.$moment(this.history.event.startDate).format('DD/MM');
      const auxiliary = this.$_.has(this.history, 'event.auxiliary.identity')
        ? formatFullIdentity(this.history.event.auxiliary.identity)
        : 'À affecter';

      switch (this.history.event.type) {
        case INTERVENTION:
          const customer = formatShortIdentity(this.history.event.customer.identity);
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
    padding: 5px;
    width: 100%;
    display: flex;
    font-size: 15px;
    @media (max-width: 767px)
      font-size: 14px

    .q-icon
      padding: 0 5px;

    .title
      padding: 0 5px;
      display: flex;
      flex-direction column;

    .history-info
      font-size: 12px;
      font-style: italic;
      margin: 2px 0;
</style>
