<template>
  <div>
    <q-uploader ref="up1" :url="`http://localhost:3000/uploader/${$q.cookies.get('user_id')}/drive/uploadFile/`" :headers="{ 'x-access-token': $q.cookies.get('alenvi_token') }"
      name="idCard" :additionalFields="additionalFields"></q-uploader>
    <q-uploader ref="up2" :url="`http://localhost:3000/uploader/${$q.cookies.get('user_id')}/cloudinary/uploadImage/`" :headers="{ 'x-access-token': $q.cookies.get('alenvi_token') }"
      name="picture" multiple :additionalFields="additionalFields"></q-uploader>
  <q-btn @click="upload"></q-btn>
  </div>
</template>

<script>
export default {
  data () {
    return {
      additionalFields: [
        { name: 'fileName', value: 'SUPERTEST' },
        // { name: 'parentFolderId', value: '1d2y74hXo1uyVpcH5AS66MK6VwoicKFCw' },
        // { name: '_id', value: '5a96e9ca1acdebe79b5a425c' }
      ],
    }
  },
  methods: {
    add (file) {
      console.log(file);
    },
    upload () {
      this.$refs.up1.upload();
      this.$refs.up2.upload();
    }
  }
  // methods: {
  //   async getSignedUrl (file) {
  //     try {
  //       console.log(file);
  //       // const contentType = file.type // To send the correct Content-Type
  //       // const fileName = file.name // If you want to use this value to calculate the S3 Key.
  //       const response = await this.$alenviAxios.post(, file) // Your api call to a sever that calculates the signed url.
  //       console.log(response.data);
  //       return response.data
  //     } catch (e) {
  //       console.error(e);
  //     }
  //   }
  // }
}
</script>
