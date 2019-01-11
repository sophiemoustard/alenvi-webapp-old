<template>
  <q-page padding class="neutral-background">
    <p class="input-caption">Communauté</p>
    <ni-select-sector class="q-mb-md" @input="getEmployeesBySector" v-model="selectedSector" />
    <div class="planning-container full-width q-pa-md">
      <table style="width: 100%">
        <tr>
          <td></td>
          <td class="capitalize" v-for="(day, index) in daysHeader" :key="index">
            {{day}}
          </td>
        </tr>
        <tr class="auxiliaries-row" v-for="(auxiliary, index) in auxiliaries" :key="index">
          <td>
            {{auxiliary.firstname}} {{auxiliary.lastname}}
          </td>
          <td v-for="(day, dayIndex) in days" :key="dayIndex" valign="top" class="event-cell">
            <div class="row cursor-pointer" v-for="(event, eventIndex) in getAuxiliaryEvents(auxiliary, dayIndex)" :key="eventIndex" @click="openEditionModal(event)">
              <div class="col-12 event">
                <p class="no-margin">{{ getEventHours(event) }}</p>
                <p class="no-margin">{{ event.customer.identity.title }} {{ event.customer.identity.lastname }}</p>
              </div>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <q-modal v-model="editionModal">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Edition d'un <span class="text-weight-bold">evenement</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span>
              <q-icon name="clear" size="1rem" @click.native="editionModal = false" /></span>
          </div>
        </div>
        <ni-modal-input caption="Type de l'évènement" v-model="editedEvent.type"/>
        <ni-modal-datetime-picker caption="Date de début" v-model="editedEvent.startDate" disable />
        <ni-modal-datetime-picker caption="Date de fin" v-model="editedEvent.endDate" disable />
      </div>
      <q-btn class="full-width modal-btn" no-caps label="Confirmer" color="primary" />
    </q-modal>
  </q-page>
</template>

<script>
import ModalDatetimePicker from '../../components/form/ModalDatetimePicker.vue';
import SelectSector from '../../components/form/SelectSector';
import ModalInput from '../../components/form/ModalInput.vue';

export default {
  components: {
    'ni-modal-datetime-picker': ModalDatetimePicker,
    'ni-modal-input': ModalInput,
    'ni-select-sector': SelectSector,
  },
  data () {
    return {
      selectedSector: '',
      startOfWeek: '',
      days: [],
      auxiliaries: {},
      events: [],
      maxDays: 7,
      editedEvent: {},
      editionModal: false,
    }
  },
  computed: {
    daysHeader () {
      return this.days.map(day => this.$moment(day).format('dddd DD/MM'));
    },
    endOfWeek () {
      return this.$moment(this.startOfWeek).add(6, 'd');
    }
  },
  async mounted () {
    this.startOfWeek = this.$moment().startOf('week');
    await this.getEvents();
    const range = this.$moment.range(this.startOfWeek, this.$moment(this.startOfWeek).add(6, 'd'));
    this.days = Array.from(range.by('days'));
  },
  methods: {
    getAuxiliaryEvents (auxiliary, dayIndex) {
      return this.events
        .filter(event => event.auxiliary._id === auxiliary._id)
        .filter(event => this.$moment(event.startDate).isSame(this.days[dayIndex], 'day'))
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    },
    getEventHours (event) {
      return `${this.$moment(event.startDate).format('HH:mm')} - ${this.$moment(event.endDate).format('HH:mm')}`
    },
    openEditionModal (event) {
      this.editedEvent = event;
      this.editionModal = true
    },
    async getEmployeesBySector () {
      this.auxiliaries = await this.$users.showAllActive({ sector: this.selectedSector });
    },
    async getEvents () {
      try {
        const startDate = this.startOfWeek;
        const endDate = this.endOfWeek;
        this.events = await this.$events.list({ startDate: startDate.format('YYYYMMDD'), endDate: endDate.format('YYYYMMDD') });
      } catch (e) {
        console.error(e);
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  table
    border-collapse: collapse
    table-layout: fixed
  td
    border: 1px solid black
    padding: 5px
  .planning-container
    background: white
  .event
    border: 1px solid black
    padding: 2px
    margin-bottom: 3px
    // &-cell
    //   width: 200px
  .auxiliaries-row
    height: 100px
  .modal
    &-padding
      padding: 24px 58px 0px 58px
    &-btn
      border-radius: 0
</style>
