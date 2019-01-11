<template>
  <div>
    <table>
      <tr>
        <td></td>
        <td v-for="(day, index) in days" :key="index">
          {{day}}
        </td>
      </tr>
      <tr v-for="(auxiliary, index) in auxiliaries" :key="index">
        <td>
          {{auxiliary.firstname}} {{auxiliary.lastname}}
        </td>
        <td v-for="(day, index) in days" :key="index">
          <div class="row" v-for="(event, index) in getAuxiliaryEvents(auxiliary)" :key="index">
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
          // title: 'Test',
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
          startDate: this.$moment().add(3, 'hours').toDate(),
          endDate: this.$moment().add(4, 'hour').toDate(),
          // title: 'Test',
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
  mounted () {
    const range = momentRange.range(this.startOfWeek, this.$moment(this.startOfWeek).add(6, 'd'));
    this.days = Array.from(range.by('days')).map(day => moment(day).format('dddd DD/MM'));
    // console.log('moment range', test);
  },
  methods: {
    getAuxiliaryEvents (auxiliary) {
      return this.events.filter(event => event.auxiliary._id === auxiliary._id);
    }
  }
}
</script>

<style lang="stylus" scoped>

</style>
