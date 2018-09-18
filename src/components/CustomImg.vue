<template>
  <img :src="link" :alt="alt" width="150px" height="150px">
</template>

<script>
import gdrive from '../api/GoogleDrive';
export default {
  name: 'custom-img',
  props: {
    driveId: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      link: ''
    }
  },
  mounted () {
    this.getThumbnailUrl()
  },
  methods: {
    async getThumbnailUrl () {
      try {
        const file = await gdrive.getFileById({ id: this.driveId });
        this.link = file.data.data.file.thumbnailLink;
      } catch (e) {
        console.error(e);
      }
    }
  }
}
</script>
