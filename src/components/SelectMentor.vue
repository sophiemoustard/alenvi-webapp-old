<template>
  <q-select :value="value" color="white" inverted-light :stack-label="stackLabel" ref="selectMentor" @change="updateMentor" @blur="blurHandler" :options="orderedMentors" separator />
</template>

<script>
import _ from 'lodash';

export default {
  name: 'SelectMentor',
  props: ['value', 'icon', 'stackLabel', 'sector'],
  data () {
    return {
      mentors: null
    };
  },
  async mounted () {
    await this.getMentors();
  },
  computed: {
    orderedMentors () {
      return _.sortBy(this.mentors, ['value']);
    }
  },
  methods: {
    async getMentors () {
      try {
        const allMentorsRaw = await this.$users.showAll({ role: 'Auxiliaire', isActive: true, sector: this.sector });
        this.mentors = allMentorsRaw.map(mentor => {
          return {
            label: `${mentor.firstname} ${mentor.lastname}`,
            value: `${mentor.firstname} ${mentor.lastname}`
          }
        })
      } catch (e) {
        console.error(e);
      }
    },
    updateMentor (value) {
      this.$emit('input', value);
    },
    blurHandler () {
      this.$emit('myBlur');
    }
  }
};
</script>
