<template>
  <div :class="['event-history', `event-${history.event.type}`]">
    <q-icon size="20px" name="add" />
    <div class="title">
      <span>{{ historyTitle.title }}</span>
      <span>{{ historyTitle.subtitle }}</span>
      <span class="history-info">{{ historyInfo }}</span>
    </div>
  </div>
</template>

<script>
import { EVENT_CREATION, INTERVENTION, INTERNAL_HOUR, ABSENCE, UNAVAILABILITY } from '../../data/constants';
import { formatShortIdentity, formatFullIdentity } from '../../helpers/utils';

export default {
  name: 'EventHistory',
  props: {
    history: { type: Object, default: () => ({}) },
  },
  computed: {
    historyTitle () {
      switch (this.history.action) {
        case EVENT_CREATION:
          return {
            title: this.getEventCreationHistoryTitle(),
            subtitle: this.getEventCreationHistorySubtitle(),
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

          return this.$moment(startDate).isSame(endDate)
            ? `${auxiliary} le ${startDate.format('DD/MM')}.`
            : `${auxiliary} du ${startDate.format('DD/MM')} au ${endDate.format('DD/MM')}.`;
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
