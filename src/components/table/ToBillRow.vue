<template>
  <q-tr :props="props"
    :class="{'datatable-row-border-top': index === 0 }">
    <q-td v-for="col in props.cols" :key="col.name" :props="props">
      <template v-if="col.name === 'externalBilling' && bill.thirdPartyPayer">
        <q-checkbox v-model="bill.externalBilling" />
      </template>
      <template v-if="index === 0 && col.name === 'client'">
        {{ getClientName(props.row.customer, bill) }}
      </template>
      <template v-else-if="index === 0 && (col.name === 'startDate' || col.name === 'endDate')">
        <div class="cursor-pointer text-primary">
          {{ formatDate(bill[col.name]) }}
          <q-popover @hide="$emit('datetime:hide')">
            <q-datetime-picker v-model="bill[col.name]" minimal />
          </q-popover>
        </div>
      </template>
      <template v-else-if="col.name === 'service'">{{ bill.subscription.service.versions[bill.subscription.service.versions.length - 1].name }}</template>
      <template v-else-if="col.name === 'hours'">{{ formatHours(bill.hours) }}</template>
      <template v-else-if="col.name === 'unitExclTaxes'">{{ formatPrice(bill.unitExclTaxes) }}</template>
      <template v-else-if="col.name === 'discount'">
        <div class="cursor-pointer text-primary" @click="$emit('discount:click', $refs[bill._id])" v-show="!bill.editDiscount">{{ `${bill.discount}€` }}</div>
        <q-input :ref="bill._id" v-show="bill.editDiscount" class="datatable-inner-input" :value="bill.discount" @input="setDiscount($event, bill)" suffix="€" inverted-light color="white"
          no-parent-field type="number" @blur="disableDiscountEditing(bill)" @keyup.enter="disableDiscountEditing(bill)" @keyup.esc="disableDiscountEditing(bill)" />
      </template>
      <template v-else-if="col.name === 'exclTaxes'">{{ formatPrice(bill.exclTaxes - getExclTaxesDiscount(bill)) }}</template>
      <template v-else-if="col.name === 'inclTaxes'">{{ formatPrice(bill.inclTaxes - bill.discount) }}</template>
      <template v-else-if="index === 0">{{ col.value }}</template>
    </q-td>
    <q-td auto-width>
      <q-checkbox v-if="index === 0 && displayCheckbox" v-model="props.selected" />
    </q-td>
  </q-tr>
</template>

<script>
export default {
  name: 'ToBillRow',
  props: {
    props: Object,
    bill: Object,
    index: { type: Number, default: () => 0 },
    displayCheckbox: { type: Boolean, default: () => false },
  },
  methods: {
    formatPrice (value) {
      return value ? `${parseFloat(value).toFixed(2)}€` : '';
    },
    formatHours (value) {
      return value ? `${parseFloat(value).toFixed(2)}h` : '';
    },
    formatDate (value) {
      return value ? `${this.$moment(value).format('DD/MM/YY')}` : '';
    },
    getClientName (customer, bill) {
      return bill.thirdPartyPayer ? `${bill.thirdPartyPayer.name.substring(0, 35)}...` : customer.identity.lastname;
    },
    getExclTaxesDiscount (bill) {
      return bill.discount / 1 + (bill.vat);
    },
    setDiscount (event, bill) {
      bill.discount = !event || isNaN(event) ? 0 : event;
    },
    disableDiscountEditing (bill) {
      bill.editDiscount = false;
    },
  }
}
</script>
