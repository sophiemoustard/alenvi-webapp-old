<template>
  <q-page-sticky expand position="right">
    <div></div>
    <div class="event-history-container">
      <q-scroll-area>
        <ni-event-history v-for="(history, index) in eventHistories" :key="index" :history="history" />
      </q-scroll-area>
    </div>
  </q-page-sticky>
</template>

<script>
import NiEventHistory from './EventHistory';

export default {
  name: 'EventHistoryFeed',
  props: {
    eventHistories: { type: Array, default: () => ([]) },
  },
  components: {
    'ni-event-history': NiEventHistory,
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables';
  .event-history-container
    background-color: $white;
    width: 300px;
    height: 100%;
    top: 75px;
    right: 0;
    position: absolute;
    box-shadow: 0 3px 5px -1px rgba(0,0,0,0.2), 0 5px 8px rgba(0,0,0,0.14), 0 1px 14px rgba(0,0,0,0.12)
    .q-scrollarea
      height: 100%;

</style>
