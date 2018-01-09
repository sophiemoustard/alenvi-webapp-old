<template lang="html">
  <div ref="scheduler_here" class="dhx_cal_container" style='width:100%; height:100%;'>
    <q-window-resize-observable @resize="onResize" />
    <div class="dhx_cal_navline">
      <div @click="getData" class="dhx_cal_prev_button">&nbsp;</div>
      <div @click="getData" class="dhx_cal_next_button">&nbsp;</div>
      <div class="dhx_cal_today_button"></div>
      <div class="dhx_cal_date"></div>
      <div @click="getData" class="dhx_cal_tab" name="day_tab" style="right:204px;"></div>
      <div @click="getData" class="dhx_cal_tab" name="week_tab" style="right:140px;"></div>
      <div @click="getData" class="dhx_cal_tab" name="month_tab" style="right:76px;"></div>
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

import { debounce, QWindowResizeObservable } from 'quasar'

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
  } else {
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
  }
  scheduler.config.lightbox.sections = lightboxSections;
}

export default {
  components: {
    QWindowResizeObservable
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

    scheduler.templates.day_scale_date = date => scheduler.date.date_to_str('%l %j')(date);
    scheduler.templates.week_scale_date = date => scheduler.date.date_to_str('%l %j')(date);
    scheduler.templates.month_scale_date = date => scheduler.date.date_to_str('%l')(date);
    scheduler.templates.hour_scale = function (date) {
      const format = scheduler.date.date_to_str('%H:%i');
      return "<div style='height:44px;line-height:0px'>" + format(date) + '</div>';
    }

    responsive.initResponsive(scheduler);

    // Scheduler initialization
    scheduler.init(this.$refs.scheduler_here, new Date(), 'week');
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
      if (moment(e.end_date).isSameOrBefore(e.start_date)) {
        e.error = true;
      }
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
    getData () {
      this.$emit('getData');
    },
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

<style lang="css">
  @import "~dhtmlx-scheduler/codebase/dhtmlxscheduler.css";
  @import "../../assets/dhtmlxscheduler-responsive.css";

  .dhx_scale_hour {
    border-bottom: none;
    overflow: visible;
  }

  .dhx_cal_data {
    overflow-y: visible;
    overflow-x: visible;
    border-top: none;
    /*padding-top: 10px;*/
  }

  .header-fixed {
    position: fixed;
    top: 0px !important;
  }

</style>
