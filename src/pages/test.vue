<template>
  <div>
    <div class="row test">
      <croppa v-model="croppa"
      accept="image/*"
      :prevent-white-space="true"
      placeholder="Drag & Drop ici pour choisir le fichier à envoyer"
      :placeholder-font-size="10"
      >
      </croppa>
    </div>
    <q-btn icon="rotate left" @click="croppa.rotate(-1)" flat />
    <q-btn icon="rotate right" @click="croppa.rotate(1)" flat />
    <q-btn icon="cloud upload" @click="upload()" flat />
  </div>
</template>
<script>

import 'vue-croppa/dist/vue-croppa.css'

export default {
  data () {
    return {
      croppa: {}
    }
  },
  methods: {
    async upload () {
      try {
        let blob = await this.croppa.promisedBlob('image/jpeg', 0.8);
        let data = new FormData();
        data.append('fileName', `photo_Sygine_Nsibu`);
        data.append('Content-Type', blob.type || 'application/octet-stream');
        data.append('picture', blob);
        this.$axios.post(`${process.env.API_HOSTNAME}/uploader/5ab8ae2068017d0014993d0c/cloudinary/uploadImage`, data, { headers: { 'content-type': 'multipart/form-data', 'x-access-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTQ3ZDhlZDgyZWI2NzliZTQ4NTJkNjciLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE1MjU0MjUzODIsImV4cCI6MTUyNTUxMTc4Mn0.V2ghHO7VT1463vhm9l1OLcUoccVnBgseEgshxXnzyh4' } });
      } catch (e) {
        console.error(e);
      }
    }
  }
}
</script>
