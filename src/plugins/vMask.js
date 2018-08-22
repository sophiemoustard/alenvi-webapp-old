// import something here
import { mask } from 'vue-the-mask';

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {
  Vue.directive('mask', mask);
  // something to do
}
