<template lang="html">
  <div ref="scheduler_here" class="dhx_cal_container" style='width:100%; height:100%;'>
    <q-window-resize-observable @resize="onResize" />
    <div class="dhx_cal_navline">
      <div v-if="!customer" class="dhx_cal_prev_button"><q-btn round icon="keyboard arrow left" color="primary" big flat /></div>
      <div v-if="!customer" class="dhx_cal_next_button"><q-btn icon="keyboard arrow right" color="primary" big flat /></div>
      <div v-if="!customer" class="dhx_cal_today_button"></div>
      <div class="dhx_cal_date"></div>
      <div v-if="!customer" class="dhx_cal_tab" name="day_tab" style="right:204px;"></div>
      <div v-if="!customer" class="dhx_cal_tab" name="week_tab" style="right:140px;"></div>
      <div v-if="!customer" class="dhx_cal_tab" name="month_tab" style="right:76px;"></div>
      <div v-show="showTab" class="dhx_cal_tab" name="customer_week_tab" style="right:200px;"></div>
    </div>
    <div class="dhx_cal_header"></div>
    <div class="dhx_cal_data"></div>
  </div>
</template>

<script>
import moment from 'moment';
import 'dhtmlx-scheduler'
import 'dhtmlx-scheduler/codebase/locale/locale_fr';
import 'dhtmlx-scheduler/codebase/ext/dhtmlxscheduler_readonly.js';
import 'dhtmlx-scheduler/codebase/ext/dhtmlxscheduler_container_autoresize.js';
import responsive from './scripts/dhtmlxscheduler-responsive.js';

import { debounce, QWindowResizeObservable, QBtn } from 'quasar'

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
  scheduler.locale.labels['customer_week_tab'] = 'Vue bénéficiaire';
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

  let lightboxSections = [];
  if (vm.$route.query.id_employee && vm.$route.query.self === 'true') {
    scheduler.config.readonly_form = false;
    const pathologyOpts = [
      { key: '-', label: '-' },
      { key: 'Alzheimer', label: 'Alzheimer' },
      { key: 'Parkinson', label: 'Parkinson' },
      { key: 'Corps de Lewy', label: 'Corps de Lewy' },
      { key: 'Autres troubles cognitifs', label: 'Autres troubles cognitifs' },
      { key: 'AVC récent', label: 'AVC récent' },
      { key: 'Autre', label: 'Autre' }
    ];
    lightboxSections = [
      {
        name: 'Pathologie',
        height: 20,
        map_to: 'pathology',
        type: 'select',
        options: pathologyOpts
      },
      {
        name: 'Details',
        height: 200,
        map_to: 'interventionDetail',
        type: 'textarea'
      },
      {
        name: 'Autres',
        height: 100,
        map_to: 'misc',
        type: 'textarea'
      },
      {
        name: 'Commentaires',
        height: 75,
        map_to: 'comments',
        type: 'textarea'
      },
      {
        name: 'Horaires',
        height: 75,
        map_to: 'auto',
        type: 'time'
      }
    ];
  } else if (vm.$route.query.id_employee && vm.$route.query.self === 'false') {
    scheduler.config.readonly_form = true;
    lightboxSections = [
      {
        name: 'Pathologie',
        height: 20,
        map_to: 'pathology',
        type: 'textarea'
      },
      {
        name: 'Details',
        height: 200,
        map_to: 'interventionDetail',
        type: 'textarea'
      },
      {
        name: 'Autres',
        height: 100,
        map_to: 'misc',
        type: 'textarea'
      },
      {
        name: 'Commentaires',
        height: 200,
        map_to: 'comments',
        type: 'textarea'
      }
    ];
  } else {
    scheduler.config.readonly_form = true;
    lightboxSections = [];
  }
  scheduler.config.lightbox.sections = lightboxSections;
}

export default {
  components: {
    QWindowResizeObservable,
    QBtn
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
      height: ''
    }
  },
  mounted () {
    configDhtmlxScheduler(this);

    scheduler.attachEvent('onTemplatesReady', () => {
      // custom view
      scheduler.date.customer_week_start = date => scheduler.date.date_part(new Date(date.valueOf()));
      scheduler.templates.customer_week_date = (start, end) => `${scheduler.date.date_to_str('%j %F')(start)} &ndash; ${scheduler.date.date_to_str('%j %F')(scheduler.date.add(end,-1,"day"))}`;
      scheduler.templates.customer_week_scale_date = date => scheduler.date.date_to_str('%l %j')(date);
      scheduler.date.add_customer_week = (date, inc) => scheduler.date.add(date, inc * 7, 'day');
    });
    // standard views
    scheduler.templates.day_scale_date = date => scheduler.date.date_to_str('%l %j')(date);
    scheduler.templates.month_scale_date = date => scheduler.date.date_to_str('%l')(date);
    scheduler.templates.hour_scale = function (date) {
      const format = scheduler.date.date_to_str('%H:%i');
      return "<div style='height:44px;line-height:0px'>" + format(date) + '</div>';
    }
    // when clicking on prev and next buttons
    scheduler.attachEvent('onViewChange', () => {
      this.$emit('viewChanged');
    })

    // scheduler.templates.week_scale_date = date => scheduler.date.date_to_str('%l %j')(date);

    responsive.initResponsive(scheduler);

    // Scheduler initialization
    const defaultView = this.customer ? 'customer_week' : 'week'
    scheduler.init(this.$refs.scheduler_here, new Date(), defaultView);
    scheduler.templates.event_class = function (start, end, event) {
      if (event.type == 'alenvi') {
        return 'alenvi_event'
      }
    }
    // Scheduler data parser
    scheduler.parse(this.$props.events, 'json');
    // Prevent draggable events
    // scheduler.attachEvent('onEventDrag', this.blockReadOnly);
    scheduler.attachEvent('onClick', function (id, e) {
      scheduler.showLightbox(id);
    });
    scheduler.attachEvent('onEventChanged', (id, e) => {
      this.$emit('eventUpdated', e);
    });
    // Remove date picker from lightbox, just keeping hour picker
    if (this.$route.query.id_employee && this.$route.query.self === 'true') {
      scheduler.attachEvent('onBeforeLightBox', () => {
        const node = scheduler.formSection('Horaires').node;
        const timeInputs = node.getElementsByTagName('select');
        for (let i = 0, l = timeInputs.length; i < l; i++) {
          if (i > 0 && i !== 4) {
            timeInputs[i].style.display = 'none';// remove inputs
          }
        }
        return true;
      });
    }
  },
  methods: {
    // blockReadOnly(id) {
    //   if (!id) return true;
    //   return !scheduler.getEvent(id).readonly;
    // },
    // getData () {
    //   this.$emit('getData');
    // },
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
    }
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
  
  .dhx_scale_bar
    line-height: 15px
  
  .dhx_cal_navline.dhx_cal_date
    color: $tertiary

  .dhx_cal_tab
    color: $tertiary
  
  .dhx_cal_tab.active
    background-color: $light
    color: $tertiary
  
  .dhx_cal_today_button
    color: $tertiary
  
  .dhx_cal_prev_button
    background-image: none
  
  .dhx_cal_next_button
    background-image: none

  .dhx_cancel_btn_set
    background-color: $primary
  
  .header-fixed
    position: fixed
    top: 0px !important

</style>
