<template>
  <div style="width: 100vw; height: 100vh">
    <object :data="blobUrl" :name="fileName" type="application/pdf" width="100%" height="100%" />
  </div>
</template>

<script>
export default {
  name: 'DisplayPdf',
  props: {
    fileName: String,
    blobUrl: String,
  },
}
</script>
