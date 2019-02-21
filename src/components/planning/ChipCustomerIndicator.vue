<template>
  <div class="full-width row relative-position">
    <img :src="getAvatar(person.picture)" class="avatar">
    <q-chip class="absolute-center" small text-color="white">
      <span class="chip-indicator">{{ indicators.weeklyHours }}h - {{ indicators.auxiliariesNumber }}</span>
      <q-icon size="14px" name="mdi-human-male" />
    </q-chip>
  </div>
</template>

<script>
import { DEFAULT_AVATAR } from '../../data/constants.js';

export default {
  name: 'ChipCustomerIndicator',
  props: {
    events: { type: Array, default: () => [] },
    person: { type: Object, default: () => ({}) },
  },
  computed: {
    indicators () {
      const auxiliaries = [];
      let weeklyHours = 0;
      this.events.forEach((event) => {
        if (!auxiliaries.includes(event.auxiliary._id)) auxiliaries.push(event.auxiliary._id);
        weeklyHours += this.$moment(event.endDate).diff(event.startDate, 'h', true);
      });
      return { auxiliariesNumber: auxiliaries.length, weeklyHours: Math.round(weeklyHours) };
    },
  },
  methods: {
    getAvatar (picture) {
      return (!picture || !picture.link) ? DEFAULT_AVATAR : picture.link;
    },
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables';

  .avatar
    z-index: 10
    box-shadow: none
    border: 1px solid #979797
    @media(min-width: 1025px)
      width: 2.5rem
      height: 2.5rem
    @media(max-width: 1024px)
      width: 1.5rem
      height: 1.5rem

  /deep/ .q-chip
    width: 100%
    background: $dark-grey
    @media(max-width: 1024px)
      font-size: 8px
    @media(max-width: 768px)
      display: none
    &-main
      justify-content: flex-end;
      padding-left: 1.8rem;
      overflow: visible;
      display: flex;
      align-items: center;
      .q-icon
        width: 8px;
    &-small
      @media(max-width: 1024px)
        min-height: 20px

  .chip-indicator
    white-space: nowrap;
    padding-left: 1px;

</style>
