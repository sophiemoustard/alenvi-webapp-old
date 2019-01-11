<template>
  <div>
    <table>
      <tr>
        <td></td>
        <td v-for="(day, index) in daysHeader" :key="index">
          {{day}}
        </td>
      </tr>
      <tr v-for="(auxiliary, index) in auxiliaries" :key="index">
        <td>
          {{auxiliary.firstname}} {{auxiliary.lastname}}
        </td>
        <td v-for="(day, dayIndex) in days" :key="dayIndex">
          <div class="row" v-for="(event, eventIndex) in getAuxiliaryEvents(auxiliary, dayIndex)" :key="eventIndex">
            <p class="col-12">
              {{ event.customer.identity.lastname }}
            </p>
          </div>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import moment from 'moment';
moment.locale('fr');
import { extendMoment } from 'moment-range';

const momentRange = extendMoment(moment);

export default {
  data () {
    return {
      startOfWeek: momentRange().startOf('week'),
      endOfWeek: momentRange().endOf('week'),
      days: this.$moment.weekdays(),
      auxiliaries: [
        {
          _id: '1',
          firstname: 'Cassandra',
          lastname: 'Delajoie'
        },
        {
          _id: '2',
          firstname: 'Alain',
          lastname: 'Deloin'
        }
      ],
      events: [
        {
          type: 'Intervention',
          startDate: this.$moment().toDate(),
          endDate: this.$moment().add(1, 'hour').toDate(),
          auxiliary: {
            _id: '1'
          },
          customer: {
            identity: {
              firstname: 'Madeleine',
              lastname: 'Proust'
            }
          }
        },
        {
          type: 'Intervention',
          startDate: this.$moment().add(1, 'day').toDate(),
          endDate: this.$moment().add(4, 'hour').toDate(),
          auxiliary: {
            _id: '2',
          },
          customer: {
            identity: {
              firstname: 'Mimi',
              lastname: 'Cracra'
            }
          }
        }
      ],
      maxDays: 7
    }
  },
  computed: {
    daysHeader () {
      return this.days.map(day => moment(day).format('dddd DD/MM'));
    }
  },
  mounted () {
    const range = momentRange.range(this.startOfWeek, this.$moment(this.startOfWeek).add(6, 'd'));
    this.days = Array.from(range.by('days'));
  },
  methods: {
    getAuxiliaryEvents (auxiliary, dayIndex) {
      return this.events
        .filter(event => event.auxiliary._id === auxiliary._id)
        .filter(event => moment(event.startDate).isSame(this.days[dayIndex], 'day'));
    }
  }
}
</script>

<style lang="stylus" scoped>

</style>
