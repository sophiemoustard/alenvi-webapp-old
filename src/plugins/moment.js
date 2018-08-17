// import something here
import moment from 'moment'

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {
  // something to do
  moment.locale('fr');
  Vue.prototype.$moment = moment;
}
