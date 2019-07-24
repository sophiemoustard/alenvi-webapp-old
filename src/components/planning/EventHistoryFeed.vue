<template>
  <div class="history-container" :style="{ height: `${height}px`, top: `${this.top}px` }" >
    <div></div>
    <q-scroll-area>
      <ni-event-history v-for="history in eventHistories" :key="history._id" :history="history" />
    </q-scroll-area>
  </div>
</template>

<script>
import NiEventHistory from './EventHistory';

export default {
  name: 'EventHistoryFeed',
  props: {
    eventHistories: { type: Array, default: () => ([]) },
  },
  computed: {
    height () {
      return window.innerHeight - this.top;
    },
    top () {
      return window.innerWidth >= 768 ? 60 : 100;
    },
  },
  components: {
    'ni-event-history': NiEventHistory,
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables';
  .history-container
    overflow-y: scroll;
    background-color: $white;
    width: 300px;
    top: 60px;
    @media (max-width: 767px)
      top: 100px;
    right: 0;
    position: absolute;
    box-shadow: 0 3px 5px -1px rgba(0,0,0,0.2), 0 5px 8px rgba(0,0,0,0.14), 0 1px 14px rgba(0,0,0,0.12)
    .q-scrollarea
      height: 100%;

</style>
