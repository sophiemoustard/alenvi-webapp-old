<template>
  <div>
    <div ref="scheduler_here" class="dhx_cal_container" style='width:100%; height:100%;'>
      <!-- <q-window-resize-observable @resize="onResize" /> -->
      <q-resize-observable @resize="onResize" />
      <div ref="cal_navline" class="dhx_cal_navline">
        <div class="dhx_cal_prev_button relative-position" v-ripple>&nbsp;</div>
        <div v-show="displayNext" class="dhx_cal_next_button relative-position" v-ripple>&nbsp;</div>
        <div v-if="!customer" class="dhx_cal_today_button relative-position" v-ripple></div>
        <div class="dhx_cal_date"></div>
        <!-- <div v-if="!customer" class="dhx_cal_tab relative-position" v-ripple name="day_tab" style="right:204px;"></div> -->
        <div v-show="!customer" class="dhx_cal_tab relative-position" v-ripple name="three_days_tab" style="left:200px;"></div>
        <div v-if="!customer" class="dhx_cal_tab relative-position" v-ripple name="week_tab" style="right:140px;"></div>
        <div v-if="!customer" class="dhx_cal_tab relative-position" v-ripple name="month_tab" style="right:76px;"></div>
        <div v-show="showTabCustomer" class="dhx_cal_tab relative-position" v-ripple name="customer_week_tab" style="right:140px;"></div>
        <div v-show="showTabFilter && !$route.query.id_customer" class="dhx_cal_tab relative-position" name="filter_tab" @click="displayFilter" v-ripple style="left: 230px;">
          <sector-filter v-if="ogustUser" @auxiliariesChosen="applyFilter" />
        </div>
      </div>
      <div class="dhx_cal_header"></div>
      <div class="dhx_cal_data"></div>
    </div>

    <q-modal v-model="getOpenModal" minimized :content-css="modalStyle">
      <p class="caption">{{ customerEventInfo.eventTitle }}</p>
      <q-field>
        <q-input v-model="customerEventInfo.doorCode" float-label="Code Porte" type="textarea" :min-rows="1" :disable="disableInput">
        </q-input>
      </q-field>
      <q-field>
        <q-input v-model="customerEventInfo.interCode" float-label="Code interphone" type="textarea" :min-rows="1" :disable="disableInput">
        </q-input>
      </q-field>
      <q-field>
        <q-select v-model="customerEventInfo.pathology" float-label="Pathologie" :options="selectOptions" :disable="disableInput"></q-select>
      </q-field>
      <q-field>
        <q-input v-model="customerEventInfo.comments" float-label="Commentaires" type="textarea" :min-rows="4" :disable="disableInput">
        </q-input>
      </q-field>
      <q-field>
        <q-input v-model="customerEventInfo.interventionDetails" float-label="Détails intervention" type="textarea" :min-rows="4"
          :disable="disableInput">
        </q-input>
      </q-field>
      <q-field>
        <q-input v-model="customerEventInfo.misc" float-label="Autres" type="textarea" :min-rows="4" :disable="disableInput">
        </q-input>
      </q-field>
      <q-field label="Horaires">
        <q-datetime-range type="time" format24h clear-label="Effacer" ok-label="OK" cancel-label="Annuler" v-model="customerEventInfo.eventRange"
          :disable="disableTimePicker" />
      </q-field>
      <div class="row justify-end">
        <q-btn loader v-if="$route.query.id_employee === customerEventInfo.eventEmployeeId" @click="updateEvent" class="on-left" color="primary"
          :disable="disableInput">
          Enregistrer
        </q-btn>
        <q-btn color="tertiary" @click="controlModal(false)">
          Fermer
        </q-btn>
      </div>
    </q-modal>
  </div>
</template>

<script>
import moment from 'moment';
import 'dhtmlx-scheduler'
import 'dhtmlx-scheduler/codebase/locale/locale_fr';
import 'dhtmlx-scheduler/codebase/ext/dhtmlxscheduler_readonly.js';
import 'dhtmlx-scheduler/codebase/ext/dhtmlxscheduler_container_autoresize.js';
import 'dhtmlx-scheduler/codebase/ext/dhtmlxscheduler_limit.js';
import responsive from './scripts/dhtmlxscheduler-responsive.js';

import {
  debounce,
  QWindowResizeObservable,
  QResizeObservable,
  QBtn,
  QModal,
  QInput,
  QField,
  QSelect,
  QDatetimeRange,
  Ripple,
  Toast } from 'quasar'
import { mapGetters, mapMutations } from 'vuex'

import SectorFilter from '../dashboard/SectorFilter.vue'

const configDhtmlxScheduler = (vm) => {
  // config line mark of current time
  scheduler.config.mark_now = true;
  // Event date format
  scheduler.config.xml_date = '%Y-%m-%d %H:%i';
  // Blocking hours
  scheduler.config.first_hour = 8;
  scheduler.config.last_hour = 24;
  // disable double click
  scheduler.config.dblclick_create = false;
  scheduler.config.drag_resize = false;
  scheduler.config.drag_move = false;
  // scheduler.config.touch_tip = false;
  // disable left buttons on lightbox
  scheduler.config.buttons_left = [];
  // enable cancel button on lightbox's right wing
  scheduler.config.buttons_right = ['dhx_cancel_btn', 'dhx_save_btn'];
  // changing cancel button label
  scheduler.locale.labels['icon_cancel'] = 'Fermer';
  // custom view label
  scheduler.locale.labels['customer_week_tab'] = 'Semaine';
  scheduler.locale.labels['three_days_tab'] = '3 jours';
  // hide lightbox in month view
  scheduler.config.show_loading = true;
  // hide select bar in day and week views
  scheduler.config.select = false;
  scheduler.config.touch_tip = false;
  // scheduler.config.hour_size_px = 60;
  scheduler.xy.scale_height = 25;
  // time step in lightbox
  scheduler.config.time_step = 15;
  // limit time in time picker dropdown in lightbox
  scheduler.config.limit_time_select = true;

  scheduler.xy.scale_height = 45;
}

export default {
  components: {
    QWindowResizeObservable,
    QResizeObservable,
    QBtn,
    QModal,
    QInput,
    QField,
    QSelect,
    QDatetimeRange,
    SectorFilter
  },
  directives: {
    Ripple
  },
  name: 'scheduler',
  props: {
    events: {
      type: Array,
      default () {
        return [{
          id: '',
          text: '',
          start_date: '',
          end_date: '',
          id_employee: '',
          type: '',
          id_customer: '',
          door_code: '',
          intercom_code: '',
          pathology: '',
          comments: '',
          interventionDetails: '',
          misc: '',
          readonly: ''
        }]
      }
    },
    customer: {
      type: Boolean
    },
    showTabCustomer: {
      type: Boolean
    },
    showTabFilter: {
      type: Boolean
    }
  },
  data () {
    return {
      width: '',
      height: '',
      today: new Date(),
      displayNext: true,
      childEvents: this.events,
      customerCodes: {
        doorCode: '',
        interCode: ''
      },
      customerEventInfo: {
        eventTitle: '',
        pathology: '',
        comments: '',
        interventionDetails: '',
        misc: '',
        doorCode: '',
        interCode: '',
        eventEmployeeId: '',
        eventRange: {
          from: null,
          to: null
        },
        eventType: '',
        eventId: ''
      },
      selectOptions: [
        {
          label: '-',
          value: '-'
        },
        {
          label: 'Alzheimer',
          value: 'Alzheimer'
        },
        {
          label: 'Parkinson',
          value: 'Parkinson'
        },
        {
          label: 'Corps de Lewy',
          value: 'Corps de Lewy'
        },
        {
          label: 'Autres troubles cognitifs',
          value: 'Autres troubles cognitifs'
        },
        {
          label: 'AVC récent',
          value: 'AVC récent'
        },
        {
          label: 'Autre',
          value: 'Autre'
        }
      ]
    }
  },
  computed: {
    modalStyle () {
      const style = {
        padding: '20px',
        minWidth: '70vw',
        minHeight: '80vh'
      };
      if (this.$q.platform.is.mobile) {
        style.minWidth = '100vw';
        return style;
      }
      return style;
    },
    getOpenModal: {
      get () {
        return this.$store.state.openModal;
      },
      set (value) {
        this.$store.commit('controlModal', value);
      }
    },
    ...mapGetters([
      'disableInput',
      'disableTimePicker',
      'showFilter',
      'ogustUser',
      'auxiliariesChosen'
    ])
  },
  mounted () {
    // prevent quasar from breaking open/close methods from modal
    this.controlModal(false);

    configDhtmlxScheduler(this);

    scheduler.attachEvent('onTemplatesReady', () => {
      // Custom week_date header format (week standard view)
      scheduler.templates.week_date = (start, end) => `${scheduler.date.date_to_str('%j %F')(start)} &ndash; ${scheduler.date.date_to_str('%j %F')(scheduler.date.add(end, -1, 'day'))}`;
      // Custom day_scale format (day standard view)
      // scheduler.templates.day_scale_date = date => `<div>${scheduler.date.date_to_str('%D')(date)}.</div><big>${scheduler.date.date_to_str('%j')(date)}</big>`;
      // scheduler.templates.day_date = date => scheduler.date.date_to_str('%F %Y')(date);
      // Custom month_scale format (month standard view)
      scheduler.templates.month_scale_date = date => scheduler.date.date_to_str('%l')(date);
      // Custom week_scale format (week standard view)
      scheduler.templates.week_scale_date = date => `<div>${scheduler.date.date_to_str('%D')(date)}.</div><big>${scheduler.date.date_to_str('%j')(date)}</big>`;
      // Custom hour_scale format (standard view)
      scheduler.templates.hour_scale = function (date) {
        const format = scheduler.date.date_to_str('%H:%i');
        return "<div style='height:44px;line-height:0px'>" + format(date) + '</div>';
      }

      // custom 'customer_week' view
      // scheduler.date.customer_week_start = date => scheduler.date.date_part(new Date(date.valueOf()));
      scheduler.date.customer_week_start = date => scheduler.date.week_start(date);
      scheduler.templates.customer_week_date = scheduler.templates.week_date;
      scheduler.templates.customer_week_scale_date = scheduler.templates.week_scale_date;
      scheduler.date.add_customer_week = (date, inc) => scheduler.date.add(date, inc * 7, 'day');
      // scheduler.date.add_customer_week = scheduler.date.add_week;

      // custom 'customer_three_days' view
      scheduler.date.three_days_start = date => scheduler.date.date_part(new Date(date.valueOf()));
      scheduler.date.three_days_end = startDate => scheduler.date.add(startDate, 3, 'day');
      scheduler.templates.three_days_date = (start, end) => `${scheduler.date.date_to_str('%j %F')(start)} &ndash; ${scheduler.date.date_to_str('%j %F')(scheduler.date.add(end, -1, 'day'))}`;
      scheduler.templates.three_days_scale_date = scheduler.templates.week_scale_date;
      scheduler.date.add_three_days = (date, inc) => scheduler.date.add(date, inc * 3, 'day');

      // custom color events
      scheduler.templates.event_class = function (start, end, event) {
        if (event.type === 'alenvi') {
          return 'alenvi_event';
        } else if (event.type === 'alenvi_past') {
          return 'alenvi_past_event';
        }
      }
    });

    scheduler.attachEvent('onBeforeViewChange', (oldMode, oldDate, mode, date) => {
      if (mode === 'filter') {
        return false;
      }
      return true;
    });

    // when clicking on prev and next buttons
    scheduler.attachEvent('onViewChange', (newMode, newDate) => {
      this.$emit('viewChanged');
      const todayAddOneWeek = moment(this.today).startOf('week').add(1, 'week');
      this.displayNext = true;
      if (this.customer && newMode === 'customer_week' && moment(newDate).isSame(todayAddOneWeek)) {
        this.displayNext = false;
        return false;
      }
      return true;
    });

    // scheduler.addMarkedTimespan({
    //   start_date: new Date(),
    //   // end_date: scheduler.date.add(date, 2, 'hour'),
    //   type: 'dhx_time_block'
    // });

    responsive.initResponsive(scheduler);

    // Scheduler initialization
    let defaultView = '';
    if (this.$q.platform.is.mobile && this.customer) {
      defaultView = 'three_days';
    } else if (this.customer) {
      defaultView = 'customer_week';
    } else {
      defaultView = 'week';
    }
    scheduler.init(this.$refs.scheduler_here, this.today, defaultView);

    // Scheduler data parser
    scheduler.parse(this.childEvents, 'json');

    // Prevent draggable events
    // scheduler.attachEvent('onEventDrag', this.blockReadOnly);
    scheduler.showLightbox = (id) => {
      const ev = scheduler.getEvent(id);
      // console.log('EV', ev);
      this.setDisableInput(true);
      this.setDisableTimePicker(true);
      this.customerEventInfo.doorCode = ev.door_code;
      this.customerEventInfo.interCode = ev.intercom_code;
      this.customerEventInfo.pathology = ev.pathology;
      this.customerEventInfo.comments = ev.comments;
      this.customerEventInfo.interventionDetails = ev.interventionDetails;
      this.customerEventInfo.misc = ev.misc;
      this.customerEventInfo.eventRange.from = moment(ev.start_date, 'YYYY-MM-DD HH:mm').toDate();
      this.customerEventInfo.eventRange.to = moment(ev.end_date, 'YYYY-MM-DD HH:mm').toDate();
      this.customerEventInfo.eventEmployeeId = ev.id_employee;
      this.customerEventInfo.eventType = ev.type;
      this.customerEventInfo.eventId = ev.id;
      this.customerEventInfo.eventTitle = `${ev.text} ${moment(ev.start_date, 'YYYY-MM-DD HH:mm').format('HH:mm')} - ${moment(ev.end_date, 'YYYY-MM-DD HH:mm').format('HH:mm')}`
      this.setDisableInput(false);
      this.controlModal(true);
      if (this.$route.query.id_employee === ev.id_employee && ev.type !== 'alenvi_past') {
        this.setDisableTimePicker(false);
      }
    };
    scheduler.attachEvent('onClick', (id, e) => {
      if (this.customer) {
        return true;
      }
      scheduler.showLightbox(id);
    });
    // prevent opening event when double clicking
    scheduler.attachEvent('onDblClick', () => false);
  },
  methods: {
    handleScroll: debounce(function () {
      const headerToFix = document.getElementsByClassName('dhx_cal_header')[0];
      let currentScroll = window.pageYOffset;
      if (currentScroll >= 60 && this.width >= 768) {
        headerToFix.classList.add('header-fixed');
      } else if (currentScroll >= 131 && this.width < 768) {
        headerToFix.classList.add('header-fixed');
      } else {
        headerToFix.classList.remove('header-fixed');
      }
    }, 10),
    onResize: debounce(() => {
      scheduler.updateView();
      // this.width = size.width;
      // this.height = size.height;
    }, 500),
    updateEvent (event, done) { // 'event' & 'done' are parameters given by Quasar when using 'loader' prop with q-btn
      try {
        const ev = scheduler.getEvent(this.customerEventInfo.eventId);
        ev.door_code = this.customerEventInfo.doorCode;
        ev.intercom_code = this.customerEventInfo.interCode;
        ev.pathology = this.customerEventInfo.pathology;
        ev.comments = this.customerEventInfo.comments;
        ev.interventionDetails = this.customerEventInfo.interventionDetails;
        ev.misc = this.customerEventInfo.misc;
        ev.start_date = this.customerEventInfo.eventRange.from;
        ev.end_date = this.customerEventInfo.eventRange.to;
        // Sending data to child component (no need of vuex)
        this.$emit('progressDone', done);
        this.$emit('eventUpdated', ev);
      } catch (e) {
        console.error(e);
        Toast.create("Erreur lors de l'enregistrement");
        done();
      }
    },
    ...mapMutations([
      'setDisableInput',
      'setDisableTimePicker',
      'controlModal'
    ]),
    displayFilter () {
      this.$store.commit('toggleFilter', !this.showFilter)
    },
    applyFilter () {
      // scheduler.filter_week = (id, event) => {
      // console.log(id);
      // console.log(this.auxiliariesChosen.indexOf(event.id_employee));
      //   this.$emit('applyFilter');
      //   if (this.auxiliariesChosen && this.auxiliariesChosen.indexOf(event.id_employee) !== -1) {
      //     return true;
      //   }
      //   return false;
      // }
      scheduler.filter_day = scheduler.filter_month = scheduler.filter_week = (id, event) => {
        if (this.auxiliariesChosen && this.auxiliariesChosen === event.id_employee) {
          return true;
        }
        return false;
      }
      this.$emit('applyFilter');
    }
  }
  // NOT SUPPORTED BY FIREFOX
  // created () {
  //   window.addEventListener('scroll', this.handleScroll);
  // },
  // destroyed () {
  //   window.removeEventListener('scroll', this.handleScroll);
  // }
}
</script>

<style lang="stylus">
  @import '~variables'
  @import "~dhtmlx-scheduler/codebase/dhtmlxscheduler.css";
  @import "~dhtmlx-scheduler/codebase/dhtmlxscheduler_flat.css";
  @import "~assets/dhtmlxscheduler-responsive.css";

  .dhx_scale_hour
    border-bottom: none
    overflow: visible

  .dhx_cal_data
    overflow-y: visible
    overflow-x: visible
    border-top: none
    /*padding-top: 10px;*/
  
  // .dhx_cal_header
  //   position: fixed
  //   background: white

  .dhx_cal_header div div
    border: none
  
  .dhx_scale_bar
    line-height: 20px
    // position: fixed
  
  .dhx_scale_holder
    background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAsCAIAAAArRUU2AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAB3RJTUUH4gEREC41Aw9nHAAAABZJREFUCNdj+P//PxMDA8OQwOfPnwcAKy4FwcX82PUAAAAASUVORK5CYII=')

  .dhx_scale_holder_now
    background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAsCAIAAAArRUU2AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAB3RJTUUH4gEREDIsgROSgQAAABZJREFUCNdj+P95IRMDA8OQwOcvPgQA44cFa6kqCcUAAAAASUVORK5CYII=')
  
  .dhx_cal_navline.dhx_cal_date
    color: $tertiary

  .dhx_cal_tab
    color: $tertiary
    background-color: none
    &:hover
      text-decoration: none
      background-color: rgba(0, 0, 0, .07)
  
  .dhx_cal_tab.active
    background-color: rgba(0, 0, 0, .07)
    color: $tertiary
    font-weight: 700
    &:hover
      background-color: rgba(0, 0, 0, .1)

  
  .dhx_cal_today_button
    color: $tertiary
    &:hover
      text-decoration: none
      background-color: rgba(0, 0, 0, .07)
  
  .dhx_cal_prev_button
    width: 30px
    border-radius: 50%
    background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAZiS0dEAAAAAAAA+UO7fwAAAAlwSFlzAAAASAAAAEgARslrPgAAAORJREFUSMft1T8KwjAUBvAvcRI8jFtbOviHHkDwJIXuegGbHsFTiIODi2nOIG46OIirLk1dOog45CURHPJtGV5+PHi8B4SEhPxT8jwfUWt6rmhRFEvG2DpJkn5d1zvTOuaKtm276J5nrfVQCHE3qeWe0IvWemqKWnf8BZ0IIU6UP8iwD5QM+0IBwlR/oNemabKqqo42KEAbroct4tSxlPKQpukTQAZgwDmfR1G0UUrdfgr7xsmbyxdutTJ94Na7usMZgHGHz+I4XiuljIbQ6UhIKfdvna/Ksty6/EeOzVkMCQnxlhck2ouoK+MN0AAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxOC0wMS0xOFQxMDowNzoxMyswMDowMGL8TZcAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTgtMDEtMThUMTA6MDc6MTMrMDA6MDATofUrAAAAKHRFWHRzdmc6YmFzZS11cmkAZmlsZTovLy90bXAvbWFnaWNrLU5Td0Y1d0NE+kVb4wAAAABJRU5ErkJggg==') no-repeat center center
    &:hover
      background-color: rgba(0, 0, 0, .07)
  
  .dhx_cal_event .dhx_footer
    background: none
    &:hover
      background: none
  
  .dhx_cal_event:hover .dhx_footer
    background: none
  
  .dhx_cal_next_button
    width: 30px
    border-radius: 50%
    background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAZiS0dEAAAAAAAA+UO7fwAAAAlwSFlzAAAASAAAAEgARslrPgAAAPRJREFUSMft1aFOxDAcgPHvP2YwQLBonmFbdwkYPAlP0mTzuwfYPO6egIA4dwmotbwNqHMrhplT164Hpp9s2v7SihZSqdR/pbW+i7HPmc/kpmk6EdlUVXVujNn9Cay1vhaRZ+BSRFZ1Xcs4jh8nh621e6XUC/AIXAH3S07uddXGmG+l1OuMi8gqFPeCZ7woircsyxbh3jCAtfZrKR4Ez3hZllsReQIufPEsFAbI81wOhvbHrpVjJx7Wtu3tNE3vwA2Ac64bhmF9UngpGgTHQL3hWCh4PpnA54yKyLrv+yDUC/59MnPgwTnXLUGDivUtplKpaP0Awbh4tLAnJEMAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTgtMDEtMThUMTA6MDc6NTArMDA6MDDXXlnwAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE4LTAxLTE4VDEwOjA3OjUwKzAwOjAwpgPhTAAAACh0RVh0c3ZnOmJhc2UtdXJpAGZpbGU6Ly8vdG1wL21hZ2ljay1icU1SUGdGMAb+9OcAAAAASUVORK5CYII=') no-repeat center center
    &:hover
      background-color: rgba(0, 0, 0, .07)

  .dhx_cancel_btn_set
    background-color: $primary
  
  .header-fixed
    position: fixed
    top: 60px !important
  
  .alenvi_event div 
    background-color: $primary !important;
    color: white !important;

  .dhx_cal_event_line.alenvi_event 
    background-color: $primary !important;
    color: white !important;

  .dhx_cal_event_clear.alenvi_event 
    background-color: $primary !important;
    color: white !important;
  
  .alenvi_past_event div 
    background-color: $primary-light !important;
    color: white !important;

  .dhx_cal_event_line.alenvi_past_event 
    background-color: $primary-light !important;
    color: white !important;

  .dhx_cal_event_clear.alenvi_past_event 
    background-color: $primary-light !important;
    color: white !important;
  
  .responsive-container
    width: 100% !important

</style>
