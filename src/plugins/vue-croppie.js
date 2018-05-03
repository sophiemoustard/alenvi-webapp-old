// import something here
import VueCroppie from 'vue-croppie'
import Croppa from 'vue-croppa'

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {
  Vue.use(VueCroppie);
  Vue.use(Croppa);
}
