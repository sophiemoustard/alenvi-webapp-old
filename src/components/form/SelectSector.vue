<template>
  <q-select :value="value" color="white" :error="myError" inverted-light :stack-label="stackLabel" ref="selectSector"
    @change="updateSector" :options="sectors" @blur="blurHandler" @focus="focusHandler" filter
    filter-placeholder="Rechercher" separator :class="{border: inModal}" :company-id="companyId" />
</template>

<script>

export default {
  name: 'SelectSector',
  props: {
    value: String,
    stackLabel: String,
    myError: { type: String, default: null },
    inModal: { type: Boolean, default: false },
    companyId: String,
    allowNullOption: { type: Boolean, default: false },
  },
  data () {
    return {
      sectors: [],
    };
  },
  async mounted () {
    await this.getSectors();
  },
  computed: {
    currentUser () {
      return this.$store.getters['main/user'];
    },
  },
  methods: {
    async getSectors () {
      try {
        const sectors = await this.$sectors.showAll({ company: this.currentUser.company._id });
        if (this.allowNullOption) sectors.push({ name: 'Toutes les communautés', _id: '' });
        this.sectors = this.$_.sortBy(sectors.map(sector => ({ label: sector.name, value: sector._id })), ['label']);
      } catch (e) {
        console.error(e);
      }
    },
    updateSector (value) {
      this.$emit('input', value);
    },
    blurHandler () {
      this.$emit('blur');
    },
    focusHandler () {
      this.$emit('focus');
    },
  },
};
</script>

<style lang="stylus" scoped>
  @import '~variables'
  .border
    border: 1px solid $light-grey
</style>
