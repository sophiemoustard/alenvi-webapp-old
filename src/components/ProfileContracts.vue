<template>
  <div>
    TEST
  </div>
</template>

<script>
import * as JSZip from 'jszip';
import * as JSZipUtils from 'jszip-utils';
import * as Docxtemplater from 'docxtemplater';
// import saveAs from 'file-saver';

export default {
  data () {
    return {
    }
  },
  computed: {
    getUser () {
      return this.$store.getters['rh/getUserProfile'];
    }
  },
  async mounted () {
    try {
      const user = await this.$users.getById(this.getUser._id);
      console.log(user);

      JSZipUtils.getBinaryContent('https://docxtemplater.com/tag-example.docx', function (error, content) {
        if (error) { throw error }
        console.log('test');
        const zip = new JSZip(content);
        const doc = new Docxtemplater().loadZip(zip);
        doc.setData({
          first_name: 'John',
          last_name: 'Doe',
          phone: '0650769406',
          description: 'New Website'
        });
        try {
          doc.render();
        } catch (e) {
          console.error(e);
        }
        const out = doc.getZip().generate({
          type: 'blob',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });
        console.log(out);
        // saveAs(out, 'output.docx');
      });
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
  }
};
</script>

<style lang="stylus" scoped>
@import '~variables';
</style>
