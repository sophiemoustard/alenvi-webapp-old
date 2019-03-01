<template>
  <div>
    <div class="economic-indicators">
      <p style="font-weight:bold">Heures travaillées</p>
      <div class="progress-indicator">
        <q-progress :percentage="Math.round(weeklyInterventionsPercentage)" class="intervention" />
        <div class="progress-caption">
          <div>Interventions</div>
          <div> {{ `${Math.round(weeklyInterventions)}h` }} -
            {{`${Math.round(weeklyInterventionsPercentage)}%`}}</div>
        </div>
      </div>
      <div class="progress-indicator">
        <q-progress :percentage="Math.round(weeklyInternalHoursPercentage)" class="internal-hours" />
        <div class="progress-caption">
          <div>Interne</div>
          <div>{{ `${Math.round(weeklyInternalHours)}h` }} -
            {{`${Math.round(weeklyInternalHoursPercentage)}%`}} </div>
        </div>
      </div>
      <div class="progress-indicator">
        <q-progress :percentage="Math.round(weeklyPaidTransportsPercentage)" class="transports" />
        <div class="progress-caption">
          <div>Transports</div>
          <div>{{ `${Math.round(weeklyPaidTransports)}h` }} -
            {{`${Math.round(weeklyPaidTransportsPercentage)}%`}}</div>
        </div>
      </div>
    </div>
    <div class="quality-indicators">
      <div class="quality-indicators-item"><span class="highlight">{{ `${Math.round(weeklyTotalTransports)}h` }}</span>
        de transports dont <span class="highlight">{{ `${Math.round(weeklyPaidTransports)}h` }}</span> remunérées</div>
      <div class="quality-indicators-item"><span class="highlight">{{ customersCount }}</span> bénéficiaires
        accompagnés, <span class="highlight">{{ `${Math.round(averageTimeByCustomer)}h` }}</span> en moyenne</div>
      <div class="quality-indicators-item"><span class="highlight">{{ `${Math.round(weeklyBreak)}h` }}</span> de
        coupure, incluant transport</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AuxiliaryIndicators',
  props: {
    totalWorkingHours: { type: Number, default: 0 },
    weeklyInterventions: { type: Number, default: 0 },
    weeklyInternalHours: { type: Number, default: 0 },
    weeklyPaidTransports: { type: Number, default: 0 },
    weeklyTotalTransports: { type: Number, default: 0 },
    customersCount: { type: Number, default: 0 },
    averageTimeByCustomer: { type: Number, default: 0 },
    weeklyBreak: { type: Number, default: 0 },
  },
  computed: {
    weeklyInternalHoursPercentage () {
      if (this.totalWorkingHours === 0) return 0;
      return this.weeklyInternalHours / this.totalWorkingHours * 100;
    },
    weeklyInterventionsPercentage () {
      if (this.totalWorkingHours === 0) return 0;
      return this.weeklyInterventions / this.totalWorkingHours * 100;
    },
    weeklyPaidTransportsPercentage () {
      if (this.totalWorkingHours === 0) return 0;
      return this.weeklyPaidTransports / this.totalWorkingHours * 100;
    },
  },
}
</script>

<style lang="stylus" scoped>
@import '~variables'

  .progress-indicator
    padding: 3px
    border-top: 1px solid $light-grey;
    border-left: 1px solid $light-grey;
    border-right: 1px solid $light-grey;
    &:last-child
      border-bottom: 1px solid $light-grey;

  .progress-caption
    display: flex;
    justify-content: space-between;

  .highlight
    color: $primary
    font-weight: bold

  .economic-indicators
    padding: 0 24px;
    margin: 24px 0;
    border-left: 5px solid $primary-dark !important;

  .quality-indicators
    padding: 0 24px;
    margin-bottom: 24px;
    border-left: 5px solid $primary !important;

  .quality-indicators-item
    border-top: 1px solid $light-grey;
    padding: 10px 0;

  /deep/.q-progress
    height: 10px !important;

    /deep/ .q-progress-track
      background: repeating-linear-gradient(
        45deg,
        $grey-3,
        $grey-3 1px,
        $white 1px,
        $white 3px
      )
      opacity: 0.8;

    &.intervention
      /deep/ .q-progress-model
        color: $light-pink;

    &.internal-hours
      /deep/ .q-progress-model
        color: $light-purple;

    &.transports
      /deep/ .q-progress-model
        color: $primary-dark;

</style>
