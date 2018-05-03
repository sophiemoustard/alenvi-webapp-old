<template>
  <div padding>
    <vue-croppie ref="croppieRef" :enableOrientation="true" :enableResize="false" :viewport="{ width: 200, height: 200 }" @result="result" @update="update"></vue-croppie>
    <img :src="cropped">
    <button @click="bind()">Bind</button>
    <button @click="rotate(-90)">Rotate Left</button>
    <button @click="rotate(90)">Rotate Right</button>
    <button @click="crop()">Crop Via Callback</button>
    <button @click="cropViaEvent()">Crop Via Event</button>
    <croppa v-model="myCroppa" :prevent-white-space="true"></croppa>
  </div>
</template>
<script>

export default {
  mounted () {
    this.$refs.croppieRef.bind({
      url: 'http://i.imgur.com/Fq2DMeH.jpg',
    })
  },
  data () {
    return {
      cropped: null,
      images: [
        'http://i.imgur.com/fHNtPXX.jpg',
        'http://i.imgur.com/ecMUngU.jpg',
        'http://i.imgur.com/7oO6zrh.jpg',
        'http://i.imgur.com/miVkBH2.jpg'
      ],
      myCroppa: {}
    }
  },
  methods: {
    bind () {
      let url = this.images[Math.floor(Math.random() * 4)];
      this.$refs.croppieRef.bind({
        url
      })
    },
    crop () {
      let options = {
        format: 'jpeg'
      };
      this.$refs.croppieRef.result(options, (output) => {
        this.cropped = output;
        console.log('!encoded', this.cropped);
        console.log('encoded', encodeURI(this.cropped));
      });
    },
    cropViaEvent (options) {
      this.$refs.croppieRef.result(options);
    },
    result (output) {
      this.cropped = output;
    },
    update (val) {
      console.log(val);
    },
    rotate (rotationAngle) {
      this.$refs.croppieRef.rotate(rotationAngle);
    },
    uploadCroppedImage () {
      this.myCroppa.generateBlob(
        blob => {
          // write code to upload the cropped image file (a file is a blob)
        },
        'image/jpeg',
        0.8
      ); // 80% compressed jpeg file
    }
  }
}
</script>
<style lang="stylus" scoped>

</style>
