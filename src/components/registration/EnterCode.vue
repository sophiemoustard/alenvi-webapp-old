<template>
  <div class="row justify-center layout-padding">
    <q-card style="width: 500px">
      <q-card-title>
        Veuillez entrez le code à 4 chiffres
      </q-card-title>
      <q-card-separator />
      <q-card-main class="row justify-center">
        <div class="custom-input on-left" v-for="(box, index) in boxes" :key="index">
          <q-input align="center" inverted @keyup="changeBoxAndMakeCode(index, $event)" :ref="'box' + (index + 1)" type="number" :autofocus="box.autofocus" v-model.number="box.model" max-length="1"></q-input>
        </div>
      </q-card-main>
      <q-card-actions class="row justify-center">
        <q-btn @click="submit" color="primary" :disable="!code">Envoyer</q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
import { QInput, QCard, QCardTitle, QCardMain, QCardSeparator, QCardActions, QBtn } from 'quasar';
import _ from 'lodash';

export default {
  components: {
    QInput,
    QCard,
    QCardTitle,
    QCardMain,
    QCardSeparator,
    QCardActions,
    QBtn
  },
  data() {
    return {
      boxes: [
        {
          model: '',
          autofocus: true
        },
        {
          model: '',
          autofocus: false
        },
        {
          model: '',
          autofocus: false
        },
        {
          model: '',
          autofocus: false
        }
      ],
      code: ''
    }
  },
  methods: {
    changeBoxAndMakeCode (index, event) {
      console.log(event);
      if (index !== (this.boxes.length - 1) && event.code.match(/Digit[0-9]/g)) {
        const newIndex = index + 1;
        this.$refs['box' + (newIndex + 1)][0].focus();
      } else if (index === (this.boxes.length - 1)) {
        this.$refs['box' + this.boxes.length][0].blur();
        for (let i = 0, l = this.boxes.length; i < l; i++) {
          this.code += this.boxes[i].model;
        }
      }
    },
    async submit () {
      
    }
  }
};
</script>

<style lang="stylus" scoped>
@import '~variables';

.custom-input {
  width: 50px;
  height: 50px;
}
</style>
