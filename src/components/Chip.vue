<template>
  <div class="full-width row relative-position">
    <img :src="getAvatar(data.picture.link)" class="avatar">
    <q-chip :class="['absolute-center', { 'busy': isBusy }]" small text-color="white">{{ this.currentHours }}h / {{ weeklyHours }}</q-chip>
  </div>
</template>

<script>
export default {
  name: 'ni-chip',
  props: {
    data: Object
  },
  data () {
    return {
      weeklyHours: 0,
      currentHours: 22
    }
  },
  computed: {
    isBusy () {
      if (this.weeklyHours === 0) return false;
      return this.currentHours > this.weeklyHours;
    }
  },
  mounted () {
    this.getAuxiliaryWeeklyHours();
  },
  methods: {
    getAvatar (link) {
      return link || 'https://res.cloudinary.com/alenvi/image/upload/c_scale,h_400,q_auto,w_400/v1513764284/images/users/default_avatar.png';
    },
    getCurrentContract (contracts) {
      if (!contracts || contracts.length === 0) return 'N/A';
      return contracts.find(contract => !contract.endDate);
    },
    getContractActiveVersion (contract) {
      return contract.versions.find(version => version.isActive);
    },
    getAuxiliaryWeeklyHours () {
      const currentContract = this.getCurrentContract(this.data.administrative.contracts);
      if (!currentContract) return;
      const activeVersion = this.getContractActiveVersion(currentContract);
      if (!activeVersion) return;
      this.weeklyHours = activeVersion.weeklyHours;
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables';

  img
    z-index: 10
    &.avatar
      box-shadow: none
      border: 1px solid #979797
      @media(min-width: 1025px)
        width: 2.5rem
        height: 2.5rem
      @media(max-width: 1024px)
        width: 1.5rem
        height: 1.5rem

  /deep/ .q-chip
    width: 80%
    background: $dark-grey
    @media(max-width: 1024px)
      font-size: 8px
    @media(max-width: 768px)
      display: none
    &-main
      text-align: end
    &-small
      @media(max-width: 1024px)
        min-height: 20px
    &.busy
      background: $secondary !important

</style>
