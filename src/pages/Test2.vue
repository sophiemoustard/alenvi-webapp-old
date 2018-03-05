<template>
  <q-uploader url="http://localhost:3000/uploader/drive/createFile/"
              :headers="{ 'x-access-token': ' eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTQ3ZDhlZDgyZWI2NzliZTQ4NTJkNjciLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE1MjAyNDA5MzYsImV4cCI6MTUyMDMyNzMzNn0.kwp8l62iOdn1oslC8JPLmwZFAqF3zJcN-duClSFET1k'}"
              name="TEST"
              multiple
              :additionalFields="additionalFields"></q-uploader>
</template>

<script>
export default {
  data () {
    return {
      additionalFields: [
        // { name: 'fileName', value: 'SUPERTEST' },
        { name: 'parentFolderId', value: '1d2y74hXo1uyVpcH5AS66MK6VwoicKFCw' },
        { name: '_id', value: '5a96e9ca1acdebe79b5a425c' }
      ],
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
