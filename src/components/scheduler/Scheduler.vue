<template lang="html">
  <div>
    <div ref="scheduler_here" class="dhx_cal_container" style='width:100%; height:100%;'>
      <q-window-resize-observable @resize="onResize" />
      <div class="dhx_cal_navline">
        <div class="dhx_cal_prev_button relative-position" v-ripple>&nbsp;</div>
        <div v-show="displayNext" class="dhx_cal_next_button relative-position" v-ripple>&nbsp;</div>
        <div v-if="!customer" class="dhx_cal_today_button relative-position" v-ripple></div>
        <div class="dhx_cal_date"></div>
        <div v-if="!customer" class="dhx_cal_tab relative-position" v-ripple name="day_tab" style="right:204px;"></div>
        <div v-if="!customer" class="dhx_cal_tab relative-position" v-ripple name="week_tab" style="right:140px;"></div>
        <div v-if="!customer" class="dhx_cal_tab relative-position" v-ripple name="month_tab" style="right:76px;"></div>
        <div v-show="showTab" class="dhx_cal_tab relative-position" v-ripple name="customer_week_tab" style="right:140px;"></div>
      </div>
      <div class="dhx_cal_header"></div>
      <div class="dhx_cal_data"></div>
    </div>
    <q-modal v-model="getOpenModal" minimized :content-css="modalStyle">
      <!-- <div class="row justify-center">
      <q-field class="col-xs-12 col-sm-6">
        <q-input
        v-model="customerCodes.interCode"
        float-label="Code interphone"
        type="textarea"
        :min-rows="1"
        :disable="disable">
        </q-input>
      </q-field>
    </div> -->
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
          :disable="disableInput" />
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
import responsive from './scripts/dhtmlxscheduler-responsive.js';

import { debounce, QWindowResizeObservable, QBtn, QModal, QInput, QField, QSelect, QDatetimeRange, Ripple } from 'quasar'
import { mapGetters, mapMutations } from 'vuex'

const configDhtmlxScheduler = (vm) => {
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

  // let lightboxSections = [];
  // if (vm.$route.query.id_employee && vm.$route.query.self === 'true') {
  //   scheduler.config.readonly_form = false;
  //   const pathologyOpts = [
  //     { key: '-', label: '-' },
  //     { key: 'Alzheimer', label: 'Alzheimer' },
  //     { key: 'Parkinson', label: 'Parkinson' },
  //     { key: 'Corps de Lewy', label: 'Corps de Lewy' },
  //     { key: 'Autres troubles cognitifs', label: 'Autres troubles cognitifs' },
  //     { key: 'AVC récent', label: 'AVC récent' },
  //     { key: 'Autre', label: 'Autre' }
  //   ];
  //   lightboxSections = [
  //     {
  //       name: 'Pathologie',
  //       height: 20,
  //       map_to: 'pathology',
  //       type: 'select',
  //       options: pathologyOpts
  //     },
  //     {
  //       name: 'Details',
  //       height: 200,
  //       map_to: 'interventionDetail',
  //       type: 'textarea'
  //     },
  //     {
  //       name: 'Autres',
  //       height: 100,
  //       map_to: 'misc',
  //       type: 'textarea'
  //     },
  //     {
  //       name: 'Commentaires',
  //       height: 75,
  //       map_to: 'comments',
  //       type: 'textarea'
  //     },
  //     {
  //       name: 'Horaires',
  //       height: 75,
  //       map_to: 'auto',
  //       type: 'time'
  //     }
  //   ];
  // } else if (vm.$route.query.id_employee && vm.$route.query.self === 'false') {
  //   scheduler.config.readonly_form = true;
  //   lightboxSections = [
  //     {
  //       name: 'Pathologie',
  //       height: 20,
  //       map_to: 'pathology',
  //       type: 'textarea'
  //     },
  //     {
  //       name: 'Details',
  //       height: 200,
  //       map_to: 'interventionDetail',
  //       type: 'textarea'
  //     },
  //     {
  //       name: 'Autres',
  //       height: 100,
  //       map_to: 'misc',
  //       type: 'textarea'
  //     },
  //     {
  //       name: 'Commentaires',
  //       height: 200,
  //       map_to: 'comments',
  //       type: 'textarea'
  //     }
  //   ];
  // } else {
  //   scheduler.config.readonly_form = true;
  //   lightboxSections = [];
  // }
  // scheduler.config.lightbox.sections = lightboxSections;
}

export default {
  components: {
    QWindowResizeObservable,
    QBtn,
    QModal,
    QInput,
    QField,
    QSelect,
    QDatetimeRange
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
          end_date: ''
        }]
      }
    },
    customer: {
      type: Boolean
    },
    showTab: {
      type: Boolean
    }
  },
  data () {
    return {
      width: '',
      height: '',
      today: new Date(),
      displayNext: true,
      disable: true,
      modal: false,
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
      'disableInput'
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
      scheduler.templates.day_scale_date = date => `<div>${scheduler.date.date_to_str('%D')(date)}.</div><big>${scheduler.date.date_to_str('%j')(date)}</big>`;
      scheduler.templates.day_date = date => scheduler.date.date_to_str('%F %Y')(date);
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
      // scheduler.templates.customer_week_date = scheduler.templates.week_date;
      scheduler.templates.customer_week_scale_date = scheduler.templates.week_scale_date;
      scheduler.date.add_customer_week = (date, inc) => scheduler.date.add(date, inc * 7, 'day');
      // scheduler.date.add_customer_week = scheduler.date.add_week;
      // custom color events
      scheduler.templates.event_class = function (start, end, event) {
        if (event.type === 'alenvi') {
          return 'alenvi_event';
        } else if (event.type === 'alenvi_past') {
          return 'alenvi_past_event';
        }
      }
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

    responsive.initResponsive(scheduler);

    // Scheduler initialization
    const defaultView = this.customer ? 'customer_week' : 'week'
    scheduler.init(this.$refs.scheduler_here, this.today, defaultView);

    // Scheduler data parser
    scheduler.parse(this.$props.events, 'json');
    // Prevent draggable events
    // scheduler.attachEvent('onEventDrag', this.blockReadOnly);
    scheduler.showLightbox = (id) => {
      const ev = scheduler.getEvent(id);
      this.setDisableInput(true);
      this.customerEventInfo.doorCode = ev.door_code;
      this.customerEventInfo.interCode = ev.intercom_code;
      this.customerEventInfo.pathology = ev.pathology;
      this.customerEventInfo.comments = ev.comments;
      this.customerEventInfo.interventionDetail = ev.interventionDetail;
      this.customerEventInfo.misc = ev.misc;
      this.customerEventInfo.eventRange.from = moment(ev.start_date, 'YYYY-MM-DD HH:mm').toDate();
      this.customerEventInfo.eventRange.to = moment(ev.end_date, 'YYYY-MM-DD HH:mm').toDate();
      this.customerEventInfo.eventEmployeeId = ev.id_employee;
      this.customerEventInfo.eventType = ev.type;
      this.customerEventInfo.eventId = ev.id;
      this.customerEventInfo.eventTitle = `${ev.text} ${moment(ev.start_date, 'YYYY-MM-DD HH:mm').format('HH:mm')} - ${moment(ev.end_date, 'YYYY-MM-DD HH:mm').format('HH:mm')}`
      this.controlModal(true);
      if (this.$route.query.id_employee === ev.id_employee && ev.type !== 'alenvi_past') {
        this.setDisableInput(false);
      }
    };
    scheduler.attachEvent('onClick', (id, e) => {
      if (this.customer) {
        return true;
      }
      scheduler.showLightbox(id);
    });
    // scheduler.attachEvent('onEventChanged', (id, e) => {
    //   this.$emit('eventUpdated', e);
    // });
    // // Remove date picker from lightbox, just keeping hour picker
    // if (this.$route.query.id_employee && this.$route.query.self === 'true') {
    //   scheduler.attachEvent('onBeforeLightBox', () => {
    //     const node = scheduler.formSection('Horaires').node;
    //     const timeInputs = node.getElementsByTagName('select');
    //     for (let i = 0, l = timeInputs.length; i < l; i++) {
    //       if (i > 0 && i !== 4) {
    //         timeInputs[i].style.display = 'none';// remove inputs
    //       }
    //     }
    //     return true;
    //   });
    // }
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
    onResize (size) {
      this.width = size.width;
      this.height = size.height;
    },
    updateEvent (event, done) { // 'event' & 'done' are parameters given by Quasar when using 'loader' prop with q-btn 
      const ev = scheduler.getEvent(this.customerEventInfo.eventId);
      ev.door_code = this.customerEventInfo.doorCode;
      ev.intercom_code = this.customerEventInfo.interCode;
      ev.pathology = this.customerEventInfo.pathology;
      ev.comments = this.customerEventInfo.comments;
      ev.interventionDetail = this.customerEventInfo.interventionDetail;
      ev.misc = this.customerEventInfo.misc;
      ev.start_date = moment(this.customerEventInfo.eventRange.from).format('YYYY-MM-DD HH:mm')
      ev.end_date = moment(this.customerEventInfo.eventRange.to).format('YYYY-MM-DD HH:mm')
      // Sending data to child component (no need of vuex)
      this.$emit('progressDone', done);
      this.$emit('eventUpdated', ev);
      // Renders immediately the updated event in calendar
      scheduler.updateEvent(ev.id);
      scheduler.setCurrentView();
    },
    ...mapMutations([
      'setDisableInput',
      'controlModal'
    ])
  },
  created () {
    window.addEventListener('scroll', this.handleScroll);
  },
  destroyed () {
    window.removeEventListener('scroll', this.handleScroll);
  }
}
</script>

<style lang="stylus">
  @import '~variables'
  @import "~dhtmlx-scheduler/codebase/dhtmlxscheduler.css";
  @import "~dhtmlx-scheduler/codebase/dhtmlxscheduler_flat.css";
  @import "../../assets/dhtmlxscheduler-responsive.css";

  .dhx_scale_hour
    border-bottom: none
    overflow: visible

  .dhx_cal_data
    overflow-y: visible
    overflow-x: visible
    border-top: none
    /*padding-top: 10px;*/

  .dhx_cal_header div div
    border: none
  
  .dhx_scale_bar
    line-height: 20px
    // position: fixed
  
  .dhx_scale_holder
    background-image: url("../../assets/databg_custom.png")

  .dhx_scale_holder_now
    background-image: url("../../assets/databg_now_custom.png")
  
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
    background: url("../../assets/chevron-left.png") no-repeat center center
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
    background: url("../../assets/chevron-right.png") no-repeat center center
    &:hover
      background-color: rgba(0, 0, 0, .07)

  .dhx_cancel_btn_set
    background-color: $primary
  
  // .header-fixed
    // position: fixed
    // top: 0px !important
  
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

</style>
